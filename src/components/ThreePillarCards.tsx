/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CloudRain, Flame, TrafficCone, ShieldCheck, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ResilienceWeights, LiveWeatherData, LiveMobilityData } from '../types';
import { calculateUrbanResilienceIndex, getTrafficRiskClassification } from '../services/trafficEngine';

interface ThreePillarCardsProps {
  floodRisk: number;
  heatRisk: number;
  trafficRisk: number;
  populationExposure: number;
  infrastructureVulnerability: number;
  weights: ResilienceWeights;
  weatherData?: LiveWeatherData | null;
  mobilityData?: LiveMobilityData | null;
  cityName?: string;
  onOpenWeightsModal?: () => void;
  onSelectPillar?: (pillar: 'flood' | 'heat' | 'traffic') => void;
}

export const ThreePillarCards: React.FC<ThreePillarCardsProps> = ({
  floodRisk = 20,
  heatRisk = 25,
  trafficRisk = 24,
  populationExposure = 60,
  infrastructureVulnerability = 40,
  weights,
  weatherData,
  mobilityData,
  cityName,
  onOpenWeightsModal,
  onSelectPillar,
}) => {
  const resilience = calculateUrbanResilienceIndex(
    floodRisk,
    heatRisk,
    trafficRisk,
    populationExposure,
    infrastructureVulnerability,
    weights
  );

  const trafficMeta = getTrafficRiskClassification(trafficRisk);
  const floodMeta = getTrafficRiskClassification(floodRisk);
  const heatMeta = getTrafficRiskClassification(heatRisk);
  const resilienceMeta = getTrafficRiskClassification(resilience.score);

  const rainMm = weatherData?.rain1hMm ?? 0;
  const tempC = weatherData?.temperatureC ?? 28;
  const feelsLikeC = weatherData?.feelsLikeC ?? 30;
  const congestedCount = mobilityData?.congestedSegmentsCount ?? 0;
  const avgDelay = mobilityData?.averageDelayMin ?? 2;
  const floodCount = mobilityData?.floodAffectedRoadsCount ?? 0;

  return (
    <section id="three-pillar-risk-section" className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Pillar 1: Flood Risk */}
        <div
          id="card-flood-risk"
          onClick={() => onSelectPillar?.('flood')}
          className="bg-white rounded-xl border border-sky-100 p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-sky-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-sky-900 flex items-center gap-1 sm:gap-1.5">
              <CloudRain className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-sky-600" />
              <span className="truncate">Flood Risk</span>
            </span>
            <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${floodMeta.colorClass}`}>
              {floodMeta.label}
            </span>
          </div>

          <div className="flex items-baseline gap-1 sm:gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{floodRisk}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">/ 100</span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1.5 sm:my-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                floodRisk > 60 ? 'bg-rose-500' : floodRisk > 30 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.max(4, Math.min(100, floodRisk))}%` }}
            />
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-1">
            {rainMm > 1.2
              ? `${rainMm}mm/h rain; ${floodCount} corridor${floodCount === 1 ? '' : 's'}.`
              : '0 mm/h rain; clear gravity channels.'}
          </p>
        </div>

        {/* Pillar 2: Heat Risk */}
        <div
          id="card-heat-risk"
          onClick={() => onSelectPillar?.('heat')}
          className="bg-white rounded-xl border border-amber-100 p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1 sm:gap-1.5">
              <Flame className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-600" />
              <span className="truncate">Heat Risk</span>
            </span>
            <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${heatMeta.colorClass}`}>
              {heatMeta.label}
            </span>
          </div>

          <div className="flex items-baseline gap-1 sm:gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{heatRisk}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">/ 100</span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1.5 sm:my-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                heatRisk > 60 ? 'bg-rose-500' : heatRisk > 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(4, Math.min(100, heatRisk))}%` }}
            />
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-1">
            {feelsLikeC > 36
              ? `${tempC}°C (${feelsLikeC}°C feels-like).`
              : `${tempC}°C ambient; standard comfort.`}
          </p>
        </div>

        {/* Pillar 3: Traffic Risk */}
        <div
          id="card-traffic-risk"
          onClick={() => onSelectPillar?.('traffic')}
          className={`bg-white rounded-xl p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer relative overflow-hidden group border ${
            trafficRisk > 60 ? 'border-rose-200 ring-1 ring-rose-200' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div
            className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none ${
              trafficRisk > 60 ? 'bg-rose-50' : 'bg-slate-50'
            }`}
          />
          <div className="flex items-center justify-between relative z-10 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1 sm:gap-1.5">
              <TrafficCone className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${trafficRisk > 60 ? 'text-rose-600' : 'text-slate-600'}`} />
              <span className="truncate">Traffic Risk</span>
            </span>
            <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${trafficMeta.colorClass}`}>
              {trafficMeta.label}
            </span>
          </div>

          <div className="flex items-baseline gap-1 sm:gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{trafficRisk}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">/ 100</span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1.5 sm:my-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                trafficRisk > 60 ? 'bg-rose-600' : trafficRisk > 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(4, Math.min(100, trafficRisk))}%` }}
            />
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-1">
            {congestedCount > 0
              ? `${congestedCount} congested; +${avgDelay} min.`
              : `Free-flowing; ~${avgDelay} min travel.`}
          </p>
        </div>

        {/* Urban Resilience Index (Combined Risk) */}
        <div
          id="card-resilience-index"
          className="bg-white text-slate-900 rounded-xl p-3 sm:p-4 shadow-2xs relative overflow-hidden border border-indigo-200/80 flex flex-col justify-between hover:shadow-xs transition-all"
        >
          <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-indigo-50/70 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 relative z-10">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-900 flex items-center gap-1 sm:gap-1.5">
                <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-indigo-600" />
                <span className="truncate">Resilience</span>
              </span>
              {onOpenWeightsModal && (
                <button
                  onClick={onOpenWeightsModal}
                  className="text-slate-400 hover:text-indigo-600 p-0.5 sm:p-1 rounded hover:bg-indigo-50 transition cursor-pointer"
                  title="Configure planner weights"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-1 sm:gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{resilience.score}</span>
              <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${resilienceMeta.colorClass}`}>
                {resilienceMeta.label}
              </span>
            </div>

            {/* Multi-weight breakdown bar */}
            <div className="flex w-full h-1.5 rounded-full overflow-hidden my-1.5 sm:my-2 bg-slate-100">
              <div style={{ width: `${weights.floodRisk}%` }} className="bg-sky-500" title="Flood 30%" />
              <div style={{ width: `${weights.heatRisk}%` }} className="bg-amber-500" title="Heat 25%" />
              <div style={{ width: `${weights.trafficRisk}%` }} className="bg-rose-500" title="Traffic 25%" />
              <div style={{ width: `${weights.populationExposure}%` }} className="bg-purple-500" title="Population 10%" />
              <div style={{ width: `${weights.infrastructure}%` }} className="bg-emerald-500" title="Infrastructure 10%" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Compound Model</span>
            <button
              onClick={onOpenWeightsModal}
              className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
            >
              Weights ({weights.floodRisk}/{weights.heatRisk}/{weights.trafficRisk}) <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
