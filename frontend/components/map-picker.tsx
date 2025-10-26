"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"

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

interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker position when latitude/longitude props change
  useEffect(() => {
    if (markerRef.current && mapRef.current && latitude && longitude) {
      const newLatLng = L.latLng(latitude, longitude)
      markerRef.current.setLatLng(newLatLng)
      mapRef.current.setView(newLatLng, mapRef.current.getZoom())
    }
  }, [latitude, longitude, onLocationChange])

  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setShowResults(false)
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in`
      )
      const data = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectLocation = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], 15)
      onLocationChange(lat, lng)
      setShowResults(false)
      setSearchQuery(result.display_name)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation()
    }
  }

  return (
    <div className="w-full h-full relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for a location (e.g., Connaught Place, Delhi)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-background shadow-lg"
          />
          <Button 
            onClick={searchLocation} 
            disabled={isSearching}
            className="shadow-lg"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="bg-background border rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => selectLocation(result)}
                className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
              >
                <div className="text-sm font-medium">{result.display_name}</div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && (
          <div className="bg-background border rounded-lg shadow-xl p-4 text-center text-muted-foreground">
            No locations found. Try a different search.
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
