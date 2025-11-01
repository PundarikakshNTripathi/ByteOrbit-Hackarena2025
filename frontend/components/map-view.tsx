"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Complaint } from "@/lib/supabase"
import Link from "next/link"

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapViewProps {
  complaints: Complaint[]
}

export function MapView({ complaints }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "#22c55e" // green
      case "in_progress":
        return "#eab308" // yellow
      case "escalated":
        return "#ef4444" // red
      default:
        return "#3b82f6" // blue
    }
  }

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    })
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize map centered on India (Delhi)
    mapRef.current = L.map(containerRef.current).setView([28.6139, 77.2090], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (complaints.length === 0) return

    // Filter complaints with valid coordinates
    const validComplaints = complaints.filter((c) => {
      const lat = parseFloat(String(c.latitude))
      const lng = parseFloat(String(c.longitude))
      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      )
    })

    if (validComplaints.length === 0) return

    // Add markers for each complaint
    validComplaints.forEach((complaint) => {
      if (!mapRef.current) return

      const icon = createCustomIcon(getMarkerColor(complaint.status))
      const marker = L.marker([complaint.latitude, complaint.longitude], { icon })
        .addTo(mapRef.current)

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${complaint.category || 'Issue'}</h3>
          ${complaint.image_url ? `<img src="${complaint.image_url}" alt="Issue" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ""}
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${(complaint.user_description || complaint.description || 'No description').substring(0, 100)}${(complaint.user_description || complaint.description || '').length > 100 ? "..." : ""}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="font-size: 12px; padding: 2px 8px; background-color: ${getMarkerColor(complaint.status)}; color: white; border-radius: 4px; text-transform: capitalize;">${complaint.status.replace(/_/g, " ")}</span>
            <a href="/complaint/${complaint.id}" style="color: #3b82f6; font-size: 14px; text-decoration: none; font-weight: 500;">View Details →</a>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (validComplaints.length > 0) {
      const bounds = L.latLngBounds(
        validComplaints.map((c) => [c.latitude, c.longitude])
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [complaints])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur p-4 rounded-lg shadow-lg border z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
            <span className="text-xs">Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#eab308" }}></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
            <span className="text-xs">Escalated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
            <span className="text-xs">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  )
}
