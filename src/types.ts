/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type CongestionLevel = 'FREE_FLOW' | 'MODERATE' | 'CONGESTED' | 'SEVERE';

export type ExposureLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RoadSegment {
  id: string;
  name: string;
  code: string;
  type: 'arterial' | 'expressway' | 'secondary' | 'collector' | 'feeder';
  zoneId: string;
  coordinates: [number, number][]; // SVG map path coordinates [x, y]
  trafficRiskScore: number; // 0 - 100
  congestionLevel: CongestionLevel;
  estimatedDelayMin: number;
  floodExposure: ExposureLevel;
  waterloggingDepthCm: number;
  heatExposure: ExposureLevel;
  surfaceTempC: number;
  capacityVehiclesPerHour: number;
  currentLoadVehiclesPerHour: number;
  roadConnectivityScore: number; // 0 - 100
  isClosed: boolean;
  isEmergencyCorridor: boolean;
  description: string;
  drainageEfficiency: number; // percentage
}

export interface UrbanZone {
  id: string;
  name: string;
  code: string;
  populationDensityPerSqKm: number;
  populationExposureScore: number; // 0 - 100
  floodRiskScore: number; // 0 - 100
  heatRiskScore: number; // 0 - 100
  trafficRiskScore: number; // 0 - 100
  infrastructureVulnerabilityScore: number; // 0 - 100
  greenCoveragePercent: number;
  umdiScore: number; // Urban Mobility Disruption Index
  criticalFacilities: string[];
  centroid: [number, number];
}

export interface JunctionNode {
  id: string;
  name: string;
  coordinates: [number, number];
  trafficRiskScore: number;
  floodRiskScore: number;
  congestionLevel: CongestionLevel;
  criticalIntersection: boolean;
  connectedRoadIds: string[];
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'FIRE_STATION' | 'SHELTER';
  coordinates: [number, number];
  zoneId: string;
  address: string;
  readinessStatus: 'OPERATIONAL' | 'STANDBY' | 'HIGH_ALERT';
}

export interface RouteOption {
  id: string;
  name: string;
  pathSegmentIds: string[];
  distanceKm: number;
  travelTimeMin: number;
  floodExposure: ExposureLevel;
  heatExposure: ExposureLevel;
  trafficExposure: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  overallMobilityRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  mobilityRiskScore: number; // 0 - 100
  tradeOffSummary: string;
  idealFor: string;
  color: string;
}

export interface EmergencyRouteAnalysis {
  facility: EmergencyFacility;
  originZone: UrbanZone;
  primaryCorridor: {
    roadName: string;
    floodRisk: ExposureLevel;
    trafficRisk: CongestionLevel;
    status: 'AVOID' | 'CAUTION' | 'CLEAR';
    advisory: string;
    estimatedDelayMin: number;
  };
  alternativeCorridor: {
    roadName: string;
    floodRisk: ExposureLevel;
    trafficRisk: CongestionLevel;
    status: 'RECOMMENDED' | 'VIABLE';
    advisory: string;
    estimatedDelayMin: number;
  };
  totalDistanceKm: number;
  estimatedArrivalMin: number;
  interactionInsight: string;
}

export interface LiveMobilityData {
  city: string;
  trafficCondition: 'Light' | 'Moderate' | 'Heavy' | 'Gridlock';
  congestedSegmentsCount: number;
  averageDelayMin: number;
  floodAffectedRoadsCount: number;
  emergencyCorridorsActive: number;
  highRiskJunctionsCount: number;
  lastUpdated: string;
  isLiveApi: boolean;
  dataSourceNotice: string;
  temperatureC: number;
  rainfallMm: number;
}

export interface ResilienceWeights {
  floodRisk: number; // e.g. 30
  heatRisk: number; // e.g. 25
  trafficRisk: number; // e.g. 25
  populationExposure: number; // e.g. 10
  infrastructure: number; // e.g. 10
}

export interface ScenarioSimulationParams {
  signalOptimizationPercent: number; // 0 - 50%
  roadCapacityImprovementPercent: number; // 0 - 50%
  alternativeCorridorEnabled: boolean;
  drainageImprovementPercent: number; // 0 - 60%
  urbanCanopyPercent: number; // 0 - 40%
}

export interface SimulationResult {
  current: {
    trafficRisk: number;
    floodRisk: number;
    heatRisk: number;
    overallResilienceScore: number;
  };
  scenario: {
    trafficRisk: number;
    floodRisk: number;
    heatRisk: number;
    overallResilienceScore: number;
  };
  trafficDelta: number;
  floodDelta: number;
  heatDelta: number;
  overallDelta: number;
}

export interface AiRecommendation {
  id: string;
  title: string;
  category: 'DRAINAGE' | 'CORRIDOR' | 'SIGNAL' | 'PEDESTRIAN' | 'BOTTLENECK' | 'CANOPY';
  reason: string;
  targetZone: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  estimatedTrafficImpact: string;
  estimatedResilienceGain: string;
}

export type GisLayerKey =
  | 'floodRisk'
  | 'heatRisk'
  | 'trafficRisk'
  | 'combinedRisk'
  | 'populationExposure'
  | 'greenCoverage'
  | 'infrastructureVulnerability';

export interface WeatherAlert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'CAUTION';
  category?: 'FLOOD' | 'HEATWAVE' | 'STORM' | 'WIND' | 'AIR_QUALITY' | 'GENERAL';
  title: string;
  message: string;
  actionRecommendation?: string;
  affectedMetric?: string;
  metricValue?: string;
  issuedAt?: string;
}

export interface LiveWeatherData {
  success: boolean;
  source: string;
  city: string;
  country: string;
  coord: {
    lat: number;
    lon: number;
  };
  temperatureC: number;
  feelsLikeC: number;
  tempMinC: number;
  tempMaxC: number;
  humidityPercent: number;
  pressureHpa: number;
  windSpeedMs: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustMs?: number;
  cloudinessPercent: number;
  visibilityMeters: number;
  rain1hMm: number;
  weatherCondition: string;
  weatherDescription: string;
  weatherIcon: string;
  sunrise: string;
  sunset: string;
  airQuality: {
    aqi: number;
    label: string;
    pm25: number;
    pm10: number;
  };
  compoundImpacts: {
    heatIndexCategory: string;
    precipSeverity: 'None' | 'Light' | 'Moderate' | 'Heavy' | 'Extreme Storm';
    drainageSurchargePercent: number;
    frictionLossPercent: number;
    urbanHeatIslandDeltaC: number;
  };
  alerts: WeatherAlert[];
  observedAt: string;
}

export interface HourlyForecastItem {
  time: string;
  date: string;
  iso: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  description: string;
  icon: string;
  rainMm: number;
  popPercent: number;
  humidity: number;
  windKmh: number;
  compoundMobilityRisk: number;
}

export interface DailyForecastItem {
  day: string;
  tempMin: number;
  tempMax: number;
  totalRainMm: number;
  maxPopPercent: number;
  condition: string;
  icon: string;
  avgHumidity: number;
}

export interface WeatherForecastData {
  success: boolean;
  city: string;
  country: string;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface GroundingSource {
  type: 'web' | 'maps';
  title: string;
  uri: string;
  snippet?: string;
  placeAddress?: string;
  reviewSnippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  model?: string;
  groundingType?: 'none' | 'search' | 'maps';
  sources?: GroundingSource[];
  isAudioInput?: boolean;
}

export interface ChatRole {
  id: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  systemInstruction: string;
  suggestedQuestions: string[];
}

export interface AiNotification {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFO';
  category: 'FLOOD' | 'HEATWAVE' | 'TRAFFIC' | 'EMERGENCY' | 'DRAINAGE' | 'COMPOUND';
  title: string;
  message: string;
  actionRecommendation: string;
  affectedMetric?: string;
  metricValue?: string;
  locationName: string;
  timestamp: string;
  isRead: boolean;
  isDismissed?: boolean;
  actionType?: 'VIEW_MAP' | 'DISPATCH_EMERGENCY' | 'ASK_AI' | 'VIEW_WEATHER' | 'VIEW_PLANNER' | 'VIEW_ROUTES' | 'VIEW_HOTSPOTS';
}

export interface UrbanDataContext {
  location: {
    name: string;
    zilla: string;
    division: string;
    coordinates: { lat: number; lng: number };
    elevationMeters: number;
    canalOrRiver: string;
    criticalFacilities: {
      hospital: string;
      fireStation: string;
      emergencyReliefHub: string;
    };
  };
  weather?: {
    temperatureC: number;
    feelsLikeC: number;
    rain1hMm: number;
    humidityPercent: number;
    windSpeedKmh: number;
    weatherDescription: string;
    aqi: number;
    heatIndexCategory: string;
    drainageSurchargePercent: number;
    frictionLossPercent: number;
  } | null;
  mobility?: {
    trafficCondition: string;
    congestedSegmentsCount: number;
    averageDelayMin: number;
    floodAffectedRoadsCount: number;
    emergencyCorridorsActive: number;
  };
  resilienceScore?: number;
  activeAlertCount?: number;
  roadsSummary?: Array<{
    id: string;
    name: string;
    waterloggingDepthCm: number;
    trafficRiskScore: number;
    estimatedDelayMin: number;
    status: string;
  }>;
  simulationParams?: {
    signalOptimizationPercent: number;
    roadCapacityImprovementPercent: number;
    alternativeCorridorEnabled: boolean;
    drainageImprovementPercent: number;
    urbanCanopyPercent: number;
  };
}

// Find Care Types
export type CareCategory = 'ALL' | 'HOSPITAL' | 'PHARMACY' | 'DOCTOR' | 'DIAGNOSTIC' | 'CLINIC';

export interface CareProvider {
  id: string;
  name: string;
  category: 'HOSPITAL' | 'PHARMACY' | 'DOCTOR' | 'DIAGNOSTIC' | 'CLINIC';
  specialty?: string;
  doctorName?: string;
  doctorDegree?: string;
  address: string;
  upazila: string;
  zilla: string;
  division: string;
  contactNumber: string;
  emergencyHotline?: string;
  distanceKm: number;
  lat: number;
  lng: number;
  openStatus: string;
  is24x7: boolean;
  hasEmergencyUnit: boolean;
  services: string[];
  rating?: number;
  aiRecommendation?: string;
  floodSafeRoute?: boolean;
}

export interface FindCareSearchResult {
  providers: CareProvider[];
  aiCareSummary: string;
  queryAnalyzed: {
    intent: string;
    categoryDetected: string;
    specialtyDetected?: string;
    locationName: string;
  };
  totalFound: number;
}

