/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  AlertTriangle,
  History,
  CloudRain,
  ThermometerSun,
  CloudLightning,
  Wind,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { LiveWeatherData } from '../types';
import { UpazilaLocation } from '../data/bangladeshLocations';
import {
  generate7DayHistoricalAlerts,
  HistoricalAlertDay,
  HistoricalAlertEvent,
} from '../data/historicalAlertsGenerator';

interface HistoricalWeatherAlertsChartProps {
  currentWeather: LiveWeatherData | null;
  selectedCity: string;
  activeLocation?: UpazilaLocation | null;
  onNavigateToEmergency?: () => void;
}

export const HistoricalWeatherAlertsChart: React.FC<HistoricalWeatherAlertsChartProps> = ({
  currentWeather,
  selectedCity,
  activeLocation,
  onNavigateToEmergency,
}) => {
  const [viewMode, setViewMode] = useState<'category' | 'severity' | 'trend'>('category');
  const [selectedHazardFilter, setSelectedHazardFilter] = useState<'ALL' | 'FLOOD' | 'HEATWAVE' | 'STORM' | 'WIND' | 'AIR_QUALITY'>('ALL');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(6); // Default to today (index 6)
  const [isEventLogExpanded, setIsEventLogExpanded] = useState<boolean>(true);

  // Generate 7-day historical alert metrics based on current location
  const summary = useMemo(() => {
    return generate7DayHistoricalAlerts(activeLocation, currentWeather, selectedCity);
  }, [activeLocation, currentWeather, selectedCity]);

  // Selected day object
  const activeDay: HistoricalAlertDay | null = selectedDayIndex !== null && summary.history[selectedDayIndex]
    ? summary.history[selectedDayIndex]
    : null;

  // Filtered events for the selected day
  const filteredDayEvents: HistoricalAlertEvent[] = useMemo(() => {
    if (!activeDay) return [];
    if (selectedHazardFilter === 'ALL') return activeDay.events;
    return activeDay.events.filter((ev) => ev.category === selectedHazardFilter);
  }, [activeDay, selectedHazardFilter]);

  // Chart data formatted for Recharts
  const chartData = useMemo(() => {
    return summary.history.map((day, idx) => ({
      index: idx,
      dateLabel: day.date,
      dayName: day.dayName,
      fullLabel: day.isToday ? `${day.date} (Today)` : `${day.dayName}, ${day.date}`,
      isToday: day.isToday,
      total: day.totalAlerts,
      // Categories
      flood: selectedHazardFilter === 'ALL' || selectedHazardFilter === 'FLOOD' ? day.flood : 0,
      heatwave: selectedHazardFilter === 'ALL' || selectedHazardFilter === 'HEATWAVE' ? day.heatwave : 0,
      storm: selectedHazardFilter === 'ALL' || selectedHazardFilter === 'STORM' ? day.storm : 0,
      wind: selectedHazardFilter === 'ALL' || selectedHazardFilter === 'WIND' ? day.wind : 0,
      airQuality: selectedHazardFilter === 'ALL' || selectedHazardFilter === 'AIR_QUALITY' ? day.airQuality : 0,
      // Severity
      critical: day.critical,
      warning: day.warning,
      advisory: day.advisory,
    }));
  }, [summary.history, selectedHazardFilter]);

  // Category Icon helper
  const getCategoryIcon = (category: string, className = 'w-4 h-4') => {
    switch (category) {
      case 'FLOOD':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'HEATWAVE':
        return <ThermometerSun className={`${className} text-amber-500`} />;
      case 'STORM':
        return <CloudLightning className={`${className} text-violet-500`} />;
      case 'WIND':
        return <Wind className={`${className} text-teal-500`} />;
      case 'AIR_QUALITY':
        return <ShieldAlert className={`${className} text-rose-500`} />;
      default:
        return <AlertTriangle className={`${className} text-slate-500`} />;
    }
  };

  // Severity pill style helper
  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'WARNING':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200 font-semibold';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
      {/* Top Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <History className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              7-Day Extreme Weather Alert Frequency
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-3 h-3 text-sky-600" />
              {summary.locationName}, {summary.zillaName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Historical distribution of extreme alerts triggered over the last 7 days based on localized hydro-meteorological thresholds for {summary.locationName}.
          </p>
        </div>

        {/* View mode toggle controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('category')}
              className={`px-3 py-1 font-semibold rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'category'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              By Hazard Type
            </button>
            <button
              onClick={() => setViewMode('severity')}
              className={`px-3 py-1 font-semibold rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'severity'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              By Severity Level
            </button>
            <button
              onClick={() => setViewMode('trend')}
              className={`px-3 py-1 font-semibold rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'trend'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              7-Day Trend
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            7-Day Total Alerts
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.totalAlerts7Days}</span>
            <span className="text-xs text-slate-400">events recorded</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
            <span className="text-rose-600 font-bold">{summary.criticalCount} Critical</span>
            <span>•</span>
            <span className="text-orange-600 font-bold">{summary.warningCount} Warning</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Dominant Hazard
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            {getCategoryIcon(summary.mostFrequentCategory, 'w-5 h-5')}
            <span className="text-base font-extrabold text-slate-900 capitalize">
              {summary.mostFrequentCategory.toLowerCase().replace('_', ' ')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {summary.mostFrequentCategoryPercentage}% of all local issuances
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Peak Alert Day
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-900">{summary.peakDay.dayName}</span>
            <span className="text-xs font-semibold text-slate-600">({summary.peakDay.date})</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">
            {summary.peakDay.count} extreme alerts triggered
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Local Terrain Regime
          </span>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs font-bold text-slate-800 capitalize">
              {summary.terrainType.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate" title={summary.trendDescription}>
            {summary.trendDescription}
          </span>
        </div>
      </div>

      {/* Hazard Filter Buttons (for 'category' view mode) */}
      {viewMode === 'category' && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter Hazard:</span>
          {[
            { id: 'ALL', label: 'All Hazards', count: summary.totalAlerts7Days },
            { id: 'FLOOD', label: '🌊 Flood & Waterlogging', count: summary.categoryTotals.flood },
            { id: 'HEATWAVE', label: '☀️ Severe Heatwave', count: summary.categoryTotals.heatwave },
            { id: 'STORM', label: '⚡ Convective Storm', count: summary.categoryTotals.storm },
            { id: 'WIND', label: '💨 Gale Wind', count: summary.categoryTotals.wind },
            { id: 'AIR_QUALITY', label: '🌫️ Hazardous AQI', count: summary.categoryTotals.airQuality },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedHazardFilter(cat.id as any)}
              className={`px-2.5 py-1 text-xs rounded-lg transition font-medium flex items-center gap-1.5 ${
                selectedHazardFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedHazardFilter === cat.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Recharts Chart Area */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'category' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                  const idx = Number(state.activeTooltipIndex);
                  if (!Number.isNaN(idx)) {
                    setSelectedDayIndex(idx);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
                unit=" alerts"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1.5 min-w-[180px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-sky-300">
                          <span>{item.fullLabel}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            Total: {item.total}
                          </span>
                        </div>
                        <div className="space-y-1 pt-1">
                          {item.flood > 0 && (
                            <div className="flex items-center justify-between text-sky-400">
                              <span>🌊 Flood & Waterlogging</span>
                              <span className="font-bold">{item.flood}</span>
                            </div>
                          )}
                          {item.heatwave > 0 && (
                            <div className="flex items-center justify-between text-amber-400">
                              <span>☀️ Severe Heatwave</span>
                              <span className="font-bold">{item.heatwave}</span>
                            </div>
                          )}
                          {item.storm > 0 && (
                            <div className="flex items-center justify-between text-violet-400">
                              <span>⚡ Convective Storm</span>
                              <span className="font-bold">{item.storm}</span>
                            </div>
                          )}
                          {item.wind > 0 && (
                            <div className="flex items-center justify-between text-teal-400">
                              <span>💨 Gale Force Wind</span>
                              <span className="font-bold">{item.wind}</span>
                            </div>
                          )}
                          {item.airQuality > 0 && (
                            <div className="flex items-center justify-between text-rose-400">
                              <span>🌫️ Hazardous AQI</span>
                              <span className="font-bold">{item.airQuality}</span>
                            </div>
                          )}
                          {item.total === 0 && (
                            <div className="text-slate-400 italic">No extreme alerts triggered</div>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Click bar to inspect day log
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="flood" name="Flood / Waterlogging" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="heatwave" name="Severe Heatwave" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="storm" name="Convective Storm" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="wind" name="Gale Wind" stackId="a" fill="#0d9488" radius={[0, 0, 0, 0]} />
              <Bar dataKey="airQuality" name="Hazardous AQI" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : viewMode === 'severity' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                  const idx = Number(state.activeTooltipIndex);
                  if (!Number.isNaN(idx)) {
                    setSelectedDayIndex(idx);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
                unit=" alerts"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1.5 min-w-[160px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-rose-300">
                          <span>{item.fullLabel}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            Total: {item.total}
                          </span>
                        </div>
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-rose-400">
                            <span>Critical Warnings</span>
                            <span className="font-bold">{item.critical}</span>
                          </div>
                          <div className="flex items-center justify-between text-orange-400">
                            <span>Severe Warnings</span>
                            <span className="font-bold">{item.warning}</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-400">
                            <span>Advisories</span>
                            <span className="font-bold">{item.advisory}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Click bar to view event details
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="critical" name="Critical Warnings" stackId="s" fill="#dc2626" radius={[0, 0, 0, 0]} />
              <Bar dataKey="warning" name="Severe Warnings" stackId="s" fill="#ea580c" radius={[0, 0, 0, 0]} />
              <Bar dataKey="advisory" name="Advisories" stackId="s" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="alertTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
                unit=" alerts"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1 min-w-[160px]">
                        <div className="font-bold text-sky-300">{item.fullLabel}</div>
                        <div className="text-sm font-extrabold text-white">
                          {item.total} Extreme Weather Alert{item.total !== 1 ? 's' : ''}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.critical} Critical • {item.warning} Warning • {item.advisory} Advisory
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Extreme Weather Alerts"
                stroke="#0284c7"
                strokeWidth={2.5}
                fill="url(#alertTrendGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive 7-Day Day Selector Buttons */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            Select Day to Inspect Historical Logs:
          </span>
          <span className="text-[11px] text-slate-400">
            Click any day to examine triggered thresholds
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {summary.history.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.fullDate}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-2 rounded-xl text-center border transition relative cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 border-sky-400 shadow-2xs ring-2 ring-sky-300/60'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                {day.isToday && (
                  <span className="absolute -top-1.5 right-1 px-1 text-[8px] font-bold bg-sky-600 text-white rounded-full">
                    TODAY
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{day.dayName}</span>
                <span className="text-xs font-black text-slate-900 block">{day.date}</span>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      day.totalAlerts > 2
                        ? 'bg-rose-100 text-rose-800'
                        : day.totalAlerts > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {day.totalAlerts} {day.totalAlerts === 1 ? 'alert' : 'alerts'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Event Log Breakdown */}
      {activeDay && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Logged Alert Events for {activeDay.fullDate} ({activeDay.dayName}, {activeDay.date})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                • {filteredDayEvents.length} event{filteredDayEvents.length !== 1 ? 's' : ''} shown
              </span>
            </div>

            <button
              onClick={() => setIsEventLogExpanded(!isEventLogExpanded)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              {isEventLogExpanded ? (
                <>
                  Collapse <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {isEventLogExpanded && (
            <div className="mt-3 space-y-2.5">
              {filteredDayEvents.length > 0 ? (
                filteredDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                        {getCategoryIcon(ev.category, 'w-4 h-4')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getSeverityBadge(ev.level)}`}>
                            {ev.level}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ev.time} Local
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ev.description}</p>
                        <div className="mt-2 text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-1 rounded inline-flex items-center gap-1.5 border border-sky-100">
                          <span className="font-semibold">Threshold Trigger:</span>
                          <span>{ev.metricTrigger}</span>
                        </div>
                      </div>
                    </div>

                    {ev.level === 'CRITICAL' && onNavigateToEmergency && (
                      <button
                        onClick={onNavigateToEmergency}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition shrink-0 self-start sm:self-center"
                      >
                        Inspect Clearway
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  No extreme weather alerts were triggered on {activeDay.date} under selected filters for {summary.locationName}. Atmospheric indicators remained within nominal thresholds.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
