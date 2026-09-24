/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, SlidersHorizontal, RotateCcw, ArrowLeft } from 'lucide-react';
import { ResilienceWeights } from '../types';

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: ResilienceWeights;
  onUpdateWeights: (weights: ResilienceWeights) => void;
}

export const WeightsModal: React.FC<WeightsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onUpdateWeights,
}) => {
  if (!isOpen) return null;

  const total =
    weights.floodRisk +
    weights.heatRisk +
    weights.trafficRisk +
    weights.populationExposure +
    weights.infrastructure;

  const handleReset = () => {
    onUpdateWeights({
      floodRisk: 30,
      heatRisk: 25,
      trafficRisk: 25,
      populationExposure: 10,
      infrastructure: 10,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <SlidersHorizontal className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Configure Urban Resilience Weights
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Adjust the relative weight of each vulnerability dimension according to regional planning priorities.
        </p>

        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>🌧️ Flood Risk</span>
              <span className="font-mono font-bold text-sky-600">{weights.floodRisk}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={weights.floodRisk}
              onChange={(e) => onUpdateWeights({ ...weights, floodRisk: parseInt(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>🔥 Heat Risk</span>
              <span className="font-mono font-bold text-amber-600">{weights.heatRisk}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={weights.heatRisk}
              onChange={(e) => onUpdateWeights({ ...weights, heatRisk: parseInt(e.target.value) })}
              className="w-full accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>🚦 Traffic Risk</span>
              <span className="font-mono font-bold text-rose-600">{weights.trafficRisk}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={weights.trafficRisk}
              onChange={(e) =>
                onUpdateWeights({ ...weights, trafficRisk: parseInt(e.target.value) })
              }
              className="w-full accent-rose-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>👥 Population Exposure</span>
              <span className="font-mono font-bold text-purple-600">{weights.populationExposure}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={weights.populationExposure}
              onChange={(e) =>
                onUpdateWeights({ ...weights, populationExposure: parseInt(e.target.value) })
              }
              className="w-full accent-purple-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>🏗️ Infrastructure Vulnerability</span>
              <span className="font-mono font-bold text-emerald-600">{weights.infrastructure}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={weights.infrastructure}
              onChange={(e) =>
                onUpdateWeights({ ...weights, infrastructure: parseInt(e.target.value) })
              }
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset (30/25/25/10/10)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
          >
            Apply Weights
          </button>
        </div>
      </div>
    </div>
  );
};
