"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  AlertCircle,
  Zap,
  Settings,
  Disc2 as Dispatch,
  X,
  CheckCircle,
  Loader,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const initialAmbulances = [
  {
    id: "AMB-001",
    lat: 40.7128,
    lng: -74.006,
    status: "available",
    zone: "Zone A",
    responseTime: 4.2,
    driver: "John Smith",
    vehicle: "Type A",
  },
  {
    id: "AMB-002",
    lat: 40.758,
    lng: -73.9855,
    status: "on-call",
    zone: "Zone B",
    responseTime: 5.8,
    driver: "Sarah Johnson",
    vehicle: "Type B",
  },
  {
    id: "AMB-003",
    lat: 40.7489,
    lng: -73.968,
    status: "available",
    zone: "Zone C",
    responseTime: 3.5,
    driver: "Mike Davis",
    vehicle: "Type A",
  },
  {
    id: "AMB-004",
    lat: 40.7614,
    lng: -73.9776,
    status: "on-call",
    zone: "Zone D",
    responseTime: 6.2,
    driver: "Emma Wilson",
    vehicle: "Type C",
  },
  {
    id: "AMB-005",
    lat: 40.7505,
    lng: -73.9934,
    status: "available",
    zone: "Zone E",
    responseTime: 4.9,
    driver: "Alex Brown",
    vehicle: "Type B",
  },
]

const hospitals = [
  { id: "HOSP-001", name: "Central Medical", lat: 40.7505, lng: -73.9934, beds: 45, emergency: true },
  { id: "HOSP-002", name: "Emergency Care", lat: 40.7614, lng: -73.9776, beds: 32, emergency: true },
  { id: "HOSP-003", name: "Trauma Center", lat: 40.7128, lng: -74.006, beds: 28, emergency: true },
]

export default function AmbulanceMap() {
  const [ambulances, setAmbulances] = useState(initialAmbulances)
  const [selectedAmbulance, setSelectedAmbulance] = useState<(typeof initialAmbulances)[0] | null>(null)
  const [mapZoom, setMapZoom] = useState(12)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{ type: string; message: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((amb) => ({
          ...amb,
          lat: amb.lat + (Math.random() - 0.5) * 0.001,
          lng: amb.lng + (Math.random() - 0.5) * 0.001,
          responseTime: Math.max(2, amb.responseTime + (Math.random() - 0.5) * 0.5),
        })),
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleCallAmbulance = async () => {
    setLoadingAction("call")
    setTimeout(() => {
      setActionFeedback({ type: "success", message: "Ambulance requested successfully! ETA: 4-6 minutes" })
      setLoadingAction(null)
      setTimeout(() => setActionFeedback(null), 3000)
    }, 1500)
  }

  const handleDispatch = async () => {
    if (!selectedAmbulance) return
    setLoadingAction("dispatch")
    setTimeout(() => {
      setAmbulances((prev) =>
        prev.map((amb) => (amb.id === selectedAmbulance.id ? { ...amb, status: "on-call" as const } : amb)),
      )
      setActionFeedback({ type: "success", message: `${selectedAmbulance.id} dispatched to location` })
      setLoadingAction(null)
      setTimeout(() => setActionFeedback(null), 3000)
    }, 1500)
  }

  const handleCancelDispatch = async () => {
    if (!selectedAmbulance) return
    setLoadingAction("cancel")
    setTimeout(() => {
      setAmbulances((prev) =>
        prev.map((amb) => (amb.id === selectedAmbulance.id ? { ...amb, status: "available" as const } : amb)),
      )
      setActionFeedback({ type: "info", message: `${selectedAmbulance.id} dispatch cancelled` })
      setLoadingAction(null)
      setTimeout(() => setActionFeedback(null), 3000)
    }, 1500)
  }

  const handleEmergencyAlert = async () => {
    setLoadingAction("emergency")
    setTimeout(() => {
      setActionFeedback({ type: "error", message: "Emergency alert sent to all available units!" })
      setLoadingAction(null)
      setTimeout(() => setActionFeedback(null), 4000)
    }, 1500)
  }

  const handleRouteOptimization = async () => {
    setLoadingAction("route")
    setTimeout(() => {
      setActionFeedback({ type: "success", message: "Route optimized! Estimated time saved: 23%" })
      setLoadingAction(null)
      setTimeout(() => setActionFeedback(null), 3000)
    }, 1500)
  }

  const availableCount = ambulances.filter((a) => a.status === "available").length
  const onCallCount = ambulances.filter((a) => a.status === "on-call").length

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Live Map</h1>
          <p className="text-muted-foreground">Real-time ambulance and hospital tracking</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showHeatmap ? "default" : "outline"}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            {showHeatmap ? "Hide" : "Show"} Heatmap
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)} className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-lg border flex items-center justify-between ${
            actionFeedback.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-700"
              : actionFeedback.type === "error"
                ? "bg-red-500/10 border-red-500 text-red-700"
                : "bg-blue-500/10 border-blue-500 text-blue-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {actionFeedback.message}
          </span>
          <button onClick={() => setActionFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-1">Available</p>
          <p className="text-2xl font-bold text-green-500">{availableCount}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-1">On Call</p>
          <p className="text-2xl font-bold text-orange-500">{onCallCount}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
          <p className="text-2xl font-bold text-blue-500">
            {(ambulances.reduce((sum, a) => sum + a.responseTime, 0) / ambulances.length).toFixed(1)} min
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-1">Hospitals</p>
          <p className="text-2xl font-bold text-purple-500">{hospitals.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="lg:col-span-2 p-6 bg-card border-border h-96 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Map View</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setMapZoom(Math.max(8, mapZoom - 1))}>
                −
              </Button>
              <span className="px-3 py-1 text-sm text-muted-foreground">{mapZoom}x</span>
              <Button size="sm" variant="outline" onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}>
                +
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {showHeatmap && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 opacity-30" />
              )}
            </div>
            <div className="relative z-10 text-center">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive map integration</p>
              <p className="text-sm text-muted-foreground mt-2">Ready for Google Maps/Mapbox API</p>
              <p className="text-xs text-muted-foreground mt-4">
                Zoom: {mapZoom}x | {ambulances.length} ambulances tracked
              </p>
            </div>
          </div>
        </Card>

        {/* Legend & Controls */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Legend</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-foreground">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm text-foreground">On Call</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                <span className="text-sm text-foreground">Hospital</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent hover:bg-orange-500/10"
                  onClick={handleCallAmbulance}
                  disabled={loadingAction === "call"}
                >
                  {loadingAction === "call" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                  Call Ambulance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent hover:bg-blue-500/10"
                  onClick={handleRouteOptimization}
                  disabled={loadingAction === "route"}
                >
                  {loadingAction === "route" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  Route Optimization
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent hover:bg-red-500/10"
                  onClick={handleEmergencyAlert}
                  disabled={loadingAction === "emergency"}
                >
                  {loadingAction === "emergency" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  Emergency Alert
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Ambulances List */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Ambulances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambulances.map((ambulance) => (
            <div
              key={ambulance.id}
              onClick={() => setSelectedAmbulance(ambulance)}
              className={`p-4 rounded-lg border cursor-pointer transition ${
                selectedAmbulance?.id === ambulance.id
                  ? "bg-orange-500/10 border-orange-500"
                  : "bg-background border-border hover:border-orange-500/50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{ambulance.id}</p>
                  <p className="text-xs text-muted-foreground">{ambulance.driver}</p>
                </div>
                <Badge variant={ambulance.status === "available" ? "default" : "secondary"}>
                  {ambulance.status === "available" ? "Available" : "On Call"}
                </Badge>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{ambulance.zone}</span>
                  <span className="text-foreground font-medium">{ambulance.vehicle}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {ambulance.responseTime.toFixed(1)} min response
                </div>
              </div>
              {selectedAmbulance?.id === ambulance.id && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  {ambulance.status === "available" ? (
                    <Button
                      size="sm"
                      className="flex-1 gap-1 bg-orange-500 hover:bg-orange-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDispatch()
                      }}
                      disabled={loadingAction === "dispatch"}
                    >
                      {loadingAction === "dispatch" ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Dispatch className="w-3 h-3" />
                      )}
                      Dispatch
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelDispatch()
                      }}
                      disabled={loadingAction === "cancel"}
                    >
                      {loadingAction === "cancel" ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Hospitals */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Hospital Network</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{hospital.name}</p>
                  <p className="text-xs text-muted-foreground">{hospital.id}</p>
                </div>
                {hospital.emergency && <Badge className="bg-red-500">Emergency</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{hospital.beds} beds</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-muted-foreground hover:text-orange-500"
                  onClick={() => {
                    setActionFeedback({ type: "success", message: `Calling ${hospital.name}...` })
                    setTimeout(() => setActionFeedback(null), 2000)
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showSettings && (
        <Card className="p-6 bg-card border-border fixed bottom-8 right-8 w-80 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-background rounded">
              <span className="text-sm text-foreground">Real-time Updates</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-2 bg-background rounded">
              <span className="text-sm text-foreground">Sound Alerts</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-2 bg-background rounded">
              <span className="text-sm text-foreground">Show Heatmap</span>
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-background rounded">
              <span className="text-sm text-foreground">Auto-dispatch</span>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
