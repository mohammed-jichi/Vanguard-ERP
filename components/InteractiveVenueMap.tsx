'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveVenueMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function InteractiveVenueMap({
  lat,
  lng,
  onChange,
  className = 'h-72 w-full rounded border border-slate-300'
}: InteractiveVenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const isInternalMoveRef = useRef<boolean>(false);

  // Default fallback center: Beirut / Lebanon (33.8938, 35.5018)
  const effectiveLat = lat ?? 33.8938;
  const effectiveLng = lng ?? 35.5018;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Inject Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Dynamic import leaflet to prevent SSR issues
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Fix Leaflet's default icon URLs
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [effectiveLat, effectiveLng],
        zoom: lat && lng ? 14 : 10,
        zoomControl: false // Custom controls
      });
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add draggable marker
      const marker = L.marker([effectiveLat, effectiveLng], {
        icon: customIcon,
        draggable: true
      }).addTo(map);
      markerInstanceRef.current = marker;

      // Handle marker dragend
      marker.on('dragend', (event: any) => {
        const newLatLng = event.target.getLatLng();
        isInternalMoveRef.current = true;
        onChange(Number(newLatLng.lat.toFixed(6)), Number(newLatLng.lng.toFixed(6)));
      });

      // Handle click on map to reposition marker
      map.on('click', (e: any) => {
        const { lat: clickedLat, lng: clickedLng } = e.latlng;
        marker.setLatLng([clickedLat, clickedLng]);
        isInternalMoveRef.current = true;
        onChange(Number(clickedLat.toFixed(6)), Number(clickedLng.toFixed(6)));
      });

      // Force resize after render
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when external lat/lng changes
  useEffect(() => {
    if (isInternalMoveRef.current) {
      isInternalMoveRef.current = false;
      return;
    }

    if (mapInstanceRef.current && markerInstanceRef.current && lat != null && lng != null) {
      markerInstanceRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng], { animate: true });
    }
  }, [lat, lng]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleLocateMe = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = Number(pos.coords.latitude.toFixed(6));
          const uLng = Number(pos.coords.longitude.toFixed(6));
          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([uLat, uLng]);
            mapInstanceRef.current.setView([uLat, uLng], 15);
          }
          onChange(uLat, uLng);
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
        }
      );
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Interactive Controls */}
      <div className="absolute top-2.5 right-2.5 z-30 flex flex-col gap-1.5 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          className="w-7 h-7 bg-white hover:bg-slate-100 text-blue-600 rounded border border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title="Locate Current Position"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Hint / Coordinate Indicator */}
      <div className="absolute bottom-1.5 left-2.5 z-30 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200 flex items-center gap-1 shadow-2xs pointer-events-none select-none">
        <MapPin className="w-2.5 h-2.5 text-rose-500" />
        <span>Click or drag pin to set coordinates: </span>
        <span className="font-mono font-semibold text-slate-800">
          {effectiveLat.toFixed(4)}, {effectiveLng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
