/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  MapPin,
  ThermometerSun,
  ShieldAlert,
  Sunrise,
  Sunset,
  Waves,
  Radio,
  ArrowUpRight,
  ChevronRight,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { LiveWeatherData, WeatherForecastData, HourlyForecastItem } from '../types';
import { UpazilaLocation } from '../data/bangladeshLocations';
import { WeatherAlertBanner } from './WeatherAlertBanner';
import { HistoricalWeatherAlertsChart } from './HistoricalWeatherAlertsChart';

interface WeatherMonitoringProps {
  currentWeather: LiveWeatherData | null;
  forecast: WeatherForecastData | null;
  isLoading: boolean;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onRefresh: () => void;
  onNavigateToTab?: (tab: string) => void;
  activeLocation?: UpazilaLocation | null;
  onBack?: () => void;
}

export const WeatherMonitoring: React.FC<WeatherMonitoringProps> = ({
  currentWeather,
  forecast,
  isLoading,
  selectedCity,
  onSelectCity,
  onRefresh,
  onNavigateToTab,
  activeLocation,
  onBack,
}) => {
  const [customCityInput, setCustomCityInput] = useState('');
  const [forecastTab, setForecastTab] = useState<'temp' | 'rain' | 'risk'>('temp');

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCityInput.trim()) {
      onSelectCity(customCityInput.trim());
      setCustomCityInput('');
    }
  };

  const getWeatherIcon = (condition: string, iconCode?: string) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder') || c.includes('lightning')) {
      return <CloudLightning className="w-8 h-8 text-amber-400 animate-pulse" />;
    }
    if (c.includes('rain') || c.includes('drizzle')) {
      return <CloudRain className="w-8 h-8 text-sky-400" />;
    }
    if (c.includes('clear')) {
      return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
    }
    if (c.includes('wind')) {
      return <Wind className="w-8 h-8 text-teal-400" />;
    }
    return <Cloud className="w-8 h-8 text-slate-300" />;
  };

  const getHeatIndexColor = (category: string) => {
    switch (category) {
      case 'Extreme Danger':
        return 'text-rose-700 bg-rose-100 border-rose-300';
      case 'Danger':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'Extreme Caution':
        return 'text-amber-800 bg-amber-100 border-amber-300';
      case 'Caution':
        return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      default:
        return 'text-emerald-800 bg-emerald-100 border-emerald-300';
    }
  };

  const getAqiColor = (aqi: number) => {
    switch (aqi) {
      case 1:
        return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Good' };
      case 2:
        return { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', label: 'Fair' };
      case 3:
        return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate' };
      case 4:
        return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Poor' };
      default:
        return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Very Poor' };
    }
  };

  const aqiInfo = getAqiColor(currentWeather?.airQuality?.aqi ?? 2);

  // Hourly chart data
  const chartData = (forecast?.hourly || []).map((h) => ({
    time: h.time,
    date: h.date,
    temp: h.temperatureC,
    feels: h.feelsLikeC,
    rain: h.rainMm,
    pop: h.popPercent,
    risk: h.compoundMobilityRisk,
    wind: h.windKmh,
  }));

  return (
    <div className="space-y-6">
      {/* Real-time Weather Alert Banner: Critical warnings (e.g., flood alerts or heatwaves) fetched from API */}
      <WeatherAlertBanner
        alerts={currentWeather?.alerts}
        currentWeather={currentWeather}
        selectedCity={selectedCity}
        onRefresh={onRefresh}
        isLoading={isLoading}
        onNavigateToEmergency={onNavigateToTab ? () => onNavigateToTab('emergency') : undefined}
      />

      {/* Top Header Card: Active Station & City Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 group"
                title="Back to Overview"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-sky-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Meteorological & Atmospheric Monitoring
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live OpenWeatherMap API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  {currentWeather?.city || selectedCity}, {currentWeather?.country || 'BD'}
                </span>
                <span>•</span>
                <span>
                  Coords: {currentWeather?.coord.lat.toFixed(3)}°N, {currentWeather?.coord.lon.toFixed(3)}°E
                </span>
                <span>•</span>
                <span>
                  Observed:{' '}
                  {currentWeather?.observedAt
                    ? new Date(currentWeather.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick city selectors & Custom Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200">
              {[
                { label: 'Dhaka', val: 'Dhaka Metropolitan Basin' },
                { label: 'Mumbai', val: 'Mumbai Coastal Corridor' },
                { label: 'Manila', val: 'Manila River Enclave' },
              ].map((c) => (
                <button
                  key={c.val}
                  onClick={() => onSelectCity(c.val)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    selectedCity === c.val
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Any city (e.g. Tokyo)..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="w-36 sm:w-44 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh Live Weather Observation"
                className="p-1.5 text-slate-600 hover:text-sky-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Primary Current Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Live Temperature & Conditions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Temperature & Condition
              </span>
              <div className="p-2 rounded-xl bg-sky-50">
                {getWeatherIcon(currentWeather?.weatherCondition || 'Clouds')}
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {currentWeather?.temperatureC ?? 29.0}°C
              </span>
              <span className="text-sm font-semibold text-slate-500">
                / {Math.round(((currentWeather?.temperatureC ?? 29) * 9) / 5 + 32)}°F
              </span>
            </div>

            <p className="text-xs font-medium text-slate-600 capitalize mt-1">
              {currentWeather?.weatherDescription || 'Overcast clouds'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Feels like:{' '}
              <strong className="text-slate-800">{currentWeather?.feelsLikeC ?? 34.5}°C</strong>
            </span>
            <span>
              Range: {currentWeather?.tempMinC}° - {currentWeather?.tempMaxC}°
            </span>
          </div>
        </div>

        {/* Card 2: Heat Index & Thermal Stress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Heat Index & Radiation
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <ThermometerSun className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getHeatIndexColor(
                    currentWeather?.compoundImpacts?.heatIndexCategory || 'Extreme Caution'
                  )}`}
                >
                  {currentWeather?.compoundImpacts?.heatIndexCategory || 'Extreme Caution'}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {currentWeather?.feelsLikeC ?? 34.5}°C <span className="text-xs font-normal text-slate-500">apparent</span>
              </p>
            </div>

            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              High paved surface solar absorption adds +
              {currentWeather?.compoundImpacts?.urbanHeatIslandDeltaC ?? 3.2}°C to open arterial avenues.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pedestrian Shade:</span>
            <button
              onClick={() => onNavigateToTab?.('overview')}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              Inspect Canopies <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Precipitation & Drainage Surcharge */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rainfall & Drainage Load
              </span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Waves className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {currentWeather?.rain1hMm ?? 0} mm/h
                </span>
                <span className="text-xs font-bold text-sky-600 uppercase">
                  {currentWeather?.compoundImpacts?.precipSeverity || 'None'}
                </span>
              </div>

              {/* Progress bar for drainage load */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Stormwater Culvert Load</span>
                  <span className="font-bold text-slate-700">
                    {currentWeather?.compoundImpacts?.drainageSurchargePercent ?? 20}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (currentWeather?.compoundImpacts?.drainageSurchargePercent ?? 20) > 80
                        ? 'bg-rose-500'
                        : (currentWeather?.compoundImpacts?.drainageSurchargePercent ?? 20) > 50
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${currentWeather?.compoundImpacts?.drainageSurchargePercent ?? 20}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pavement Friction Loss:</span>
            <strong className="text-rose-600 font-mono">
              -{currentWeather?.compoundImpacts?.frictionLossPercent ?? 5}%
            </strong>
          </div>
        </div>

        {/* Card 4: Atmospheric Pressure, Humidity, Wind */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Atmospheric Dynamics
              </span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Gauge className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">HUMIDITY</span>
                <span className="text-base font-extrabold text-slate-800">
                  {currentWeather?.humidityPercent ?? 79}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">PRESSURE</span>
                <span className="text-base font-extrabold text-slate-800">
                  {currentWeather?.pressureHpa ?? 1008} <span className="text-[10px] font-normal">hPa</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">WIND SPEED</span>
                <span className="text-base font-extrabold text-slate-800">
                  {currentWeather?.windSpeedKmh ?? 5.4} <span className="text-[10px] font-normal">km/h</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold">VISIBILITY</span>
                <span className="text-base font-extrabold text-slate-800">
                  {((currentWeather?.visibilityMeters ?? 10000) / 1000).toFixed(0)} <span className="text-[10px] font-normal">km</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              Heading: {currentWeather?.windDirectionDeg ?? 160}°
            </span>
            {currentWeather?.windGustMs && (
              <span className="text-amber-600 font-medium text-[11px]">
                Gusts: {Math.round(currentWeather.windGustMs * 3.6)} km/h
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Environmental Air Quality & Solar Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Air Quality (AQI) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Air Quality Index (AQI)
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${aqiInfo.bg} ${aqiInfo.text} ${aqiInfo.border}`}>
              {aqiInfo.label} (Level {currentWeather?.airQuality?.aqi ?? 1}/5)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">PM2.5 Particulate</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                {currentWeather?.airQuality?.pm25 ?? 2.4} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">PM10 Coarse</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                {currentWeather?.airQuality?.pm10 ?? 4.0} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Atmospheric dispersion is favorable. Active outdoor mobility and active non-motorized commuting are safe from particulate smog.
          </p>
        </div>

        {/* Solar & Daylight Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Solar Cycle & Daylight
              </span>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-3">
                <Sunrise className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase">Sunrise</span>
                  <p className="text-sm font-bold text-slate-900">{currentWeather?.sunrise || '05:45 AM'}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/60 flex items-center gap-3">
                <Sunset className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-[10px] text-indigo-800 font-bold uppercase">Sunset</span>
                  <p className="text-sm font-bold text-slate-900">{currentWeather?.sunset || '06:12 PM'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cloud Cover:</span>
            <strong className="text-slate-800">{currentWeather?.cloudinessPercent ?? 88}%</strong>
          </div>
        </div>

        {/* Real-time Urban Mobility Feedback Link */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Climate-Mobility Nexus
              </span>
              <span className="text-[10px] bg-sky-900/60 text-sky-200 px-2 py-0.5 rounded border border-sky-700/50">
                Live Dynamic
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-100 mt-3 leading-relaxed">
              Current humidity ({currentWeather?.humidityPercent}%) and rain risk require active culvert sump checks at Road A and Canal Siphon.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Inspect Road Segments</span>
            <button
              onClick={() => onNavigateToTab?.('disruption')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              UMDI Hotspots <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast & Hourly Hydro-Meteorological Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              24-Hour Atmospheric & Disruption Progression
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly resolution from OpenWeatherMap 3-hour interval models, calibrated for urban drainage & heat stress.
            </p>
          </div>

          {/* Toggle metrics for chart */}
          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setForecastTab('temp')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                forecastTab === 'temp' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              🌡️ Temp & Feels Like
            </button>
            <button
              onClick={() => setForecastTab('rain')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                forecastTab === 'rain' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              🌧️ Rain Accumulation (mm)
            </button>
            <button
              onClick={() => setForecastTab('risk')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                forecastTab === 'risk' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              ⚠️ Compound Mobility Risk
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {forecastTab === 'temp' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis unit="°C" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2.5} fill="url(#tempGrad)" />
                <Area type="monotone" dataKey="feels" name="Feels Like (°C)" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" fill="url(#feelsGrad)" />
              </AreaChart>
            ) : forecastTab === 'rain' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis unit="mm" domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="rain" name="Rainfall Volume (mm/3h)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pop" name="Rain Probability (%)" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis unit="/100" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="risk" name="Compound Mobility Risk Score (0-100)" stroke="#e11d48" strokeWidth={2.5} fill="url(#riskGrad)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Hourly Cards Row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 overflow-x-auto pb-1">
          {(forecast?.hourly || []).slice(0, 8).map((slot, idx) => (
            <div
              key={idx}
              className="bg-slate-50 hover:bg-slate-100/80 transition p-2.5 rounded-xl border border-slate-200/70 text-center shrink-0"
            >
              <span className="text-[11px] font-bold text-slate-700 block">{slot.time}</span>
              <span className="text-[10px] text-slate-400 block">{slot.date}</span>

              <div className="my-2 flex justify-center">
                {getWeatherIcon(slot.condition)}
              </div>

              <span className="text-sm font-extrabold text-slate-900 block">
                {slot.temperatureC}°C
              </span>
              <span className="text-[10px] text-slate-500 block">
                FL: {slot.feelsLikeC}°
              </span>

              <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <span className="text-sky-600 font-semibold">{slot.rainMm}mm</span>
                <span className="text-slate-400">{slot.popPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Historical Extreme Weather Alert Frequency Chart (Recharts) */}
      <HistoricalWeatherAlertsChart
        currentWeather={currentWeather}
        selectedCity={selectedCity}
        activeLocation={activeLocation}
        onNavigateToEmergency={onNavigateToTab ? () => onNavigateToTab('emergency') : undefined}
      />

      {/* 5-Day Extended Weather & Urban Resilience Outlook */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">5-Day Multi-Hazard Resilience Outlook</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Anticipating upcoming rainfall surges, wet-pavement delays, and urban cooling demands.
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
            Synoptic Scale
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(forecast?.daily || []).map((dayItem, idx) => {
            const isHighRain = dayItem.totalRainMm > 20;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition ${
                  isHighRain
                    ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{dayItem.day}</span>
                  {isHighRain && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                      SURGE
                    </span>
                  )}
                </div>

                <div className="my-3 flex items-center gap-3">
                  {getWeatherIcon(dayItem.condition)}
                  <div>
                    <span className="text-base font-extrabold text-slate-900 block">
                      {dayItem.tempMax}° / {dayItem.tempMin}°
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{dayItem.condition}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-sky-600" /> Rain:
                    </span>
                    <strong className={isHighRain ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {dayItem.totalRainMm} mm
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-teal-600" /> Humidity:
                    </span>
                    <span className="text-slate-700">{dayItem.avgHumidity}%</span>
                  </div>
                </div>

                {isHighRain && (
                  <div className="mt-3 p-2 bg-rose-100/70 rounded-lg text-[11px] text-rose-800 font-medium leading-tight">
                    ⚠️ Heightened flood & road waterlogging risk. Pre-clean culverts.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
