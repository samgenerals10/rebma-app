'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LOADS } from '@/app/dashboard/dispatch/tracking/page'

// Auto-center map on selected load
function MapController({ selectedLoadId }: { selectedLoadId: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedLoadId) {
      const load = LOADS.find(l => l.id === selectedLoadId)
      if (load) {
        // Find midpoint
        const midLat = (load.lat + load.destLat) / 2
        const midLng = (load.lng + load.destLng) / 2
        map.setView([midLat, midLng], 12, { animate: true })
      }
    }
  }, [selectedLoadId, map])
  return null
}

export default function LiveMap({ selectedLoadId, mapStyle = 'map' }: { selectedLoadId: string | null, mapStyle?: 'map' | 'satellite' }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Simple animation loop to make the marker pulse or slightly move
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress(prev => (prev + 1) % 100)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Icon definitions matching the UI image
  const getSelectedVehicleIcon = (speed: number) => {
    let speedColor = '#10b981' // Green (Normal)
    if (speed > 80) speedColor = '#ef4444' // Red (Overspeeding)
    else if (speed < 40 && speed > 0) speedColor = '#f59e0b' // Orange (Underspeeding)
    else if (speed === 0) speedColor = '#6b7280' // Gray (Parked)

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative;">
          <div style="position: absolute; top: -28px; left: 50%; transform: translateX(-50%); background: ${speedColor}; color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${speed} km/h
          </div>
          <div style="background-color: #3b82f6; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.2); border: 2px solid white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    })
  }

  const otherVehicleIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: #1f2937; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })

  const hubIcon = L.divIcon({
    className: 'hub-icon',
    html: `
      <div style="background-color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 4px solid #1f2937;">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  return (
    <div className="relative w-full h-full z-0 bg-[#e5e3df]">
      <MapContainer 
        center={[5.6037, -0.1870]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={mapStyle === 'map' ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
        />
        
        <MapController selectedLoadId={selectedLoadId} />

        {/* Draw unselected loads as small black icons */}
        {LOADS.map(load => {
          if (load.id === selectedLoadId) return null
          
          // Calculate an arbitrary current position based on its static progress
          const lat = load.lat + (load.destLat - load.lat) * (load.progress / 100)
          const lng = load.lng + (load.destLng - load.lng) * (load.progress / 100)
          
          return (
            <Marker key={load.id} position={[lat, lng]} icon={otherVehicleIcon} />
          )
        })}

        {/* Draw Selected Load */}
        {LOADS.map(load => {
          if (load.id !== selectedLoadId) return null

          // Generate a fake curved route path using intermediate points to look realistic
          const mid1Lat = load.lat + (load.destLat - load.lat) * 0.3 + 0.01
          const mid1Lng = load.lng + (load.destLng - load.lng) * 0.3 - 0.02
          const mid2Lat = load.lat + (load.destLat - load.lat) * 0.7 - 0.015
          const mid2Lng = load.lng + (load.destLng - load.lng) * 0.7 + 0.01
          
          const fullPath: [number, number][] = [
            [load.lat, load.lng],
            [mid1Lat, mid1Lng],
            [mid2Lat, mid2Lng],
            [load.destLat, load.destLng]
          ]

          // The current position along the path
          let currentPos: [number, number]
          if (load.progress === 0) currentPos = [load.lat, load.lng]
          else if (load.progress === 100) currentPos = [load.destLat, load.destLng]
          else {
            currentPos = [mid1Lat, mid1Lng] // simplify for UI visualization
          }

          // Path split: solid blue for completed, dashed gray for upcoming
          const completedPath = [fullPath[0], fullPath[1]]
          const remainingPath = [fullPath[1], fullPath[2], fullPath[3]]

          return (
            <div key={`selected-${load.id}`}>
              {/* Completed Route (Solid Blue) */}
              <Polyline positions={completedPath} color="#3b82f6" weight={4} opacity={0.9} />
              
              {/* Remaining Route (Dashed dark gray) */}
              <Polyline positions={remainingPath} color="#4b5563" weight={3} opacity={0.8} dashArray="6, 8" />

              {/* Start Hub */}
              <Marker position={[load.lat, load.lng]} icon={hubIcon}>
                <Popup className="custom-popup" closeButton={false}>
                  <div className="font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap text-xs border border-gray-100 flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-[8px]">↑</div>
                    {load.from}
                  </div>
                </Popup>
              </Marker>

              {/* End Hub */}
              <Marker position={[load.destLat, load.destLng]} icon={hubIcon}>
                <Popup className="custom-popup" closeButton={false}>
                  <div className="font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap text-xs border border-gray-100 flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-[8px]">↓</div>
                    {load.to}
                  </div>
                </Popup>
              </Marker>

              {/* Current Vehicle Position */}
              <Marker position={currentPos} icon={getSelectedVehicleIcon(load.speed)} zIndexOffset={1000} />
            </div>
          )
        })}

      </MapContainer>

      {/* Global CSS for Leaflet Overrides to match Dribbble design */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}} />
    </div>
  )
}
