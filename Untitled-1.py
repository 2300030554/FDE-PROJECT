

import re
import io
import json
from typing import List, Dict, Any, Tuple

import streamlit as st
import pandas as pd

# PDF and image processing
from pdf2image import convert_from_bytes
import pytesseract
from PyPDF2 import PdfReader

# Transformers for simple NER and zero-shot classification
from transformers import pipeline

st.set_page_config(page_title="B2B Contract Risk Highlighter", layout='wide')

@st.cache_resource
def load_models():
    # NER pipeline (will download a default model on first run)
    ner = pipeline('ner', aggregation_strategy='simple')
    # Zero-shot classifier for clause categorization (helps when keywords are insufficient)
    zsc = pipeline('zero-shot-classification')
    return ner, zsc

ner_pipeline, zsc_pipeline = load_models()

# Clause categories and seed keywords
CLAUSE_CATEGORIES = {
    'Payment': ['payment', 'payable', 'invoice', 'due within', 'net', 'currency', 'bank transfer', 'remit'],
    'Penalty': ['penalty', 'liquidated damages', 'fine', 'late fee', 'late payment', 'interest'],
    'SLA': ['service level', 'uptime', 'downtime', 'response time', 'availability', 'sla'],
    'Liability': ['liability', 'indemnif', 'indemnify', 'hold harmless', 'loss', 'damages'],
    'Confidentiality': ['confidential', 'non-disclosure', 'nda', 'proprietary', 'privacy'],
    'Termination': ['terminate', 'termination', 'breach', 'cause', 'without cause', 'with cause'],
}

# Risk scoring heuristics (simple, transparent rules)
RISK_KEYWORDS_HIGH = ['termination', 'liquidated damages', 'unilateral', 'breach', 'indemnify', 'hold harmless', 'penalty']
RISK_KEYWORDS_MEDIUM = ['late fee', 'interest', 'delay penalties', 'service level', 'uptime', 'availability']
RISK_KEYWORDS_LOW = ['payment within', 'invoice', 'net', 'currency']

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Try direct PDF text extraction first, otherwise fall back to OCR on pages."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
        joined = '\n\n'.join(text).strip()
        if len(joined) > 50:
            return joined
    except Exception:
        # fall through to OCR
        pass

    # Fallback: render pages as images and OCR
    images = convert_from_bytes(file_bytes)
    pages_text = []
    for img in images:
        pages_text.append(pytesseract.image_to_string(img))
    return '\n\n'.join(pages_text)

# Simple clause splitter: split by double newlines or semicolons or sentence boundaries
SENTENCE_END_RE = re.compile(r'(?<=[\.\?\!;])\s+(?=[A-Z0-9])')

def split_into_clauses(text: str) -> List[str]:
    # Normalize whitespace
    text = re.sub(r'\r\n', '\n', text)
    blocks = [b.strip() for b in text.split('\n\n') if b.strip()]
    clauses = []
    for block in blocks:
        # further split by semicolon/newline and sentence boundaries
        parts = re.split(r';|\n', block)
        for p in parts:
            p = p.strip()
            if not p:
                continue
            # split into sentences
            sents = SENTENCE_END_RE.split(p)
            for s in sents:
                s = s.strip()
                if s:
                    clauses.append(s)
    # Deduplicate nearby duplicates
    final = []
    for c in clauses:
        if not final or len(c) > 20 and c not in final[-2:]:
            final.append(c)
    return final


def keyword_category_match(clause: str) -> Dict[str, float]:
    """Return candidate categories and scores by keyword overlap."""
    clause_lower = clause.lower()
    scores = {}
    for cat, kws in CLAUSE_CATEGORIES.items():
        hits = sum(1 for kw in kws if kw in clause_lower)
        if hits:
            scores[cat] = float(hits)
    return scores


def zero_shot_category(clause: str, candidate_labels: List[str]) -> Tuple[str, float]:
    try:
        out = zsc_pipeline(clause, candidate_labels, multi_label=False)
        # out is a dict with 'labels' and 'scores'
        return out['labels'][0], float(out['scores'][0])
    except Exception:
        return 'Other', 0.0


def ner_features(clause: str) -> Dict[str, Any]:
    try:
        ents = ner_pipeline(clause)
        # gather MONEY and DATE counts
        money = [e for e in ents if e['entity_group'].upper() in ('MISC', 'MONEY') or '£' in e['word'] or '$' in e['word']]
        dates = [e for e in ents if e['entity_group'].upper() in ('DATE',)]
        return {'ner_count': len(ents), 'money_count': len(money), 'date_count': len(dates), 'ents': ents}
    except Exception:
        return {'ner_count': 0, 'money_count': 0, 'date_count': 0, 'ents': []}


def score_risk(clause: str, category: str, ner: Dict[str, Any]) -> Tuple[str, int, List[str]]:
    """Return risk label (High/Medium/Low), numeric score (0-100), and reasons."""
    reasons = []
    score = 0
    l = clause.lower()
    # keyword boosts
    for kw in RISK_KEYWORDS_HIGH:
        if kw in l:
            score += 40
            reasons.append(f'Contains high-risk keyword: "{kw}"')
    for kw in RISK_KEYWORDS_MEDIUM:
        if kw in l:
            score += 20
            reasons.append(f'Contains medium-risk keyword: "{kw}"')
    for kw in RISK_KEYWORDS_LOW:
        if kw in l:
            score += 5
            reasons.append(f'Contains low-risk keyword: "{kw}"')
    # category-based adjustments
    if category in ('Liability', 'Termination', 'Penalty'):
        score += 20
        reasons.append(f'Clause category "{category}" raises baseline risk')
    if ner.get('money_count', 0) > 0:
        score += 15
        reasons.append('Monetary amounts detected')
    if ner.get('date_count', 0) > 0:
        score += 5
        reasons.append('Dates detected (deadlines, terms)')
    # clamp
    score = max(0, min(100, score))
    if score >= 60:
        label = 'High'
    elif score >= 30:
        label = 'Medium'
    else:
        label = 'Low'
    return label, score, reasons


def categorize_clause(clause: str) -> Tuple[str, float, List[str]]:
    # keyword match first
    kw_scores = keyword_category_match(clause)
    if kw_scores:
        # choose highest
        cat = max(kw_scores.items(), key=lambda x: x[1])[0]
        conf = kw_scores[cat] / (sum(kw_scores.values()) + 1)
        return cat, float(conf), list(kw_scores.keys())
    # fallback to zero-shot
    labels = list(CLAUSE_CATEGORIES.keys()) + ['Other']
    label, conf = zero_shot_category(clause, labels)
    return label, conf, []


# Streamlit UI
st.title('B2B Contract Clause Extractor & Risk Highlighter')
st.markdown('Upload a contract PDF (or plain-text file). The app will extract clauses, classify them, and assign a risk level.')

with st.sidebar:
    st.header('Options')
    show_ner = st.checkbox('Show detected entities (NER)', value=False)
    download_json = st.checkbox('Offer JSON download', value=True)

uploaded = st.file_uploader('Upload contract PDF / TXT / DOCX / image', type=['pdf', 'txt', 'png', 'jpg', 'jpeg'])

if uploaded is not None:
    file_bytes = uploaded.read()
    with st.spinner('Extracting text (this may take a few seconds the first time)...'):
        try:
            text = extract_text_from_pdf(file_bytes)
        except Exception as e:
            st.error(f'Failed to extract text: {e}')
            text = ''

    if not text.strip():
        st.error('No text could be extracted from the file. Try a higher-resolution PDF or enable OCR.')
    else:
        st.subheader('Raw extracted text (first 4000 chars)')
        st.code(text[:4000] + ('\n... (truncated)' if len(text) > 4000 else ''))

        clauses = split_into_clauses(text)
        st.info(f'Found {len(clauses)} clauses/segments')

        rows = []
        highlighted_html = []
        for i, clause in enumerate(clauses, 1):
            cat, cat_conf, cat_evidence = categorize_clause(clause)
            ner = ner_features(clause)
            risk_label, risk_score, reasons = score_risk(clause, cat, ner)
            rows.append({
                'id': i,
                'clause': clause,
                'category': cat,
                'category_confidence': round(cat_conf, 3),
                'risk_label': risk_label,
                'risk_score': risk_score,
                'reasons': '; '.join(reasons),
                'ner_entities': json.dumps(ner.get('ents', []))
            })
            color = 'lightgreen' if risk_label == 'Low' else ('#ffcc66' if risk_label == 'Medium' else '#ff9999')
            # simple HTML block for visual highlighting
            highlighted_html.append(f"<div style='padding:8px;border-radius:6px;margin-bottom:6px;background:{color};'><strong>{risk_label} ({risk_score})</strong> — <em>{cat}</em><div style='margin-top:6px'>{clause}</div></div>")

        df = pd.DataFrame(rows)

        # Display highlights in a two-column layout: left = highlights, right = table and details
        left, right = st.columns([2,3])
        with left:
            st.subheader('Highlighted clauses')
            for block in highlighted_html:
                st.markdown(block, unsafe_allow_html=True)

        with right:
            st.subheader('Structured Risk Summary')
            st.dataframe(df[['id','risk_label','risk_score','category','category_confidence','reasons']].sort_values(by='risk_score', ascending=False), use_container_width=True)

            # allow filtering
            st.markdown('---')
            st.markdown('Download results')
            csv = df.to_csv(index=False)
            st.download_button('Download CSV', data=csv, file_name='contract_risk_summary.csv', mime='text/csv')
            if download_json:
                st.download_button('Download JSON', data=df.to_json(orient='records', force_ascii=False), file_name='contract_risk_summary.json', mime='application/json')

        st.markdown('---')
        st.subheader('Clause details')
        sel_id = st.number_input('Select clause id to inspect', min_value=1, max_value=len(clauses), value=1)
        sel_row = df[df['id'] == int(sel_id)].iloc[0]
        st.markdown(f"**Clause #{sel_row['id']} — Risk: {sel_row['risk_label']} ({sel_row['risk_score']}) — Category: {sel_row['category']}**")
        st.write(sel_row['clause'])
        st.write('Reasons:', sel_row['reasons'])
        if show_ner:
            st.write('NER entities:')
            try:
                st.json(json.loads(sel_row['ner_entities']))
            except Exception:
                st.write(sel_row['ner_entities'])

        st.success('Analysis complete. Review the highlighted clauses and download the Risk Summary Report.')

else:
    st.info('Upload a contract (PDF/TXT/image) to begin. Example: vendor_contract.pdf')

# End of app
