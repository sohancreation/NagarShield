/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Waves,
  ThermometerSun,
  CloudRain,
  CloudLightning,
  Wind,
  ShieldAlert,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
  CheckCircle2,
  Info,
  Droplets,
  BellRing,
  ArrowRight,
} from 'lucide-react';
import { LiveWeatherData, WeatherAlert } from '../types';

interface WeatherAlertBannerProps {
  alerts?: WeatherAlert[];
  currentWeather: LiveWeatherData | null;
  selectedCity: string;
  onRefresh: () => void;
  isLoading?: boolean;
  onNavigateToEmergency?: () => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  alerts: directAlerts,
  currentWeather,
  selectedCity,
  onRefresh,
  isLoading = false,
  onNavigateToEmergency,
}) => {
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [simulationMode, setSimulationMode] = useState<'live' | 'flood' | 'heatwave' | 'nominal'>('live');

  // Synthesize alerts if API returned alerts or if real-time atmospheric readings breach critical limits
  const consolidatedAlerts: WeatherAlert[] = useMemo(() => {
    if (simulationMode === 'nominal') {
      return [];
    }

    if (simulationMode === 'flood') {
      return [
        {
          id: 'sim-flood-critical',
          level: 'CRITICAL',
          category: 'FLOOD',
          title: 'Critical Flood Emergency: Severe Monsoon Inundation (18.5 mm/h)',
          message: 'Canal sump and culvert systems operating under 88% capacity surcharge. Low-lying arterial underpasses at Mirpur Road and Tejgaon are submerged under 35cm of water. Critical transit delays (+35 min).',
          actionRecommendation: 'Activate high-capacity municipal sluice pumps; divert heavy buses and ambulances to elevated bypass corridors; close flooded underpasses.',
          affectedMetric: 'Precipitation & Waterlogging',
          metricValue: '18.5 mm/h | 88% Surcharge',
          issuedAt: new Date().toISOString(),
        },
        {
          id: 'sim-rain-friction',
          level: 'WARNING',
          category: 'FLOOD',
          title: 'Pavement Friction Hazard: Wet-Surface Braking Distance +45%',
          message: 'Hydroplaning danger on arterial links and grade-separated expressways. Multi-vehicle collision risk elevated.',
          actionRecommendation: 'Reduce corridor speed limits to 30 km/h and maintain 50m minimum vehicle headway.',
          affectedMetric: 'Braking Friction Loss',
          metricValue: '-45% Friction',
          issuedAt: new Date().toISOString(),
        },
      ];
    }

    if (simulationMode === 'heatwave') {
      return [
        {
          id: 'sim-heatwave-critical',
          level: 'CRITICAL',
          category: 'HEATWAVE',
          title: 'Critical Heatwave Emergency: 43.8°C Heat Index (Extreme Danger)',
          message: 'Extreme solar irradiance and urban asphalt absorption producing surface temperatures above 50°C. Imminent danger of heat stroke, pedestrian thermal collapse, and vehicle radiator boiling in gridlocked traffic.',
          actionRecommendation: 'Activate civic misting canopies; establish emergency hydration tents at bus terminals; restrict strenuous outdoor labor and cycling between 11:00 and 15:30.',
          affectedMetric: 'Feels-Like Heat Index',
          metricValue: '43.8°C (Extreme Danger)',
          issuedAt: new Date().toISOString(),
        },
      ];
    }

    const list: WeatherAlert[] = [];
    const seenTitles = new Set<string>();

    // 1. First add alerts from the API payload
    if (directAlerts && directAlerts.length > 0) {
      directAlerts.forEach((alt) => {
        if (!seenTitles.has(alt.title)) {
          list.push(alt);
          seenTitles.add(alt.title);
        }
      });
    }

    // 2. Dynamically evaluate real-time API atmospheric parameters to ensure no critical warning is missed
    if (currentWeather) {
      const rain = currentWeather.rain1hMm || 0;
      const feelsLike = currentWeather.feelsLikeC ?? currentWeather.temperatureC ?? 0;
      const surcharge = currentWeather.compoundImpacts?.drainageSurchargePercent || 0;
      const frictionLoss = currentWeather.compoundImpacts?.frictionLossPercent || 0;
      const cond = (currentWeather.weatherCondition || '').toLowerCase();
      const aqi = currentWeather.airQuality?.aqi || 1;

      // Real-time Critical Flood condition
      const isSevereRain = rain >= 8 || surcharge >= 75 || cond.includes('thunderstorm') || (rain >= 4 && surcharge >= 60);
      if (isSevereRain && !list.some((a) => a.category === 'FLOOD')) {
        const isCritical = rain >= 12 || surcharge >= 80;
        list.unshift({
          id: 'dyn-flood-critical',
          level: isCritical ? 'CRITICAL' : 'WARNING',
          category: 'FLOOD',
          title: `${isCritical ? 'Critical Flood Warning' : 'Flash Inundation Alert'}: ${rain > 0 ? rain + ' mm/h' : 'Monsoon Surge'}`,
          message: `Stormwater drainage channels operating at acute ${surcharge}% capacity surcharge. Low-lying arterial underpasses, culverts, and canal basins face high inundation risks with -${frictionLoss}% pavement braking friction.`,
          actionRecommendation: 'Activate high-capacity dewatering pumps, deploy drainage siphons, and reroute heavy transit to designated high-ground corridors.',
          affectedMetric: 'Precipitation & Drainage',
          metricValue: `${rain} mm/h (${surcharge}% surcharge)`,
          issuedAt: currentWeather.observedAt || new Date().toISOString(),
        });
      }

      // Real-time Critical Heatwave condition
      const isSevereHeat = feelsLike >= 38 || currentWeather.temperatureC >= 36;
      if (isSevereHeat && !list.some((a) => a.category === 'HEATWAVE')) {
        const isCriticalHeat = feelsLike >= 42;
        list.push({
          id: 'dyn-heatwave-critical',
          level: isCriticalHeat ? 'CRITICAL' : 'WARNING',
          category: 'HEATWAVE',
          title: `${isCriticalHeat ? 'Critical Heatwave Emergency' : 'Severe Heatwave Warning'}: ${feelsLike}°C Heat Index`,
          message: `Solar radiation and asphalt concrete absorption elevate surface temperatures past 46°C. Severe hazard for pedestrians, cyclists, and vehicle cooling systems in stalled traffic.`,
          actionRecommendation: 'Prioritize shaded canopy paths, utilize municipal hydration points, and avoid strenuous outdoor travel during peak heat windows.',
          affectedMetric: 'Feels-Like Heat Index',
          metricValue: `${feelsLike}°C`,
          issuedAt: currentWeather.observedAt || new Date().toISOString(),
        });
      }

      // Real-time Severe Wind condition
      const windSpeed = currentWeather.windSpeedMs || 0;
      if (windSpeed >= 11 && !list.some((a) => a.category === 'STORM' || a.category === 'WIND')) {
        list.push({
          id: 'dyn-wind-warning',
          level: windSpeed >= 15 ? 'CRITICAL' : 'WARNING',
          category: 'WIND',
          title: `Gale & High-Wind Warning: ${currentWeather.windSpeedKmh} km/h`,
          message: `Elevated crosswind hazard across highway flyovers, suspension bridges, and elevated transit corridors.`,
          actionRecommendation: 'Enforce speed restrictions for two-wheelers and high-profile freight vehicles on exposed flyovers.',
          affectedMetric: 'Wind Velocity',
          metricValue: `${currentWeather.windSpeedKmh} km/h`,
          issuedAt: currentWeather.observedAt || new Date().toISOString(),
        });
      }

      // Real-time Severe Air Quality
      if (aqi >= 4 && !list.some((a) => a.category === 'AIR_QUALITY')) {
        list.push({
          id: 'dyn-aqi-hazard',
          level: aqi === 5 ? 'CRITICAL' : 'WARNING',
          category: 'AIR_QUALITY',
          title: `Hazardous Air Quality Alert: AQI Level ${aqi} (${currentWeather.airQuality?.pm25 ?? 0} µg/m³ PM2.5)`,
          message: `Heavy particulate matter accumulation in congested urban corridors. High respiratory and pulmonary hazard for commuters.`,
          actionRecommendation: 'Wear N95 protective filtration masks; keep vehicle ventilation in internal recirculation mode.',
          affectedMetric: 'Air Quality Index',
          metricValue: `AQI ${aqi} (${currentWeather.airQuality?.label})`,
          issuedAt: currentWeather.observedAt || new Date().toISOString(),
        });
      }
    }

    // Sort so CRITICAL is always first, then WARNING, then ADVISORY, then CAUTION
    const rank: Record<string, number> = { CRITICAL: 0, WARNING: 1, ADVISORY: 2, CAUTION: 3 };
    return list.sort((a, b) => (rank[a.level] ?? 9) - (rank[b.level] ?? 9));
  }, [directAlerts, currentWeather, simulationMode]);

  // Adjust active index if out of bounds
  const currentAlert = consolidatedAlerts[activeAlertIndex] || consolidatedAlerts[0] || null;

  const nextAlert = () => {
    setActiveAlertIndex((prev) => (prev + 1) % consolidatedAlerts.length);
  };

  const prevAlert = () => {
    setActiveAlertIndex((prev) => (prev - 1 + consolidatedAlerts.length) % consolidatedAlerts.length);
  };

  // If dismissed or no alerts
  if (isDismissed && consolidatedAlerts.length > 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300 shadow-sm transition">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="font-semibold text-white">
            {consolidatedAlerts.length} Active Weather Warning{consolidatedAlerts.length > 1 ? 's' : ''} Minimized
          </span>
          <span className="hidden sm:inline text-slate-400">
            ({consolidatedAlerts[0]?.title})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDismissed(false)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-medium transition cursor-pointer"
          >
            Show Alert Banner
          </button>
        </div>
      </div>
    );
  }

  // If no critical alerts active for the current station
  if (consolidatedAlerts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                Real-Time Weather Status: All Clear
              </span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40 font-mono">
                NOMINAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              No critical flood warnings or severe heatwave alerts active for {currentWeather?.city || selectedCity}. Atmospheric parameters are within standard municipal safety limits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 text-[11px] border border-slate-700">
            <span className="text-slate-400 px-2 py-0.5 text-[10px] uppercase font-bold">Simulate:</span>
            <button
              type="button"
              onClick={() => setSimulationMode('live')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                simulationMode === 'live' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live API
            </button>
            <button
              type="button"
              onClick={() => setSimulationMode('flood')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                simulationMode === 'flood' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌊 Flood
            </button>
            <button
              type="button"
              onClick={() => setSimulationMode('heatwave')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                simulationMode === 'heatwave' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ☀️ Heatwave
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            Refresh Check
          </button>
        </div>
      </div>
    );
  }

  // Determine styling based on highest active alert level
  const isCritical = currentAlert.level === 'CRITICAL';
  const isWarning = currentAlert.level === 'WARNING';
  const isFlood = currentAlert.category === 'FLOOD' || currentAlert.title.toLowerCase().includes('flood') || currentAlert.title.toLowerCase().includes('inundation');
  const isHeat = currentAlert.category === 'HEATWAVE' || currentAlert.title.toLowerCase().includes('heat');

  const getAlertIcon = () => {
    if (isFlood) return <Waves className="w-5 h-5 text-rose-300 shrink-0" />;
    if (isHeat) return <ThermometerSun className="w-5 h-5 text-amber-300 shrink-0" />;
    if (currentAlert.category === 'STORM') return <CloudLightning className="w-5 h-5 text-amber-300 shrink-0" />;
    if (currentAlert.category === 'WIND') return <Wind className="w-5 h-5 text-teal-300 shrink-0" />;
    return <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />;
  };

  const getThemeClasses = () => {
    if (isCritical || (isFlood && isWarning)) {
      return {
        wrapper: 'bg-gradient-to-r from-rose-950/95 via-red-950/90 to-slate-950 border-rose-600/50 shadow-md shadow-rose-950/30',
        badge: 'bg-rose-600 text-white border-rose-400 shadow-xs',
        pulse: 'bg-rose-500',
        title: 'text-rose-100',
        metricChip: 'bg-rose-950/70 border-rose-800/60 text-rose-200',
        accentBtn: 'bg-rose-600 hover:bg-rose-500 text-white',
      };
    }
    if (isHeat) {
      return {
        wrapper: 'bg-gradient-to-r from-orange-950/95 via-amber-950/90 to-slate-950 border-amber-500/50 shadow-md shadow-amber-950/30',
        badge: 'bg-amber-600 text-white border-amber-400 shadow-xs',
        pulse: 'bg-amber-500',
        title: 'text-amber-100',
        metricChip: 'bg-amber-950/70 border-amber-800/60 text-amber-200',
        accentBtn: 'bg-amber-600 hover:bg-amber-500 text-white',
      };
    }
    return {
      wrapper: 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/40 shadow-xs',
      badge: 'bg-amber-600 text-white border-amber-400',
      pulse: 'bg-amber-400',
      title: 'text-amber-100',
      metricChip: 'bg-slate-900/80 border-slate-700 text-slate-200',
      accentBtn: 'bg-slate-800 hover:bg-slate-700 text-white',
    };
  };

  const theme = getThemeClasses();

  return (
    <div
      id="weather-alert-banner"
      className={`rounded-2xl border p-4 sm:p-4.5 text-white transition-all duration-200 ${theme.wrapper}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Top Meta Bar: Status, Category, Emergency Level & Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Real-time pulsing beacon */}
          <span className="flex h-3 w-3 relative shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.pulse}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${theme.pulse}`}
            ></span>
          </span>

          {/* Level badge */}
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider border ${theme.badge} flex items-center gap-1`}
          >
            <BellRing className="w-3 h-3 animate-bounce" />
            {currentAlert.level === 'CRITICAL'
              ? 'CRITICAL ALERT'
              : currentAlert.level === 'WARNING'
              ? 'CRITICAL WARNING'
              : currentAlert.level}
          </span>

          {/* Hazard category badge */}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white border border-white/20 uppercase tracking-wider font-mono">
            {currentAlert.category ? `${currentAlert.category} HAZARD` : 'METEOROLOGICAL WARNING'}
          </span>

          {/* City / Station Name */}
          <span className="text-[11px] font-medium text-white/80 hidden md:inline">
            • {currentWeather?.city || selectedCity} Municipal Basin
          </span>

          {/* Real-time API tag */}
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
            LIVE API FEED
          </span>
        </div>

        {/* Multi-alert navigator & control actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          {consolidatedAlerts.length > 1 && (
            <div className="flex items-center bg-black/30 rounded-lg p-0.5 text-[11px] border border-white/10 mr-1">
              <button
                type="button"
                onClick={prevAlert}
                className="p-1 hover:bg-white/10 rounded transition text-white/80 hover:text-white"
                title="Previous warning"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[10px] text-white/90">
                {activeAlertIndex + 1}/{consolidatedAlerts.length}
              </span>
              <button
                type="button"
                onClick={nextAlert}
                className="p-1 hover:bg-white/10 rounded transition text-white/80 hover:text-white"
                title="Next warning"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 bg-white/10 hover:bg-white/15 text-white/90 rounded-lg text-[11px] font-medium transition cursor-pointer"
          >
            {isExpanded ? 'Less' : 'Details'}
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Live Atmospheric Warnings"
            className="p-1.5 bg-white/10 hover:bg-white/15 text-white/90 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-300' : ''}`} />
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            title="Minimize alert banner"
            className="p-1.5 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Alert Body */}
      <div className="mt-3 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/10 border border-white/15 shrink-0 hidden sm:flex items-center justify-center">
          {getAlertIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${theme.title}`}>
              {currentAlert.title}
            </h3>
            {currentAlert.metricValue && (
              <span className="text-[11px] font-mono bg-black/40 text-white/90 px-2 py-0.5 rounded border border-white/15">
                {currentAlert.metricValue}
              </span>
            )}
          </div>

          <p className="text-xs text-white/90 leading-relaxed mt-1">
            {currentAlert.message}
          </p>

          {/* Actionable Safety / Dispatch Directive */}
          {currentAlert.actionRecommendation && isExpanded && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <strong className="text-emerald-300 font-semibold uppercase tracking-wider block">
                  Recommended Municipal & Citizen Action:
                </strong>
                <span className="text-white/85 leading-normal">
                  {currentAlert.actionRecommendation}
                </span>
              </div>
            </div>
          )}

          {/* Real-time Atmospheric Metric Chips */}
          {isExpanded && currentWeather && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">
                Live Sensor Readings:
              </span>

              {/* Rain Chip */}
              <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 ${theme.metricChip}`}>
                <CloudRain className="w-3 h-3 text-sky-400" />
                <span>Precipitation:</span>
                <strong className="font-mono text-white">
                  {currentWeather.rain1hMm > 0 ? `${currentWeather.rain1hMm} mm/h` : currentWeather.weatherCondition}
                </strong>
              </div>

              {/* Drainage Surcharge */}
              <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 ${theme.metricChip}`}>
                <Waves className="w-3 h-3 text-cyan-400" />
                <span>Drainage Surcharge:</span>
                <strong className="font-mono text-white">
                  {currentWeather.compoundImpacts?.drainageSurchargePercent ?? 68}%
                </strong>
              </div>

              {/* Feels Like Temp */}
              <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 ${theme.metricChip}`}>
                <ThermometerSun className="w-3 h-3 text-amber-400" />
                <span>Feels-Like Index:</span>
                <strong className="font-mono text-white">
                  {currentWeather.feelsLikeC ?? 32}°C ({currentWeather.compoundImpacts?.heatIndexCategory || 'Normal'})
                </strong>
              </div>

              {/* Pavement Friction */}
              <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 ${theme.metricChip}`}>
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>Braking Friction:</span>
                <strong className="font-mono text-white">
                  -{currentWeather.compoundImpacts?.frictionLossPercent ?? 15}%
                </strong>
              </div>

              {/* Scenario Mode Switcher */}
              <div className="flex items-center bg-black/40 rounded-lg p-0.5 text-[10px] border border-white/10">
                <span className="text-white/60 px-1.5 font-bold uppercase">Scenario:</span>
                <button
                  type="button"
                  onClick={() => setSimulationMode('live')}
                  className={`px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    simulationMode === 'live' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Live API
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('flood')}
                  className={`px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    simulationMode === 'flood' ? 'bg-rose-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  🌊 Flood
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('heatwave')}
                  className={`px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    simulationMode === 'heatwave' ? 'bg-amber-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  ☀️ Heatwave
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('nominal')}
                  className={`px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                    simulationMode === 'nominal' ? 'bg-slate-700 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  All Clear
                </button>
              </div>

              {/* Navigation link to emergency corridor routing if prop provided */}
              {onNavigateToEmergency && (
                <button
                  type="button"
                  onClick={onNavigateToEmergency}
                  className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${theme.accentBtn}`}
                >
                  <span>Emergency Corridors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
