/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Info,
  Maximize2,
  Navigation,
  Compass,
  AlertTriangle,
  Flame,
  CloudRain,
  Shield,
  Eye,
  X,
  Droplets,
  Clock,
  Gauge,
  MapPin,
  Globe,
  Search,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  RoadSegment,
  UrbanZone,
  JunctionNode,
  EmergencyFacility,
  GisLayerKey,
  GroundingSource,
} from '../types';
import { IncidentReport } from '../types/incident';
import { getTrafficRiskClassification, getCongestionClassification } from '../services/trafficEngine';
import { executeGroundedQuery } from '../services/geminiService';

interface GisRiskMapProps {
  roads: RoadSegment[];
  zones: UrbanZone[];
  junctions: JunctionNode[];
  facilities: EmergencyFacility[];
  selectedSegmentId: string | null;
  onSelectSegment: (segment: RoadSegment | null) => void;
  activeHighlightedRoute?: string | null; // 'route-a' | 'route-b' | 'emergency'
  incidents?: IncidentReport[];
  onSelectIncident?: (incident: IncidentReport) => void;
}

export const GisRiskMap: React.FC<GisRiskMapProps> = ({
  roads,
  zones,
  junctions,
  facilities,
  selectedSegmentId,
  onSelectSegment,
  activeHighlightedRoute,
  incidents = [],
  onSelectIncident,
}) => {
  // Layer visibility state
  const [layers, setLayers] = useState<Record<GisLayerKey, boolean>>({
    trafficRisk: true,
    floodRisk: true,
    heatRisk: false,
    combinedRisk: false,
    populationExposure: false,
    greenCoverage: false,
    infrastructureVulnerability: false,
  });

  const [hoveredSegment, setHoveredSegment] = useState<RoadSegment | null>(null);

  // Google Maps & Search Grounding State
  const [groundedQuery, setGroundedQuery] = useState('');
  const [groundedType, setGroundedType] = useState<'maps' | 'search'>('maps');
  const [isQuerying, setIsQuerying] = useState(false);
  const [groundedResult, setGroundedResult] = useState<{ text: string; sources: GroundingSource[]; model: string } | null>(null);
  const [showGroundedPanel, setShowGroundedPanel] = useState(false);

  const handleRunGroundedQuery = async (queryToRun?: string) => {
    const q = (queryToRun || groundedQuery).trim();
    if (!q || isQuerying) return;
    setIsQuerying(true);
    setShowGroundedPanel(true);
    try {
      const res = await executeGroundedQuery(q, groundedType, 'Dhaka Metropolitan Basin');
      setGroundedResult(res);
    } catch (err) {
      console.error('Grounded search failed:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const toggleLayer = (layerKey: GisLayerKey) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const selectedSegment = roads.find((r) => r.id === selectedSegmentId) || null;

  const maxWaterlogging = React.useMemo(() => {
    return Math.max(0, ...roads.map((r) => r.waterloggingDepthCm || 0));
  }, [roads]);

  const maxSurfaceTemp = React.useMemo(() => {
    return Math.max(28, ...roads.map((r) => r.surfaceTempC || 28));
  }, [roads]);

  // Helper to color roads by active layer
  const getRoadColor = (road: RoadSegment) => {
    // If route highlighted
    if (activeHighlightedRoute === 'route-a' && ['road-a', 'road-b', 'road-c'].includes(road.id)) {
      return '#ef4444'; // Red Route A
    }
    if (activeHighlightedRoute === 'route-b' && ['road-alt', 'road-c'].includes(road.id)) {
      return '#10b981'; // Green Route B
    }

    if (layers.trafficRisk) {
      switch (road.congestionLevel) {
        case 'FREE_FLOW':
          return '#10b981'; // 🟢 Free Flow
        case 'MODERATE':
          return '#f59e0b'; // 🟡 Moderate
        case 'CONGESTED':
          return '#f97316'; // 🟠 Congested
        case 'SEVERE':
          return '#ef4444'; // 🔴 Severe Congestion
      }
    }

    if (layers.floodRisk) {
      if (road.floodExposure === 'HIGH') return '#0284c7';
      if (road.floodExposure === 'MEDIUM') return '#38bdf8';
      return '#94a3b8';
    }

    if (layers.heatRisk) {
      if (road.heatExposure === 'HIGH') return '#ea580c';
      if (road.heatExposure === 'MEDIUM') return '#fbbf24';
      return '#94a3b8';
    }

    return '#64748b';
  };

  const getRoadStrokeWidth = (road: RoadSegment) => {
    const isSelected = selectedSegmentId === road.id;
    const isHovered = hoveredSegment?.id === road.id;
    if (isSelected || isHovered) return 8;
    if (road.type === 'expressway') return 6.5;
    if (road.type === 'arterial') return 5;
    return 3.5;
  };

  // Convert coordinate array to SVG path string
  const getPathD = (coords: [number, number][]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr[0]} ${curr[1]}` : `${acc} L ${curr[0]} ${curr[1]}`;
    }, '');
  };

  return (
    <div id="gis-risk-map-container" className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold tracking-wide">GIS Spatial Risk & Mobility Map</h2>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Interactive Analytical Grid
          </span>
        </div>

        {/* Legend pills for traffic layer */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs bg-slate-950/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
          <span className="text-slate-400 font-medium text-[10px] sm:text-[11px] shrink-0">Flow:</span>
          <span className="flex items-center gap-1 text-slate-200 text-[10px] sm:text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Free
          </span>
          <span className="flex items-center gap-1 text-slate-200 text-[10px] sm:text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Moderate
          </span>
          <span className="flex items-center gap-1 text-slate-200 text-[10px] sm:text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Congested
          </span>
          <span className="flex items-center gap-1 text-slate-200 text-[10px] sm:text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" /> Severe
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[440px] sm:min-h-[520px]">
        {/* Left Column: Risk Layers Toggle Panel (order-2 on mobile so map shows first) */}
        <div className="order-2 lg:order-1 p-3 sm:p-3.5 bg-slate-50 border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                Risk Layers
              </span>
              <span className="text-[10px] text-slate-500">Toggle GIS layers</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={layers.floodRisk}
                  onChange={() => toggleLayer('floodRisk')}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  Flood Risk Overlay
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={layers.heatRisk}
                  onChange={() => toggleLayer('heatRisk')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Heat Risk Overlay
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-800 font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <input
                  type="checkbox"
                  checked={layers.trafficRisk}
                  onChange={() => toggleLayer('trafficRisk')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  Traffic Risk Layer
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={layers.combinedRisk}
                  onChange={() => toggleLayer('combinedRisk')}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Combined Risk (UMDI)</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={layers.populationExposure}
                  onChange={() => toggleLayer('populationExposure')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Population Exposure</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={layers.greenCoverage}
                  onChange={() => toggleLayer('greenCoverage')}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Green Coverage</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={layers.infrastructureVulnerability}
                  onChange={() => toggleLayer('infrastructureVulnerability')}
                  className="rounded text-slate-600 focus:ring-slate-500"
                />
                <span>Infrastructure Vulnerability</span>
              </label>
            </div>

            {/* Quick Map Tips */}
            <div className="mt-4 p-2.5 bg-sky-50/70 border border-sky-200 rounded-lg text-[11px] text-sky-900">
              <div className="font-semibold mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                Interactive GIS Guidance
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Click any colored road segment on the canvas to inspect real-time congestion scores, estimated waterlogging depth, and delay metrics.
              </p>
            </div>
          </div>

          {/* Critical Facilities Legend */}
          <div className="pt-3 border-t border-slate-200 text-xs">
            <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider block mb-1.5">
              Critical Facilities:
            </span>
            <div className="space-y-1 text-slate-600 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="p-0.5 rounded bg-rose-100 text-rose-700 font-bold">🏥</span> Central Trauma Hospital
              </div>
              <div className="flex items-center gap-1.5">
                <span className="p-0.5 rounded bg-orange-100 text-orange-700 font-bold">🚒</span> Fire Rescue Station #4
              </div>
              <div className="flex items-center gap-1.5">
                <span className="p-0.5 rounded bg-blue-100 text-blue-700 font-bold">🏫</span> Flood Refuge Shelter #7
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive SVG GIS Canvas (Span 2 cols on lg, Order-1 on mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-2 relative bg-slate-950 p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden">
          <div className="relative w-full h-full min-h-[320px] sm:min-h-[460px] flex items-center justify-center">
            <svg
              viewBox="0 0 780 480"
              className="w-full h-full select-none cursor-crosshair filter drop-shadow-lg"
              style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)' }}
            >
              {/* Background Map Grid & Rivers */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                {/* Traffic flow animated dash */}
                <style>{`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -40;
                    }
                  }
                  .animate-flow {
                    stroke-dasharray: 8 6;
                    animation: dash 2.2s linear infinite;
                  }
                `}</style>
              </defs>

              <rect width="780" height="480" fill="url(#grid)" />

              {/* Waterway / River Embankment (Blue meandering delta) */}
              <path
                d="M 60 480 Q 140 380 180 320 T 320 180 Q 420 80 500 0"
                fill="none"
                stroke="#0369a1"
                strokeWidth="28"
                opacity={layers.floodRisk ? '0.45' : '0.2'}
              />
              <path
                d="M 60 480 Q 140 380 180 320 T 320 180 Q 420 80 500 0"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                opacity="0.6"
              />

              {/* Flood Inundation Polygons (Lowland basin) */}
              {layers.floodRisk && (
                maxWaterlogging > 5 ? (
                  <g id="flood-inundation-layers" opacity="0.35">
                    <ellipse cx="420" cy="310" rx="90" ry="60" fill="#0284c7" />
                    <ellipse cx="180" cy="360" rx="75" ry="50" fill="#0284c7" />
                    <ellipse cx="280" cy="230" rx="60" ry="40" fill="#38bdf8" />
                    <text x="375" y="325" fill="#7dd3fc" fontSize="10" fontWeight="bold">
                      Basin Sump Ponding ({maxWaterlogging}cm)
                    </text>
                  </g>
                ) : (
                  <g id="flood-nominal-layer" opacity="0.5">
                    <text x="330" y="325" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                      Nominal Drainage Outflow (0cm Ponding)
                    </text>
                  </g>
                )
              )}

              {/* Heat Risk Urban Heat Islands */}
              {layers.heatRisk && (
                maxSurfaceTemp >= 38 ? (
                  <g id="heat-island-layers" opacity="0.32">
                    <circle cx="280" cy="230" r="70" fill="#ea580c" />
                    <circle cx="420" cy="310" r="60" fill="#f97316" />
                    <text x="240" y="240" fill="#fed7aa" fontSize="10" fontWeight="bold">
                      Thermal Corridor (+{Math.round(maxSurfaceTemp)}°C)
                    </text>
                  </g>
                ) : (
                  <g id="heat-nominal-layer" opacity="0.5">
                    <text x="230" y="240" fill="#fed7aa" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                      Standard Pavement Temp ({Math.round(maxSurfaceTemp)}°C)
                    </text>
                  </g>
                )
              )}

              {/* Zone boundaries and centroids */}
              {zones.map((zone) => (
                <g key={zone.id}>
                  <circle
                    cx={zone.centroid[0]}
                    cy={zone.centroid[1]}
                    r="4"
                    fill="#94a3b8"
                    opacity="0.6"
                  />
                  <text
                    x={zone.centroid[0] - 30}
                    y={zone.centroid[1] - 12}
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="monospace"
                    opacity="0.75"
                  >
                    {zone.code} ({zone.name.split('-')[1]?.trim() || zone.name})
                  </text>
                </g>
              ))}

              {/* Road Segments (Interactive GIS Lines) */}
              {roads.map((road) => {
                const strokeColor = getRoadColor(road);
                const strokeWidth = getRoadStrokeWidth(road);
                const isSelected = selectedSegmentId === road.id;

                return (
                  <g
                    key={road.id}
                    onClick={() => onSelectSegment(road)}
                    onMouseEnter={() => setHoveredSegment(road)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="cursor-pointer transition-all duration-150"
                  >
                    {/* Outer glow halo for selected segment */}
                    {isSelected && (
                      <path
                        d={getPathD(road.coordinates)}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={strokeWidth + 8}
                        opacity="0.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Road base line */}
                    <path
                      d={getPathD(road.coordinates)}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth={strokeWidth + 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Colored Traffic/Risk line */}
                    <path
                      d={getPathD(road.coordinates)}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isSelected ? 1 : 0.88}
                    />

                    {/* Animated moving traffic flow pulses */}
                    {layers.trafficRisk && road.congestionLevel !== 'SEVERE' && (
                      <path
                        d={getPathD(road.coordinates)}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={Math.max(1.5, strokeWidth * 0.35)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.5"
                        className="animate-flow"
                      />
                    )}

                    {/* Road Label */}
                    <text
                      x={(road.coordinates[0][0] + road.coordinates[road.coordinates.length - 1][0]) / 2}
                      y={(road.coordinates[0][1] + road.coordinates[road.coordinates.length - 1][1]) / 2 - 8}
                      fill="#f8fafc"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {road.code}
                    </text>
                  </g>
                );
              })}

              {/* Junction Nodes */}
              {junctions.map((jct) => {
                const jctMeta = getTrafficRiskClassification(jct.trafficRiskScore);
                return (
                  <g key={jct.id} transform={`translate(${jct.coordinates[0]}, ${jct.coordinates[1]})`}>
                    <circle r="7" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                    <circle
                      r="4.5"
                      fill={
                        jct.trafficRiskScore > 80
                          ? '#ef4444'
                          : jct.trafficRiskScore > 60
                          ? '#f97316'
                          : '#10b981'
                      }
                      className={jct.trafficRiskScore > 80 ? 'animate-ping' : ''}
                      opacity={jct.trafficRiskScore > 80 ? '0.75' : '1'}
                    />
                    <circle
                      r="4.5"
                      fill={
                        jct.trafficRiskScore > 80
                          ? '#ef4444'
                          : jct.trafficRiskScore > 60
                          ? '#f97316'
                          : '#10b981'
                      }
                    />
                    <text x="9" y="3" fill="#cbd5e1" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      {jct.name.split('(')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Emergency Facilities Icons */}
              {facilities.map((fac) => (
                <g key={fac.id} transform={`translate(${fac.coordinates[0]}, ${fac.coordinates[1]})`}>
                  <rect
                    x="-11"
                    y="-11"
                    width="22"
                    height="22"
                    rx="6"
                    fill={fac.type === 'HOSPITAL' ? '#be123c' : fac.type === 'FIRE_STATION' ? '#c2410c' : '#1d4ed8'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="filter drop-shadow-md"
                  />
                  <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="bold">
                    {fac.type === 'HOSPITAL' ? '🏥' : fac.type === 'FIRE_STATION' ? '🚒' : '🏫'}
                  </text>
                </g>
              ))}

              {/* Crowdsourced Citizen Hazard Pins */}
              {incidents.filter((i) => i.status !== 'resolved').map((inc, idx) => {
                // Map coordinates into 780x480 SVG space
                const normX = Math.max(0.05, Math.min(0.95, (inc.lon - 90.34) / 0.09));
                const normY = Math.max(0.05, Math.min(0.95, (inc.lat - 23.72) / 0.16));
                const cx = Math.round(normX * 700 + 40);
                const cy = Math.round(480 - (normY * 400 + 40));

                const pinColor =
                  inc.type === 'waterlogging'
                    ? '#0284c7'
                    : inc.type === 'electrical_wire'
                    ? '#d97706'
                    : inc.type === 'open_manhole'
                    ? '#e11d48'
                    : '#059669';

                return (
                  <g
                    key={inc.id || idx}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer group"
                    onClick={() => onSelectIncident && onSelectIncident(inc)}
                  >
                    {/* Pulsing ring for critical severity */}
                    {inc.severity === 'critical' && (
                      <circle
                        r="14"
                        fill={pinColor}
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}
                    {/* Pin background */}
                    <circle
                      r="9"
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="filter drop-shadow-md group-hover:scale-125 transition-transform"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#ffffff"
                      fontWeight="bold"
                    >
                      {inc.type === 'waterlogging'
                        ? '🌊'
                        : inc.type === 'electrical_wire'
                        ? '⚡'
                        : inc.type === 'open_manhole'
                        ? '⭕'
                        : '⚠️'}
                    </text>
                    {/* Mini Label on hover */}
                    <text
                      x="0"
                      y="-12"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 pointer-events-none drop-shadow"
                    >
                      {inc.upazila}: {inc.type}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Canvas overlay HUD */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-xs">
              <span>CANVAS: 780×480 px</span>
              <span className="text-sky-400">DELTA URBAN METRO</span>
            </div>
          </div>
        </div>

        {/* Right Column: Road Segment Inspection Card (order-2 on mobile, right under map) */}
        <div className="order-2 lg:order-3 p-3 sm:p-4 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                Road Segment Inspection
              </span>
              {selectedSegment && (
                <button
                  onClick={() => onSelectSegment(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {selectedSegment ? (
              <div id="road-segment-details-box" className="space-y-3.5">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-mono">{selectedSegment.code}</div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedSegment.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedSegment.description}</p>
                </div>

                {/* Exact layout requested in prompt Section 3 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Traffic Risk:</span>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">
                      {selectedSegment.trafficRiskScore} / 100
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Congestion:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                        getCongestionClassification(selectedSegment.congestionLevel).badgeClass
                      }`}
                    >
                      {getCongestionClassification(selectedSegment.congestionLevel).label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Estimated Delay:
                    </span>
                    <span className="font-bold text-amber-700 font-mono">
                      +{selectedSegment.estimatedDelayMin} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      Flood Exposure:
                    </span>
                    <span
                      className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                        selectedSegment.floodExposure === 'HIGH'
                          ? 'bg-rose-50 text-rose-700'
                          : selectedSegment.floodExposure === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {selectedSegment.floodExposure} ({selectedSegment.waterloggingDepthCm} cm water)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Heat Exposure:
                    </span>
                    <span
                      className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                        selectedSegment.heatExposure === 'HIGH'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {selectedSegment.heatExposure} ({selectedSegment.surfaceTempC}°C)
                    </span>
                  </div>
                </div>

                {/* Capacity & Connectivity Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="text-slate-500">Volume / Capacity</div>
                    <div className="font-bold text-slate-800 font-mono mt-0.5">
                      {selectedSegment.currentLoadVehiclesPerHour} / {selectedSegment.capacityVehiclesPerHour} vph
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="text-slate-500">Drainage Runoff</div>
                    <div className="font-bold text-slate-800 font-mono mt-0.5">
                      {selectedSegment.drainageEfficiency}% efficiency
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Navigation className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">No segment selected</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Click on any corridor on the GIS canvas (e.g. Road A or Road B) to inspect environmental mobility metrics.
                </p>
              </div>
            )}
          </div>

          {/* Quick Segment Selectors */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Quick Inspect Corridors:
            </span>
            <div className="flex flex-wrap gap-1">
              {roads.slice(0, 4).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelectSegment(r)}
                  className={`text-[10px] font-medium px-2 py-1 rounded border transition ${
                    selectedSegmentId === r.id
                      ? 'bg-sky-100 border-sky-300 text-sky-800 font-bold'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grounded Spatial Intelligence Bar (Google Maps & Google Search Grounding) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-sm mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Grounded Spatial Intelligence
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                  AI Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ground municipal GIS decisions with verified Google Maps locations and live Google Search advisories.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs border border-slate-700">
              <button
                type="button"
                onClick={() => setGroundedType('maps')}
                className={`px-2.5 py-1 rounded font-medium text-xs flex items-center gap-1 transition ${
                  groundedType === 'maps'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-300" />
                Google Maps
              </button>
              <button
                type="button"
                onClick={() => setGroundedType('search')}
                className={`px-2.5 py-1 rounded font-medium text-xs flex items-center gap-1 transition ${
                  groundedType === 'search'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3 h-3 text-sky-300" />
                Google Search
              </button>
            </div>
          </div>
        </div>

        {/* Input Form & Quick Chips */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={groundedQuery}
              onChange={(e) => setGroundedQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunGroundedQuery()}
              placeholder={
                groundedType === 'maps'
                  ? 'Search verified hospitals, evacuation shelters, or trauma clinics...'
                  : 'Search live road closures, official monsoon alerts, or disaster bulletins...'
              }
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500 transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => handleRunGroundedQuery()}
            disabled={isQuerying || !groundedQuery.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            {isQuerying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Grounded Query
              </>
            )}
          </button>
        </div>

        {/* Preset Query Chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 text-[10px] uppercase font-semibold">Presets:</span>
          {groundedType === 'maps' ? (
            <>
              <button
                onClick={() => {
                  setGroundedQuery('Major trauma and emergency hospitals near Mirpur Road and elevated bypass corridors in Dhaka');
                  handleRunGroundedQuery('Major trauma and emergency hospitals near Mirpur Road and elevated bypass corridors in Dhaka');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
              >
                📍 Emergency Trauma Centers
              </button>
              <button
                onClick={() => {
                  setGroundedQuery('High-ground community flood relief and cyclone shelter centers in Dhaka metropolitan area');
                  handleRunGroundedQuery('High-ground community flood relief and cyclone shelter centers in Dhaka metropolitan area');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
              >
                📍 High-Ground Shelters
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setGroundedQuery('Latest Dhaka heavy rain and waterlogging advisory Bangladesh Meteorological Department');
                  handleRunGroundedQuery('Latest Dhaka heavy rain and waterlogging advisory Bangladesh Meteorological Department');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-sky-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
              >
                🌐 Meteorological Rain Bulletins
              </button>
              <button
                onClick={() => {
                  setGroundedQuery('Dhaka traffic police official road inundation and diversion notices');
                  handleRunGroundedQuery('Dhaka traffic police official road inundation and diversion notices');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-sky-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
              >
                🌐 Road Closure Bulletins
              </button>
            </>
          )}
        </div>

        {/* Results Box */}
        {showGroundedPanel && (
          <div className="mt-4 pt-3 border-t border-slate-800 animate-fadeIn">
            {isQuerying ? (
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>
                  Querying {groundedType === 'maps' ? 'Google Maps' : 'Google Search'} in real time...
                </span>
              </div>
            ) : groundedResult ? (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    {groundedType === 'maps' ? (
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    Grounded Findings:
                  </span>
                  <button
                    onClick={() => setShowGroundedPanel(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px] mb-3">
                  {groundedResult.text}
                </p>

                {/* Grounding Source Links */}
                {groundedResult.sources && groundedResult.sources.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                      Verified {groundedType === 'maps' ? 'Google Maps' : 'Google Search'} Links:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {groundedResult.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-[11px] border border-slate-700 transition"
                        >
                          {s.type === 'maps' ? (
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <Globe className="w-3 h-3 text-sky-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[220px] font-medium">{s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
