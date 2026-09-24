/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  CloudRain,
  Flame,
  TrafficCone,
  AlertCircle,
  Filter,
  BarChart3,
  TrendingDown,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { RoadSegment, UrbanZone, JunctionNode } from '../types';
import { CLIMATE_MOBILITY_CORRELATION_DATA } from '../data/mockCityData';
import { getTrafficRiskClassification } from '../services/trafficEngine';

interface MobilityDisruptionHotspotsProps {
  roads: RoadSegment[];
  zones: UrbanZone[];
  junctions: JunctionNode[];
  onSelectRoad?: (road: RoadSegment) => void;
  onBack?: () => void;
}

export const MobilityDisruptionHotspots: React.FC<MobilityDisruptionHotspotsProps> = ({
  roads,
  zones,
  junctions,
  onSelectRoad,
  onBack,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filtered hotspots list combining roads and junctions
  const allHotspots = [
    ...roads.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      type: 'ROAD' as const,
      riskScore: r.trafficRiskScore,
      floodExposure: r.floodExposure,
      heatExposure: r.heatExposure,
      congestion: r.congestionLevel,
      delayMin: r.estimatedDelayMin,
      issue:
        r.waterloggingDepthCm > 15
          ? `Waterlogged (${r.waterloggingDepthCm}cm) causing capacity collapse`
          : r.congestionLevel === 'FREE_FLOW' || r.trafficRiskScore <= 35
          ? `Nominal traffic flow; minimal queue delay (~${r.estimatedDelayMin} min)`
          : r.heatExposure === 'HIGH' && r.surfaceTempC >= 38
          ? `High thermal load (${r.surfaceTempC}°C) + vehicle heat stress`
          : `Moderate traffic volume; steady progression`,
      original: r,
    })),
    ...junctions.map((j) => ({
      id: j.id,
      name: j.name,
      code: 'JUNCTION',
      type: 'INTERSECTION' as const,
      riskScore: j.trafficRiskScore,
      floodExposure: j.floodRiskScore > 70 ? ('HIGH' as const) : ('MEDIUM' as const),
      heatExposure: 'MEDIUM' as const,
      congestion: j.congestionLevel,
      delayMin: Math.round((j.trafficRiskScore / 100) * 12),
      issue:
        j.trafficRiskScore > 75
          ? `Multi-way signal confluence; saturated during peak surge`
          : j.trafficRiskScore > 45
          ? `Moderate junction queue; cyclic green progression`
          : `Coordinated signal progression; nominal queue clearance`,
      original: null,
    })),
  ].sort((a, b) => b.riskScore - a.riskScore);

  const citywideUMDI = useMemo(() => {
    if (zones.length === 0) return 24;
    return Math.round(zones.reduce((sum, z) => sum + (z.umdiScore || 20), 0) / zones.length);
  }, [zones]);

  const citywideMeta = getTrafficRiskClassification(citywideUMDI);

  const filteredHotspots = allHotspots.filter((item) => {
    const meta = getTrafficRiskClassification(item.riskScore);
    if (filterSeverity !== 'ALL' && meta.label !== filterSeverity) return false;
    if (filterType === 'ROADS' && item.type !== 'ROAD') return false;
    if (filterType === 'JUNCTIONS' && item.type !== 'INTERSECTION') return false;
    if (filterType === 'FLOOD_AFFECTED' && item.floodExposure !== 'HIGH') return false;
    return true;
  });

  return (
    <div id="mobility-disruption-container" className="space-y-6">
      {/* 1. UMDI Concept & Compounding Cascade Visualizer (Section 4) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 mt-0.5 group"
                title="Back to Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  <Activity className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold tracking-tight">
                  Urban Mobility Disruption Index (UMDI)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Analyzes how environmental hazards trigger compounding cascading failures across urban transportation
                networks instead of treating climate and traffic independently.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">Citywide UMDI:</span>
            <span
              className={`text-2xl font-extrabold font-mono ${
                citywideUMDI > 60 ? 'text-rose-400' : citywideUMDI > 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {citywideUMDI}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${citywideMeta.colorClass}`}>
              {citywideMeta.label}
            </span>
          </div>
        </div>

        {/* Dual Impact Cascades (Rainfall & Heat) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Cascade 1: Flood Inundation Chain */}
          <div className="bg-slate-950/70 p-4 rounded-lg border border-sky-900/40">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-3">
              <CloudRain className="w-3.5 h-3.5" />
              Precipitation × Traffic Disruption Chain
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-sky-800">
                  1
                </span>
                <span>Heavy rainfall event (&gt;20 mm/hr)</span>
              </div>
              <div className="pl-2.5 text-slate-600 text-xs">↓</div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-sky-800">
                  2
                </span>
                <span>Waterlogging in low-lying culverts (e.g. Zone 12 basin)</span>
              </div>
              <div className="pl-2.5 text-slate-600 text-xs">↓</div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-800">
                  3
                </span>
                <span>Road capacity reduction (-45% to -65% vehicle throughput)</span>
              </div>
              <div className="pl-2.5 text-slate-600 text-xs">↓</div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-rose-800">
                  4
                </span>
                <span className="font-semibold text-rose-300">Severe arterial gridlock & emergency access blockage</span>
              </div>
            </div>
          </div>

          {/* Cascade 2: Extreme Heat Impact Chain */}
          <div className="bg-slate-950/70 p-4 rounded-lg border border-amber-900/40">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
              <Flame className="w-3.5 h-3.5" />
              Thermal Stress × Mobility Accessibility Chain
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-800">
                  1
                </span>
                <span>Extreme surface temperature (&gt;43°C in dense bazaar corridors)</span>
              </div>
              <div className="pl-2.5 text-slate-600 text-xs">↓</div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-amber-800">
                  2
                </span>
                <span>Reduced pedestrian physiological comfort & safety limits</span>
              </div>
              <div className="pl-2.5 text-slate-600 text-xs">↓</div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-orange-950 text-orange-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-orange-800">
                  3
                </span>
                <span>Loss of active walking accessibility; forced motorized shift</span>
              </div>
              <div className="pl-2.5 text-slate-600 text-xs">↓</div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-rose-800">
                  4
                </span>
                <span className="font-semibold text-rose-300">Higher mobility vulnerability for transit-dependent citizens</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Correlation Chart: Climate-Related Mobility Disruption (Section 12) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Climate-Related Mobility Disruption Curve
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical scenario model correlating Rainfall (mm) vs. Road Capacity (%) vs. Traffic Delays (min)
            </p>
          </div>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 font-medium">
            Simulated scenario model based on urban drainage parameters
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={CLIMATE_MOBILITY_CORRELATION_DATA}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                label={{ value: 'Capacity (%) & Risk Score', angle: -90, position: 'insideLeft', fontSize: 10 }}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Average Delay (min)', angle: 90, position: 'insideRight', fontSize: 10 }}
                domain={[0, 70]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar
                yAxisId="left"
                dataKey="floodExposureScore"
                name="Flood Exposure Score"
                fill="#38bdf8"
                opacity={0.8}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="roadCapacityPct"
                name="Effective Road Capacity (%)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="trafficDelayMin"
                name="Traffic Delay (Minutes)"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Mobility Hotspots Section (Section 11) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">
                Urban Mobility Hotspots ({filteredHotspots.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized segments experiencing severe congestion, high flood exposure, or emergency bottleneck risk.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3" /> Severity:
            </span>
            {['ALL', 'VERY HIGH', 'HIGH', 'MODERATE', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev === 'VERY HIGH' ? '🔴 Severe' : sev === 'HIGH' ? '🟠 High' : sev === 'MODERATE' ? '🟡 Moderate' : sev === 'LOW' ? '🟢 Low' : 'All'}
              </button>
            ))}

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-700 text-[11px] font-medium ml-1"
            >
              <option value="ALL">All Types</option>
              <option value="ROADS">Road Segments</option>
              <option value="JUNCTIONS">Junctions</option>
              <option value="FLOOD_AFFECTED">Flood-Affected Roads</option>
            </select>
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Location / Corridor</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Congestion</th>
                <th className="py-2.5 px-3">Estimated Delay</th>
                <th className="py-2.5 px-3">Flood Exposure</th>
                <th className="py-2.5 px-3">Primary Vulnerability</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHotspots.map((item) => {
                const meta = getTrafficRiskClassification(item.riskScore);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${meta.badgeBg}`} />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono ml-3.5">
                        {item.type} • {item.code}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 font-mono">{item.riskScore}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.colorClass}`}>
                          {meta.label}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {item.congestion}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                      +{item.delayMin} min
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.floodExposure === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.floodExposure}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                      {item.issue}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {item.original && (
                        <button
                          onClick={() => onSelectRoad?.(item.original!)}
                          className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold hover:underline"
                        >
                          Inspect on Map
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
