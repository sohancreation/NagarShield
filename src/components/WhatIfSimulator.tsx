/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { ScenarioSimulationParams, ResilienceWeights, RoadSegment, UrbanZone } from '../types';
import { simulateScenario, getTrafficRiskClassification } from '../services/trafficEngine';

interface WhatIfSimulatorProps {
  roads: RoadSegment[];
  zones: UrbanZone[];
  resilienceWeights: ResilienceWeights;
  onBack?: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  roads,
  zones,
  resilienceWeights,
  onBack,
}) => {
  const [params, setParams] = useState<ScenarioSimulationParams>({
    signalOptimizationPercent: 20,
    roadCapacityImprovementPercent: 15,
    alternativeCorridorEnabled: true,
    drainageImprovementPercent: 30,
    urbanCanopyPercent: 10,
  });

  const handleReset = () => {
    setParams({
      signalOptimizationPercent: 0,
      roadCapacityImprovementPercent: 0,
      alternativeCorridorEnabled: false,
      drainageImprovementPercent: 0,
      urbanCanopyPercent: 0,
    });
  };

  const handlePresetExample = () => {
    setParams({
      signalOptimizationPercent: 20,
      roadCapacityImprovementPercent: 10,
      alternativeCorridorEnabled: true,
      drainageImprovementPercent: 30,
      urbanCanopyPercent: 0,
    });
  };

  const simulation = simulateScenario(roads, zones, params, resilienceWeights);

  const currentMeta = getTrafficRiskClassification(simulation.current.trafficRisk);
  const scenarioMeta = getTrafficRiskClassification(simulation.scenario.trafficRisk);
  const currentOverallMeta = getTrafficRiskClassification(simulation.current.overallResilienceScore);
  const scenarioOverallMeta = getTrafficRiskClassification(simulation.scenario.overallResilienceScore);

  return (
    <div id="what-if-scenario-simulator" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 mt-0.5 group"
                title="Back to Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  What-If Urban Resilience & Traffic Intervention Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Model cross-sector resilience gains by adjusting drainage capacities, adaptive signal offsets, corridor bypasses, and tree canopies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePresetExample}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition"
            >
              Load Benchmark Scenario
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs rounded-lg transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Prominent Mandatory Disclosure Label */}
        <div className="mt-3 p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>Analytical Transparency:</strong> The values below represent <em>Scenario estimates</em> derived from our
            integrated hydrological-mobility decision-support model.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive Intervention Sliders */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🚦</span>
              Traffic & Resilience Interventions
            </h3>
            <span className="text-[11px] text-slate-400">Simulation parameters</span>
          </div>

          {/* Slider 1: Drainage Improvement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>🌧️</span> Drainage Improvement
              </span>
              <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                +{params.drainageImprovementPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={params.drainageImprovementPercent}
              onChange={(e) =>
                setParams({ ...params, drainageImprovementPercent: parseInt(e.target.value) })
              }
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Current (0%)</span>
              <span>Sub-surface culverts (+30%)</span>
              <span>Dual retention (+60%)</span>
            </div>
          </div>

          {/* Slider 2: Signal Optimization */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>🚦</span> Adaptive Signal Optimization
              </span>
              <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                +{params.signalOptimizationPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.signalOptimizationPercent}
              onChange={(e) =>
                setParams({ ...params, signalOptimizationPercent: parseInt(e.target.value) })
              }
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Fixed timing (0%)</span>
              <span>Dynamic green wave (+25%)</span>
              <span>Predictive cycle (+50%)</span>
            </div>
          </div>

          {/* Slider 3: Road Capacity Improvement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>🛣️</span> Road Capacity Improvement (Contraflow / Bottleneck widening)
              </span>
              <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                +{params.roadCapacityImprovementPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.roadCapacityImprovementPercent}
              onChange={(e) =>
                setParams({ ...params, roadCapacityImprovementPercent: parseInt(e.target.value) })
              }
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline (0%)</span>
              <span>Pavement widening (+20%)</span>
              <span>Grade separation (+50%)</span>
            </div>
          </div>

          {/* Toggle: Alternative Corridor */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Alternative Elevated Emergency Corridor</div>
              <div className="text-[11px] text-slate-500">
                Activates dedicated bypass routing for emergency and transit vehicles
              </div>
            </div>
            <button
              onClick={() =>
                setParams({
                  ...params,
                  alternativeCorridorEnabled: !params.alternativeCorridorEnabled,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                params.alternativeCorridorEnabled
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {params.alternativeCorridorEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Slider 4: Urban Canopy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>🌳</span> Urban Canopy & Shaded Pedestrian Paths
              </span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +{params.urbanCanopyPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={params.urbanCanopyPercent}
              onChange={(e) =>
                setParams({ ...params, urbanCanopyPercent: parseInt(e.target.value) })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% tree canopy</span>
              <span>Bioswales (+20%)</span>
              <span>Dense corridor cover (+40%)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results (Current vs Scenario) */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold tracking-wide flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Scenario Comparative Results
              </h3>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
                Real-Time Recalculation
              </span>
            </div>

            {/* Side-by-side or delta cards */}
            <div className="space-y-3.5">
              {/* Traffic Risk Result */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Traffic Risk Score:</span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {simulation.trafficDelta < 0 ? `${simulation.trafficDelta} reduction` : 'No change'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-400 font-mono line-through">
                      {simulation.current.trafficRisk}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-2xl font-black text-white font-mono">
                      {simulation.scenario.trafficRisk}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${scenarioMeta.colorClass}`}>
                    {scenarioMeta.label}
                  </span>
                </div>
              </div>

              {/* Flood Risk Result */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Flood Risk Score:</span>
                  <span className="text-[11px] font-bold text-sky-400">
                    {simulation.floodDelta < 0 ? `${simulation.floodDelta} reduction` : 'No change'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-400 font-mono line-through">
                      {simulation.current.floodRisk}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-2xl font-black text-white font-mono">
                      {simulation.scenario.floodRisk}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    DRAINAGE RELIEF
                  </span>
                </div>
              </div>

              {/* Heat Risk Result */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Heat Risk Score:</span>
                  <span className="text-[11px] font-bold text-amber-400">
                    {simulation.heatDelta < 0 ? `${simulation.heatDelta} reduction` : 'Stable'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-400 font-mono">
                      {simulation.current.heatRisk}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className="text-2xl font-black text-white font-mono">
                      {simulation.scenario.heatRisk}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    CANOPY RELIEF
                  </span>
                </div>
              </div>

              {/* Overall Urban Resilience Index */}
              <div className="bg-indigo-950/80 p-4 rounded-lg border border-indigo-700/80 mt-2">
                <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">
                  Overall Urban Risk Index:
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-indigo-300 font-mono line-through">
                      {simulation.current.overallResilienceScore}
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {simulation.scenario.overallResilienceScore}
                    </span>
                    <span className="text-xs text-indigo-200">/ 100</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    {simulation.overallDelta} PTS GAIN
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Simulated scenario demonstrates how joint drainage + corridor bypass investments reduce gridlock even under identical rainfall volumes.
          </div>
        </div>
      </div>
    </div>
  );
};
