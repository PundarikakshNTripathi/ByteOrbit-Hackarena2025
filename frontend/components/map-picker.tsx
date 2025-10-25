"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
}

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize map
    const defaultLat = latitude || 28.6139
    const defaultLng = longitude || 77.2090
    
    mapRef.current = L.map(containerRef.current).setView([defaultLat, defaultLng], 13)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current)

    // Add marker
    markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapRef.current)

    // Update coordinates when marker is dragged
    markerRef.current.on("dragend", () => {
      if (markerRef.current) {
        const position = markerRef.current.getLatLng()
        onLocationChange(position.lat, position.lng)
      }
    })

    // Update coordinates when map is clicked
    mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
      if (markerRef.current && mapRef.current) {
        markerRef.current.setLatLng(e.latlng)
        onLocationChange(e.latlng.lat, e.latlng.lng)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update marker position when latitude/longitude props change
  useEffect(() => {
    if (markerRef.current && mapRef.current && latitude && longitude) {
      const newLatLng = L.latLng(latitude, longitude)
      markerRef.current.setLatLng(newLatLng)
      mapRef.current.setView(newLatLng, mapRef.current.getZoom())
    }
  }, [latitude, longitude])

  return <div ref={containerRef} className="w-full h-full" />
}
