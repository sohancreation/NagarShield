/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Crosshair,
  Layers,
  Navigation,
  Building2,
  Flame,
  Shield,
  Waves,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  Maximize2,
  X,
  Radio,
} from 'lucide-react';
import { UpazilaLocation, BANGLADESH_LOCATIONS, findNearestUpazila, calculateDistanceKm } from '../data/bangladeshLocations';
import { LiveWeatherData } from '../types';

interface GoogleMapLocatorProps {
  activeLocation: UpazilaLocation;
  onSelectLocation: (location: UpazilaLocation) => void;
  currentWeather?: LiveWeatherData | null;
  className?: string;
  isCompact?: boolean;
}

// Map Controller helper to handle smooth camera fly-to animations
const MapCameraAnimator: React.FC<{ targetLat: number; targetLng: number; zoomLevel: number }> = ({
  targetLat,
  targetLng,
  zoomLevel,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: targetLat, lng: targetLng });
    map.setZoom(zoomLevel);
  }, [map, targetLat, targetLng, zoomLevel]);

  return null;
};

// Traffic layer controller
const TrafficLayerController: React.FC<{ showTraffic: boolean }> = ({ showTraffic }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, showTraffic]);

  return null;
};

export const GoogleMapLocator: React.FC<GoogleMapLocatorProps> = ({
  activeLocation,
  onSelectLocation,
  currentWeather,
  className = '',
  isCompact = false,
}) => {
  // API Key priority: VITE env var, injected runtime secret, or provisioned Demo Key
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof window !== 'undefined' && (window as any).__GOOGLE_MAPS_API_KEY__) ||
    'AIzaSyBFVcQ2AXe2OkZ50ipNeOwiwvKBxTNpLpo';

  const [mapType, setMapType] = useState<google.maps.MapTypeId | 'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  
  // Geolocation state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userGpsPosition, setUserGpsPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestDetectedUpazila, setNearestDetectedUpazila] = useState<{
    upazila: UpazilaLocation;
    distanceKm: number;
  } | null>(null);

  // Click-to-locate custom pin
  const [clickedPin, setClickedPin] = useState<{
    lat: number;
    lng: number;
    nearest: { upazila: UpazilaLocation; distanceKm: number };
  } | null>(null);

  // Current camera target
  const [cameraCenter, setCameraCenter] = useState<{ lat: number; lng: number }>({
    lat: activeLocation.lat,
    lng: activeLocation.lon,
  });

  // Keep camera synced when activeLocation changes from outside
  useEffect(() => {
    setCameraCenter({ lat: activeLocation.lat, lng: activeLocation.lon });
    setZoomLevel(13);
    setActiveInfoWindow(null);
  }, [activeLocation.lat, activeLocation.lon]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserGpsPosition({ lat, lng });
        setCameraCenter({ lat, lng });
        setZoomLevel(15);

        // Find closest upazila in Bangladesh
        const nearest = findNearestUpazila(lat, lng);
        setNearestDetectedUpazila(nearest);
        setActiveInfoWindow('user_gps');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation warning:', err);
        setGeoError(
          err.code === 1
            ? 'Location permission denied. Please allow location access or pick manually.'
            : 'Unable to retrieve precise GPS coordinates. Centering on active jurisdiction.'
        );
        setTimeout(() => setGeoError(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Map Click
  const handleMapClick = useCallback((e: any) => {
    if (e.detail && e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      const nearest = findNearestUpazila(lat, lng);
      setClickedPin({ lat, lng, nearest });
      setActiveInfoWindow('clicked_pin');
    }
  }, []);

  // Quick Jump by Division
  const handleDivisionJump = (divisionName: string) => {
    const div = BANGLADESH_LOCATIONS.find((d) => d.name === divisionName);
    if (div && div.zillas[0] && div.zillas[0].upazilas[0]) {
      const firstUpazila = div.zillas[0].upazilas[0];
      onSelectLocation(firstUpazila);
    }
  };

  // Coords for critical facilities offset realistically around upazila center
  const facilityCoords = {
    hospital: {
      lat: activeLocation.lat + 0.008,
      lng: activeLocation.lon - 0.006,
    },
    fireStation: {
      lat: activeLocation.lat - 0.006,
      lng: activeLocation.lon + 0.007,
    },
    shelter: {
      lat: activeLocation.lat + 0.012,
      lng: activeLocation.lon + 0.009,
    },
    river: {
      lat: activeLocation.lat - 0.011,
      lng: activeLocation.lon - 0.008,
    },
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                Google Maps Location Navigator
              </h3>
              <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                Live Geolocation & Facilities
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800">
                {activeLocation.name}, {activeLocation.zilla} ({activeLocation.division})
              </span>
              <span>•</span>
              <span className="font-mono text-slate-600">
                {activeLocation.lat.toFixed(4)}°N, {activeLocation.lon.toFixed(4)}°E
              </span>
              <span>•</span>
              <span className="text-slate-500">Elev: {activeLocation.elevationM}m</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Locate Me, Traffic, Map Type */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Locate Me GPS button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Use device GPS to locate nearest Bangladesh upazila"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating GPS...' : 'Locate Me (GPS)'}
          </button>

          {/* Live Traffic Toggle */}
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              showTraffic
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle Google Maps Live Traffic Flow"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>Traffic: {showTraffic ? 'ON' : 'OFF'}</span>
          </button>

          {/* Map Type Switcher */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-200 border border-slate-300 text-xs">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                mapType === 'roadmap' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                mapType === 'satellite' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                mapType === 'terrain' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Terrain
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Alert or Notification Banner */}
      {geoError && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {nearestDetectedUpazila && (
        <div className="px-4 py-2.5 bg-sky-50 border-b border-sky-200 text-xs text-sky-900 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              GPS Detected: Closest upazila is{' '}
              <strong>{nearestDetectedUpazila.upazila.name}</strong>, {nearestDetectedUpazila.upazila.zilla} ({nearestDetectedUpazila.distanceKm} km away).
            </span>
          </div>
          {nearestDetectedUpazila.upazila.name !== activeLocation.name && (
            <button
              onClick={() => {
                onSelectLocation(nearestDetectedUpazila.upazila);
                setNearestDetectedUpazila(null);
              }}
              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded-md font-bold text-[11px] transition shrink-0 cursor-pointer"
            >
              Switch to {nearestDetectedUpazila.upazila.name}
            </button>
          )}
        </div>
      )}

      {/* Main Google Maps View */}
      <div className={`relative w-full ${isCompact ? 'h-80 sm:h-96' : 'h-[420px] sm:h-[500px]'}`}>
        <APIProvider apiKey={apiKey} libraries={['marker', 'places', 'geometry']}>
          <Map
            mapId={'DEMO_MAP_ID'}
            defaultCenter={cameraCenter}
            defaultZoom={zoomLevel}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapTypeId={mapType}
            onClick={handleMapClick}
            internalUsageAttributionIds={['gmp_git_agentskills_v1']}
            className="w-full h-full"
          >
            {/* Automatic camera mover */}
            <MapCameraAnimator
              targetLat={cameraCenter.lat}
              targetLng={cameraCenter.lng}
              zoomLevel={zoomLevel}
            />

            {/* Live Traffic Overlay */}
            <TrafficLayerController showTraffic={showTraffic} />

            {/* 1. Main Active Upazila Center Marker */}
            <AdvancedMarker
              position={{ lat: activeLocation.lat, lng: activeLocation.lon }}
              onClick={() => setActiveInfoWindow('center')}
            >
              <div className="relative group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {activeLocation.name}
                </div>
              </div>
            </AdvancedMarker>

            {/* InfoWindow for Active Upazila Center */}
            {activeInfoWindow === 'center' && (
              <InfoWindow
                position={{ lat: activeLocation.lat, lng: activeLocation.lon }}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-sky-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeLocation.name}, {activeLocation.zilla}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {activeLocation.vulnerabilitySummary}
                  </p>
                  <div className="mt-2 text-[10px] space-y-1 text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                    <div><strong>Drainage:</strong> {activeLocation.canalOrRiver}</div>
                    <div><strong>Primary Hazards:</strong> {activeLocation.primaryHazards.join(', ')}</div>
                    <div><strong>Live Temp:</strong> {currentWeather?.temperatureC ?? 29}°C (Rain: {currentWeather?.rain1hMm ?? 0} mm/h)</div>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* 2. Critical Hospital Marker */}
            <AdvancedMarker
              position={facilityCoords.hospital}
              onClick={() => setActiveInfoWindow('hospital')}
            >
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </AdvancedMarker>

            {activeInfoWindow === 'hospital' && (
              <InfoWindow
                position={facilityCoords.hospital}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Designated Medical Facility</span>
                  </div>
                  <strong className="text-xs text-slate-900 block mt-1">
                    {activeLocation.criticalFacilities.hospital}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Primary trauma & emergency medical care anchor for {activeLocation.name}. Clearway prioritized in flood evacuation scenarios.
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* 3. Critical Fire Station Marker */}
            <AdvancedMarker
              position={facilityCoords.fireStation}
              onClick={() => setActiveInfoWindow('fireStation')}
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 text-white" />
              </div>
            </AdvancedMarker>

            {activeInfoWindow === 'fireStation' && (
              <InfoWindow
                position={facilityCoords.fireStation}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Fire Service & Civil Defence</span>
                  </div>
                  <strong className="text-xs text-slate-900 block mt-1">
                    {activeLocation.criticalFacilities.fireStation}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Emergency rescue tenders and high-volume dewatering pumps deployed for local waterlogged arterial underpasses.
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* 4. Disaster Shelter / Evacuation Hub Marker */}
            <AdvancedMarker
              position={facilityCoords.shelter}
              onClick={() => setActiveInfoWindow('shelter')}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </AdvancedMarker>

            {activeInfoWindow === 'shelter' && (
              <InfoWindow
                position={facilityCoords.shelter}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Evacuation & Relief Center</span>
                  </div>
                  <strong className="text-xs text-slate-900 block mt-1">
                    {activeLocation.criticalFacilities.shelterOrHub}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Multi-agency coordination depot equipped with emergency solar generators and elevated potable water reserves.
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* 5. Drainage Canal or River Marker */}
            <AdvancedMarker
              position={facilityCoords.river}
              onClick={() => setActiveInfoWindow('river')}
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                <Waves className="w-4 h-4 text-white" />
              </div>
            </AdvancedMarker>

            {activeInfoWindow === 'river' && (
              <InfoWindow
                position={facilityCoords.river}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <Waves className="w-3.5 h-3.5" />
                    <span>Hydrological Drainage Basin</span>
                  </div>
                  <strong className="text-xs text-slate-900 block mt-1">
                    {activeLocation.canalOrRiver}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Discharges urban stormwater runoff. Monitor for upstream flood crests and backwater surcharges during heavy rainfall.
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* 6. User GPS Marker (if located) */}
            {userGpsPosition && (
              <AdvancedMarker
                position={userGpsPosition}
                onClick={() => setActiveInfoWindow('user_gps')}
              >
                <div className="relative cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
                  <div className="w-9 h-9 rounded-full bg-blue-400/40 animate-ping absolute -top-2 -left-2 pointer-events-none"></div>
                </div>
              </AdvancedMarker>
            )}

            {activeInfoWindow === 'user_gps' && userGpsPosition && nearestDetectedUpazila && (
              <InfoWindow
                position={userGpsPosition}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Your Current GPS Location</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Coordinates: {userGpsPosition.lat.toFixed(4)}°N, {userGpsPosition.lng.toFixed(4)}°E
                  </p>
                  <p className="text-xs font-semibold text-slate-900 mt-1.5">
                    Closest upazila: {nearestDetectedUpazila.upazila.name}, {nearestDetectedUpazila.upazila.zilla} ({nearestDetectedUpazila.distanceKm} km away)
                  </p>
                  <button
                    onClick={() => {
                      onSelectLocation(nearestDetectedUpazila.upazila);
                      setActiveInfoWindow(null);
                    }}
                    className="mt-2 w-full px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold transition"
                  >
                    Set {nearestDetectedUpazila.upazila.name} as Active Location
                  </button>
                </div>
              </InfoWindow>
            )}

            {/* 7. Clicked Custom Pin (Click-to-locate) */}
            {clickedPin && (
              <AdvancedMarker
                position={{ lat: clickedPin.lat, lng: clickedPin.lng }}
                onClick={() => setActiveInfoWindow('clicked_pin')}
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            )}

            {activeInfoWindow === 'clicked_pin' && clickedPin && (
              <InfoWindow
                position={{ lat: clickedPin.lat, lng: clickedPin.lng }}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs pb-1 border-b border-slate-200">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Clicked Map Location</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-mono">
                    {clickedPin.lat.toFixed(4)}°N, {clickedPin.lng.toFixed(4)}°E
                  </p>
                  <p className="text-xs font-semibold text-slate-900 mt-1.5">
                    Closest jurisdiction: {clickedPin.nearest.upazila.name}, {clickedPin.nearest.upazila.zilla} ({clickedPin.nearest.distanceKm} km away)
                  </p>
                  <button
                    onClick={() => {
                      onSelectLocation(clickedPin.nearest.upazila);
                      setActiveInfoWindow(null);
                    }}
                    className="mt-2 w-full px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold transition"
                  >
                    Switch to {clickedPin.nearest.upazila.name}
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Controls Overlay on Map */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] p-2.5 rounded-xl shadow-lg border border-slate-700 space-y-1.5 hidden sm:block max-w-xs">
          <div className="font-bold flex items-center gap-1 text-sky-400">
            <Info className="w-3.5 h-3.5" />
            <span>Map Legend & Click to Locate</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Jurisdiction Center</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Hospital</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Fire Station</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Canal / River Siphon</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            Click anywhere on the map to inspect coordinates or locate nearest upazila.
          </div>
        </div>
      </div>

      {/* Bottom Quick-Jump Division Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-500 shrink-0 text-[11px]">
          Quick Locate Division:
        </span>
        <div className="flex items-center gap-1.5">
          {BANGLADESH_LOCATIONS.map((div) => {
            const isCurrent = activeLocation.division === div.name;
            return (
              <button
                key={div.name}
                onClick={() => handleDivisionJump(div.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {div.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
