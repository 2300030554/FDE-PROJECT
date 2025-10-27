"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation, MapPin, Clock, Zap, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const routes = [
  {
    id: "ROUTE-001",
    ambulance: "AMB-001",
    from: "Station A",
    to: "Central Hospital",
    distance: 4.2,
    estimatedTime: 8,
    optimizedTime: 6,
    savings: 2,
    status: "active",
    traffic: "moderate",
  },
  {
    id: "ROUTE-002",
    ambulance: "AMB-003",
    from: "Station C",
    to: "Emergency Care",
    distance: 3.8,
    estimatedTime: 7,
    optimizedTime: 5,
    savings: 2,
    status: "active",
    traffic: "light",
  },
  {
    id: "ROUTE-003",
    ambulance: "AMB-005",
    from: "Station E",
    to: "Trauma Center",
    distance: 5.1,
    estimatedTime: 10,
    optimizedTime: 7,
    savings: 3,
    status: "pending",
    traffic: "heavy",
  },
]

export default function RouteOptimizer() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Route Optimizer</h1>
        <p className="text-muted-foreground">AI-powered route optimization for faster response times</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Time Saved</p>
              <p className="text-3xl font-bold text-foreground">47 min</p>
              <p className="text-xs text-green-600 mt-2">This week</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Optimization</p>
              <p className="text-3xl font-bold text-foreground">23%</p>
              <p className="text-xs text-green-600 mt-2">Faster routes</p>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Routes</p>
              <p className="text-3xl font-bold text-foreground">12</p>
              <p className="text-xs text-blue-600 mt-2">Being optimized</p>
            </div>
            <Navigation className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Routes List */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Routes</h2>
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{route.id}</p>
                  <p className="text-sm text-muted-foreground">{route.ambulance}</p>
                </div>
                <Badge variant={route.status === "active" ? "default" : "secondary"}>
                  {route.status === "active" ? "Active" : "Pending"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="text-sm font-medium text-foreground">
                      {route.from} → {route.to}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-medium text-foreground">{route.distance} km</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-card rounded border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Standard Time</p>
                  <p className="text-lg font-bold text-foreground">{route.estimatedTime} min</p>
                </div>
                <div className="p-3 bg-card rounded border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Optimized Time</p>
                  <p className="text-lg font-bold text-blue-600">{route.optimizedTime} min</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded border border-green-500/30">
                  <p className="text-xs text-green-600 mb-1">Time Saved</p>
                  <p className="text-lg font-bold text-green-600">{route.savings} min</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${route.traffic === "light" ? "bg-green-500" : route.traffic === "moderate" ? "bg-orange-500" : "bg-red-500"}`}
                  />
                  <span className="text-sm text-muted-foreground capitalize">{route.traffic} traffic</span>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Tips */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Optimization Recommendations</h2>
        <div className="space-y-3">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm font-medium text-blue-600 mb-1">Peak Hour Strategy</p>
            <p className="text-sm text-muted-foreground">
              Consider pre-positioning ambulances in Zone A during 12-16:00 window for 15% faster response
            </p>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <p className="text-sm font-medium text-orange-600 mb-1">Traffic Pattern</p>
            <p className="text-sm text-muted-foreground">
              Route via Highway 5 instead of Main Street saves 3-4 minutes during rush hours
            </p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-sm font-medium text-green-600 mb-1">Hospital Load Balancing</p>
            <p className="text-sm text-muted-foreground">
              Distribute incoming patients to Emergency Care (32 beds) instead of Central Medical (45 beds full)
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
