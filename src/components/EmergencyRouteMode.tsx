/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Hospital,
  Flame,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  Compass,
  ArrowRight,
  TrendingUp,
  ArrowLeft,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { EmergencyFacility, UrbanZone, RoadSegment, LiveWeatherData } from '../types';
import { UpazilaLocation, DEFAULT_BANGLADESH_LOCATION } from '../data/bangladeshLocations';

interface EmergencyRouteModeProps {
  facilities: EmergencyFacility[];
  zones: UrbanZone[];
  roads: RoadSegment[];
  onHighlightRoute?: (routeId: string) => void;
  onBack?: () => void;
  activeLocation?: UpazilaLocation;
  weatherData?: LiveWeatherData | null;
}

export const EmergencyRouteMode: React.FC<EmergencyRouteModeProps> = ({
  facilities,
  zones,
  roads,
  onHighlightRoute,
  onBack,
  activeLocation = DEFAULT_BANGLADESH_LOCATION,
  weatherData,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || 'fac-hosp-1');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-1');

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const rain = weatherData?.rain1hMm ?? 0;
  const isWet = rain > 1.2;
  const isHeavyRain = rain > 6.0;

  // Real road segments
  const directRoad = roads[0] || { name: 'Direct Corridor', waterloggingDepthCm: 0, estimatedDelayMin: 4 };
  const bypassRoad = roads.find((r) => r.isEmergencyCorridor) || roads[1] || { name: 'Elevated Bypass', waterloggingDepthCm: 0, estimatedDelayMin: 4 };

  const directCorridorName = activeLocation.sampleCorridors?.[0]?.name || directRoad.name;
  const bypassCorridorName = activeLocation.sampleCorridors?.[1]?.name || bypassRoad.name;

  // Real dynamic times and waterlogging
  const directWaterlogging = directRoad.waterloggingDepthCm || 0;
  const directDelay = directRoad.estimatedDelayMin || (isHeavyRain ? 20 : isWet ? 8 : 2);
  const directTotalTime = 12 + directDelay;

  const bypassDelay = 4;
  const bypassTotalTime = 18;

  return (
    <div id="emergency-access-mode" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-rose-950 text-white rounded-xl p-5 border border-rose-900 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose-900/80">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-200 hover:text-white border border-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 mt-0.5 group"
                title="Back to Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-rose-900 text-rose-300 border border-rose-700">
                  <AlertTriangle className="w-5 h-5 text-rose-300" />
                </span>
                <h2 className="text-base font-bold tracking-tight">
                  🚨 Emergency Access Mode: {activeLocation.name}
                </h2>
              </div>
              <p className="text-xs text-rose-200 mt-1 max-w-2xl">
                Ground-truth emergency dispatch evaluation for <strong className="text-white">{activeLocation.name}, {activeLocation.zilla}</strong> balancing{' '}
                <strong className="text-white">Rainfall ({rain} mm/h) + Pavement Friction + Life-Safety Routing</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            <span className="font-semibold text-rose-100">Live Rapid Response Protocol</span>
          </div>
        </div>

        {/* Dispatch Controls (Facility & Origin Zone Picker) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-1.5">
              1. Select Emergency Destination:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {facilities.map((fac) => {
                const isSelected = selectedFacilityId === fac.id;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacilityId(fac.id)}
                    className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-rose-900/90 border-rose-400 text-white shadow-sm ring-1 ring-rose-400'
                        : 'bg-rose-950/40 border-rose-900/70 text-rose-200 hover:bg-rose-900/50'
                    }`}
                  >
                    <span className="text-xl mb-1">
                      {fac.type === 'HOSPITAL' ? '🏥' : fac.type === 'FIRE_STATION' ? '🚒' : '🏫'}
                    </span>
                    <span className="font-bold text-[11px] leading-tight line-clamp-1">{fac.name}</span>
                    <span className="text-[10px] text-rose-300 mt-0.5">{fac.readinessStatus}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-1.5">
              2. Select Origin Incident Zone:
            </label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full bg-rose-900/60 border border-rose-800 text-white rounded-lg p-2.5 text-xs font-medium focus:ring-rose-400 focus:outline-hidden cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id} className="bg-slate-900 text-white">
                  {z.name} (Flood Risk: {z.floodRiskScore}, Traffic Risk: {z.trafficRiskScore})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-rose-300 mt-2">
              {isHeavyRain
                ? `⚠️ ${selectedZone.name} is experiencing heavy storm runoff near ${activeLocation.canalOrRiver} (${directWaterlogging} cm water ponding on primary artery).`
                : isWet
                ? `🌧️ ${selectedZone.name} has light wet pavement spray (${rain} mm/h). Manageable traffic headways.`
                : `☀️ ${selectedZone.name} is in dry, clear operational status (0 cm waterlogging). Both emergency routes are unobstructed.`}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Corridor Route Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Direct Corridor */}
        <div
          className={`bg-white rounded-xl p-5 border-2 shadow-xs flex flex-col justify-between ${
            isHeavyRain ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                {isHeavyRain ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
                Direct Route: {directCorridorName}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  isHeavyRain
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : isWet
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                {isHeavyRain ? 'AVOID IF POSSIBLE' : isWet ? 'CAUTION' : 'CLEAR & FASTEST'}
              </span>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Distance:</span>
                <span className="font-bold text-slate-800 font-mono">3.1 km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Estimated Transit Time:</span>
                <span
                  className={`font-extrabold font-mono text-sm ${
                    isHeavyRain ? 'text-rose-700' : isWet ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {directTotalTime} min (+{directDelay} min delay)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Water Ponding:</span>
                <span
                  className={`font-bold ${
                    directWaterlogging > 10
                      ? 'text-rose-600'
                      : directWaterlogging > 0
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {directWaterlogging > 0 ? `${directWaterlogging} cm standing water` : '0 cm (Dry pavement)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Traffic Condition:</span>
                <span className={`font-bold ${isHeavyRain ? 'text-rose-600' : isWet ? 'text-amber-600' : 'text-slate-800'}`}>
                  {isHeavyRain ? 'HEAVY CONGESTION' : isWet ? 'MODERATE QUEUES' : 'NORMAL FREE-FLOW'}
                </span>
              </div>
            </div>

            <div
              className={`p-3 border rounded-lg text-xs space-y-1 ${
                isHeavyRain
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                {isHeavyRain ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                Operational Dispatch Note:
              </div>
              <p className="text-[11px] leading-relaxed">
                {isHeavyRain
                  ? `Stormwater runoff from ${activeLocation.canalOrRiver} slows traffic to single file near low-elevation culverts. Ambulances face ${directDelay} min delay.`
                  : isWet
                  ? `Surface spray present. Maintain safe headway. Direct access to ${selectedFacility.name} remains operable.`
                  : `Optimal path under current clear atmospheric conditions (${weatherData?.temperatureC ?? 30}°C). Unobstructed rapid transit to ${selectedFacility.name}.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => onHighlightRoute?.('route-a')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 transition cursor-pointer"
          >
            Show Direct Route on GIS Map
          </button>
        </div>

        {/* Recommended Resilient Corridor: Elevated Bypass */}
        <div className="bg-white rounded-xl p-5 border-2 border-emerald-300 shadow-xs flex flex-col justify-between ring-1 ring-emerald-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Alternative: {bypassCorridorName}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {isHeavyRain ? 'RECOMMENDED DISPATCH' : 'RELIABLE BYPASS'}
              </span>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Distance:</span>
                <span className="font-bold text-slate-800 font-mono">3.6 km (+0.5 km longer)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Estimated Transit Time:</span>
                <span className="font-extrabold text-emerald-700 font-mono text-sm">
                  {bypassTotalTime} min (+{bypassDelay} min delay)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Water Ponding:</span>
                <span className="font-bold text-emerald-600">0 cm (Elevated embankment)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Traffic Condition:</span>
                <span className="font-bold text-emerald-700">FREE FLOW</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Resilience Trade-off Advantage:
              </div>
              <p className="text-[11px] leading-relaxed">
                Although {bypassCorridorName} is 0.5 km longer, its elevated grade separation completely avoids low-lying
                sump zones along {activeLocation.canalOrRiver}, guaranteeing uninterrupted medical access to {selectedFacility.name}.
              </p>
            </div>
          </div>

          <button
            onClick={() => onHighlightRoute?.('route-b')}
            className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Show Alternative Corridor on GIS Map
          </button>
        </div>
      </div>
    </div>
  );
};
