/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RoadSegment,
  UrbanZone,
  ResilienceWeights,
  ScenarioSimulationParams,
  SimulationResult,
  RiskLevel,
  CongestionLevel,
} from '../types';

/**
 * Traffic Risk Classification Mapping
 * 0–30     LOW
 * 31–60    MODERATE
 * 61–80    HIGH
 * 81–100   VERY HIGH
 */
export function getTrafficRiskClassification(score: number): {
  label: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  level: RiskLevel;
  colorClass: string;
  badgeBg: string;
  textColor: string;
} {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped <= 30) {
    return {
      label: 'LOW',
      level: 'LOW',
      colorClass: 'text-emerald-700 border-emerald-200 bg-emerald-50',
      badgeBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    };
  }
  if (clamped <= 60) {
    return {
      label: 'MODERATE',
      level: 'MODERATE',
      colorClass: 'text-amber-700 border-amber-200 bg-amber-50',
      badgeBg: 'bg-amber-500',
      textColor: 'text-amber-700',
    };
  }
  if (clamped <= 80) {
    return {
      label: 'HIGH',
      level: 'HIGH',
      colorClass: 'text-orange-700 border-orange-200 bg-orange-50',
      badgeBg: 'bg-orange-500',
      textColor: 'text-orange-700',
    };
  }
  return {
    label: 'VERY HIGH',
    level: 'VERY_HIGH',
    colorClass: 'text-rose-700 border-rose-200 bg-rose-50',
    badgeBg: 'bg-rose-600',
    textColor: 'text-rose-700',
  };
}

export function getCongestionClassification(congestion: CongestionLevel): {
  label: string;
  dotColor: string;
  badgeClass: string;
} {
  switch (congestion) {
    case 'FREE_FLOW':
      return { label: 'Free Flow', dotColor: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'MODERATE':
      return { label: 'Moderate', dotColor: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'CONGESTED':
      return { label: 'Congested', dotColor: 'bg-orange-500', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'SEVERE':
      return { label: 'Severe Congestion', dotColor: 'bg-rose-600', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
}

/**
 * Modular Traffic Risk / Congestion Engine
 * Combines road capacity proxy, connectivity, weather inundation, and heat stress.
 */
export function estimateSegmentTrafficRisk(
  segment: RoadSegment,
  rainfallMm: number = 23,
  drainageImprovementPct: number = 0,
  signalOptPct: number = 0,
  roadCapacityBoostPct: number = 0
): {
  trafficRisk: number;
  congestionLevel: CongestionLevel;
  estimatedDelayMin: number;
  effectiveCapacityPct: number;
  waterloggingDepthCm: number;
} {
  // 1. Base Volume/Capacity ratio
  const baseCapacity = segment.capacityVehiclesPerHour * (1 + roadCapacityBoostPct / 100);
  const baseVCRatio = segment.currentLoadVehiclesPerHour / Math.max(1, baseCapacity);

  // 2. Weather & Flood/Waterlogging impact on effective capacity
  // Increased rainfall adds standing water, mitigated by drainage efficiency + improvement
  const effectiveDrainage = Math.min(95, segment.drainageEfficiency + drainageImprovementPct);
  const waterDepth = Math.max(
    0,
    segment.waterloggingDepthCm * (1 - effectiveDrainage / 100 * 0.8) * (rainfallMm / 20)
  );

  // Water depth drops road capacity drastically (at 30cm, capacity drops ~50%)
  const waterCapacityPenalty = Math.min(0.85, (waterDepth / 45) * 0.7);
  const effectiveCapacityPct = Math.max(15, Math.round((1 - waterCapacityPenalty) * 100));

  // 3. Signal optimization bonus (reduces delay and queue accumulation)
  const signalReductionFactor = 1 - (signalOptPct / 100) * 0.35;

  // 4. Combined Traffic Risk (0 - 100)
  const loadStress = Math.min(1.5, baseVCRatio / (effectiveCapacityPct / 100));
  let calculatedRisk = Math.round(loadStress * 55 + (waterDepth / 40) * 35 + (segment.heatExposure === 'HIGH' ? 8 : 4));
  calculatedRisk = Math.round(calculatedRisk * signalReductionFactor);
  calculatedRisk = Math.max(10, Math.min(98, calculatedRisk));

  // 5. Congestion Level classification
  let congestionLevel: CongestionLevel = 'FREE_FLOW';
  if (calculatedRisk > 80) congestionLevel = 'SEVERE';
  else if (calculatedRisk > 60) congestionLevel = 'CONGESTED';
  else if (calculatedRisk > 30) congestionLevel = 'MODERATE';

  // 6. Estimated Delay in minutes
  const estimatedDelayMin = Math.max(
    1,
    Math.round((calculatedRisk / 100) * 22 * (waterDepth > 15 ? 1.4 : 1.0) * signalReductionFactor)
  );

  return {
    trafficRisk: calculatedRisk,
    congestionLevel,
    estimatedDelayMin,
    effectiveCapacityPct,
    waterloggingDepthCm: Math.round(waterDepth),
  };
}

/**
 * Urban Mobility Disruption Index (UMDI)
 * Analyzes how environmental conditions compound mobility vulnerability.
 * Rain -> Waterlogging -> Road capacity loss -> Congestion -> Emergency disruption
 */
export function calculateUMDI(
  floodScore: number,
  heatScore: number,
  trafficScore: number,
  popExposureScore: number
): {
  score: number;
  classification: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  cascadeChain: string[];
} {
  // Compounding non-linear factor: when both flood and traffic are high, disruption spikes
  const compoundMultiplier = floodScore > 70 && trafficScore > 75 ? 1.15 : 1.0;
  const rawScore =
    (floodScore * 0.38 + trafficScore * 0.36 + heatScore * 0.14 + popExposureScore * 0.12) * compoundMultiplier;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const classification = getTrafficRiskClassification(score).label;

  const cascadeChain = [
    `Precipitation surges trigger lowland ponding (Flood Risk: ${floodScore})`,
    `Roadway surface ponding reduces effective throughput by up to 45%`,
    `Spillover delays choke key corridors (Traffic Risk: ${trafficScore})`,
    `Emergency corridors experience high access friction`,
  ];

  return { score, classification, cascadeChain };
}

/**
 * Urban Resilience Index
 * Configurable multi-dimensional weighted index (Flood, Heat, Traffic, Population, Infrastructure)
 */
export function calculateUrbanResilienceIndex(
  floodRisk: number,
  heatRisk: number,
  trafficRisk: number,
  populationExposure: number,
  infrastructureVulnerability: number,
  weights: ResilienceWeights
): {
  score: number;
  level: RiskLevel;
  breakdown: { label: string; weightedScore: number; weightPct: number }[];
} {
  const totalWeight =
    weights.floodRisk +
    weights.heatRisk +
    weights.trafficRisk +
    weights.populationExposure +
    weights.infrastructure || 100;

  const wFlood = weights.floodRisk / totalWeight;
  const wHeat = weights.heatRisk / totalWeight;
  const wTraffic = weights.trafficRisk / totalWeight;
  const wPop = weights.populationExposure / totalWeight;
  const wInfra = weights.infrastructure / totalWeight;

  const score = Math.round(
    floodRisk * wFlood +
      heatRisk * wHeat +
      trafficRisk * wTraffic +
      populationExposure * wPop +
      infrastructureVulnerability * wInfra
  );

  const level = getTrafficRiskClassification(score).level;

  return {
    score,
    level,
    breakdown: [
      { label: 'Flood Risk', weightedScore: Math.round(floodRisk * wFlood), weightPct: Math.round(wFlood * 100) },
      { label: 'Heat Risk', weightedScore: Math.round(heatRisk * wHeat), weightPct: Math.round(wHeat * 100) },
      { label: 'Traffic Risk', weightedScore: Math.round(trafficRisk * wTraffic), weightPct: Math.round(wTraffic * 100) },
      { label: 'Population Exposure', weightedScore: Math.round(populationExposure * wPop), weightPct: Math.round(wPop * 100) },
      { label: 'Infrastructure', weightedScore: Math.round(infrastructureVulnerability * wInfra), weightPct: Math.round(wInfra * 100) },
    ],
  };
}

/**
 * What-If Traffic & Climate Scenario Simulator
 */
export function simulateScenario(
  baseSegments: RoadSegment[],
  baseZones: UrbanZone[],
  params: ScenarioSimulationParams,
  weights: ResilienceWeights
): SimulationResult {
  // 1. Current Baseline scores
  const currentTrafficRisk = 82;
  const currentFloodRisk = 78;
  const currentHeatRisk = 71;
  const currentPop = 72;
  const currentInfra = 70;

  const currentResilience = calculateUrbanResilienceIndex(
    currentFloodRisk,
    currentHeatRisk,
    currentTrafficRisk,
    currentPop,
    currentInfra,
    weights
  ).score;

  // 2. Scenario adjustments
  // Drainage improvement impacts both Flood Risk and Traffic Risk (clearing water faster)
  const floodReductionFromDrainage = params.drainageImprovementPercent * 0.28;
  const scenarioFloodRisk = Math.max(30, Math.round(currentFloodRisk - floodReductionFromDrainage));

  // Traffic risk is reduced by:
  // - Signal optimization
  // - Road capacity improvement
  // - Alternative corridor activation
  // - Drainage improvement reducing waterlogging
  const trafficReliefFromSignals = params.signalOptimizationPercent * 0.32;
  const trafficReliefFromCapacity = params.roadCapacityImprovementPercent * 0.25;
  const trafficReliefFromCorridor = params.alternativeCorridorEnabled ? 8 : 0;
  const trafficReliefFromDrainage = params.drainageImprovementPercent * 0.15;

  const scenarioTrafficRisk = Math.max(
    25,
    Math.round(
      currentTrafficRisk -
        (trafficReliefFromSignals +
          trafficReliefFromCapacity +
          trafficReliefFromCorridor +
          trafficReliefFromDrainage)
    )
  );

  // Heat risk reduced by urban canopy
  const heatReductionFromCanopy = params.urbanCanopyPercent * 0.22;
  const scenarioHeatRisk = Math.max(40, Math.round(currentHeatRisk - heatReductionFromCanopy));

  const scenarioResilience = calculateUrbanResilienceIndex(
    scenarioFloodRisk,
    scenarioHeatRisk,
    scenarioTrafficRisk,
    Math.max(20, Math.round(currentPop - 4)),
    Math.max(20, Math.round(currentInfra - params.drainageImprovementPercent * 0.1)),
    weights
  ).score;

  return {
    current: {
      trafficRisk: currentTrafficRisk,
      floodRisk: currentFloodRisk,
      heatRisk: currentHeatRisk,
      overallResilienceScore: currentResilience,
    },
    scenario: {
      trafficRisk: scenarioTrafficRisk,
      floodRisk: scenarioFloodRisk,
      heatRisk: scenarioHeatRisk,
      overallResilienceScore: scenarioResilience,
    },
    trafficDelta: scenarioTrafficRisk - currentTrafficRisk,
    floodDelta: scenarioFloodRisk - currentFloodRisk,
    heatDelta: scenarioHeatRisk - currentHeatRisk,
    overallDelta: scenarioResilience - currentResilience,
  };
}
