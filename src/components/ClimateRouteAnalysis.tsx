/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  CloudRain,
  Flame,
  TrafficCone,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { RouteOption } from '../types';
import { CITIZEN_ROUTES } from '../data/mockCityData';

interface ClimateRouteAnalysisProps {
  routes?: RouteOption[];
  onSelectRoute?: (routeId: string) => void;
  selectedRouteId?: string;
  onBack?: () => void;
}

export const ClimateRouteAnalysis: React.FC<ClimateRouteAnalysisProps> = ({
  routes = CITIZEN_ROUTES,
  onSelectRoute,
  selectedRouteId = 'route-b',
  onBack,
}) => {
  const [activeRouteId, setActiveRouteId] = useState<string>(selectedRouteId);
  const [userPriority, setUserPriority] = useState<'BALANCED' | 'FLOOD_AVOIDANCE' | 'SPEED' | 'SHADE'>('BALANCED');

  const activeRoute = routes.find((r) => r.id === activeRouteId) || routes[0];

  const handleRouteClick = (id: string) => {
    setActiveRouteId(id);
    onSelectRoute?.(id);
  };

  return (
    <div id="climate-citizen-route-analysis" className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 mt-0.5 group"
                title="Back to Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Climate-Aware Multi-Criteria Citizen Route Analysis
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Evaluates route accessibility beyond traditional distance and time by incorporating compound environmental exposures (Flood, Heat, Traffic Risk).
              </p>
            </div>
          </div>

          {/* User Priority Filters */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px] font-medium px-1">Priority:</span>
            {[
              { id: 'BALANCED', label: 'Balanced' },
              { id: 'FLOOD_AVOIDANCE', label: 'Avoid Flood' },
              { id: 'SPEED', label: 'Fastest' },
              { id: 'SHADE', label: 'Thermal Shade' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setUserPriority(p.id as any)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  userPriority === p.id
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trade-off philosophy banner (Section 6 requirement) */}
        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>NagarShield Core Philosophy:</strong> We do not label any route as universally &ldquo;best.&rdquo; Every path
            presents physical tradeoffs: direct routes often carry elevated waterlogging and congestion, while bypasses add
            geographical distance but guarantee reliability. Choose according to your vulnerability tolerance.
          </p>
        </div>
      </div>

      {/* Routes Grid (Route A vs Route B vs Route C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = activeRouteId === route.id;
          return (
            <div
              key={route.id}
              onClick={() => handleRouteClick(route.id)}
              className={`bg-white rounded-xl p-5 border-2 transition cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-sky-500 ring-2 ring-sky-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs">{route.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      route.overallMobilityRisk === 'LOW'
                        ? 'bg-emerald-100 text-emerald-800'
                        : route.overallMobilityRisk === 'MODERATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Risk: {route.overallMobilityRisk}
                  </span>
                </div>

                {/* Metrics Table */}
                <div className="my-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Distance:</span>
                    <span className="font-bold font-mono text-slate-900">{route.distanceKm} km</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Travel Time:</span>
                    <span className="font-bold font-mono text-slate-900">{route.travelTimeMin} min</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-sky-500" /> Flood Exposure:
                    </span>
                    <span
                      className={`font-semibold text-[11px] ${
                        route.floodExposure === 'HIGH' ? 'text-rose-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {route.floodExposure}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500" /> Heat Exposure:
                    </span>
                    <span className="font-semibold text-[11px] text-slate-700">{route.heatExposure}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1">
                      <TrafficCone className="w-3 h-3 text-rose-500" /> Traffic Exposure:
                    </span>
                    <span
                      className={`font-semibold text-[11px] ${
                        route.trafficExposure === 'VERY_HIGH' ? 'text-rose-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {route.trafficExposure}
                    </span>
                  </div>
                </div>

                {/* Trade-off summary */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 text-[11px]">Trade-Off Evaluation:</div>
                  <p className="text-[11px] leading-relaxed italic">{route.tradeOffSummary}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Mobility Score: {route.mobilityRiskScore}/100</span>
                <span className={`font-bold ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>
                  {isSelected ? '✓ Selected Path' : 'Click to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
