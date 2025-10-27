"use client"

import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertTriangle, Zap } from "lucide-react"

const predictionData = [
  { hour: "0", predicted: 12, actual: 11, confidence: 0.95 },
  { hour: "1", predicted: 10, actual: 9, confidence: 0.93 },
  { hour: "2", predicted: 8, actual: 8, confidence: 0.97 },
  { hour: "3", predicted: 7, actual: 7, confidence: 0.96 },
  { hour: "4", predicted: 9, actual: 10, confidence: 0.91 },
  { hour: "5", predicted: 15, actual: 14, confidence: 0.89 },
  { hour: "6", predicted: 22, actual: 23, confidence: 0.88 },
  { hour: "7", predicted: 28, actual: 27, confidence: 0.92 },
]

const hotspotData = [
  { zone: "Zone A", x: 40.7128, y: -74.006, incidents: 45, severity: "high" },
  { zone: "Zone B", x: 40.758, y: -73.9855, incidents: 32, severity: "medium" },
  { zone: "Zone C", x: 40.7489, y: -73.968, incidents: 28, severity: "medium" },
  { zone: "Zone D", x: 40.7614, y: -73.9776, incidents: 18, severity: "low" },
  { zone: "Zone E", x: 40.7505, y: -73.9934, incidents: 22, severity: "low" },
]

const alerts = [
  { id: 1, type: "High Demand", zone: "Zone A", time: "2 min ago", severity: "high" },
  { id: 2, type: "Low Availability", zone: "Zone B", time: "5 min ago", severity: "medium" },
  { id: 3, type: "Predicted Surge", zone: "Zone C", time: "8 min ago", severity: "medium" },
]

export default function PredictionPanel() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Predictions</h1>
        <p className="text-muted-foreground">ML-powered demand forecasting and hotspot detection</p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-4 bg-card border-border">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`w-5 h-5 flex-shrink-0 ${alert.severity === "high" ? "text-red-500" : "text-orange-500"}`}
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{alert.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.zone}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Prediction Chart */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Hourly Demand Prediction</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend />
            <Area type="monotone" dataKey="predicted" stroke="#f97316" fillOpacity={1} fill="url(#colorPredicted)" />
            <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Confidence Score */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Prediction Confidence</h2>
        <div className="space-y-3">
          {predictionData.map((item) => (
            <div key={item.hour} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hour {item.hour}</span>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    style={{ width: `${item.confidence * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{(item.confidence * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Hotspot Analysis */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Incident Hotspots</h2>
        <div className="space-y-3">
          {hotspotData.map((hotspot) => (
            <div
              key={hotspot.zone}
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Zap
                  className={`w-5 h-5 ${hotspot.severity === "high" ? "text-red-500" : hotspot.severity === "medium" ? "text-orange-500" : "text-yellow-500"}`}
                />
                <div>
                  <p className="font-semibold text-foreground">{hotspot.zone}</p>
                  <p className="text-xs text-muted-foreground">{hotspot.incidents} incidents this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{hotspot.incidents}</p>
                  <p className="text-xs text-muted-foreground capitalize">{hotspot.severity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
