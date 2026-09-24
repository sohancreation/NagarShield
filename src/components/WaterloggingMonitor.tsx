/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Waves,
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { UpazilaLocation } from '../data/bangladeshLocations';
import { LiveWeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface PumpStation {
  id: string;
  name: string;
  nameBn: string;
  location: string;
  basin: string;
  totalPumps: number;
  activePumps: number;
  dischargeCapacityM3s: number;
  currentDischargeM3s: number;
  sluiceStatus: 'Open' | 'Throttled' | 'Closed';
  status: 'optimal' | 'warning' | 'critical';
}

export interface CanalRetentionBasin {
  id: string;
  name: string;
  nameBn: string;
  outfallRiver: string;
  currentFillPercent: number;
  thresholdRisk: 'nominal' | 'elevated' | 'severe';
  lastDredged: string;
}

export const WASA_PUMP_STATIONS: PumpStation[] = [
  {
    id: 'pump-kallyanpur',
    name: 'Kallyanpur Heavy Pump Station',
    nameBn: 'কল্যাণপুর হেভি ড্রেনেজ পাম্প স্টেশন',
    location: 'Mirpur Section 1 & Kallyanpur',
    basin: 'Turag-Mirpur Drainage Basin',
    totalPumps: 5,
    activePumps: 5,
    dischargeCapacityM3s: 32,
    currentDischargeM3s: 24.8,
    sluiceStatus: 'Open',
    status: 'optimal',
  },
  {
    id: 'pump-rampura',
    name: 'Rampura Regulating & Pump Station',
    nameBn: 'রামপুরা রেগুলেটিং ও পাম্প স্টেশন',
    location: 'Rampura Bridge / Balu Outfall',
    basin: 'Hatirjheel - Begunbari Outfall',
    totalPumps: 5,
    activePumps: 4,
    dischargeCapacityM3s: 40,
    currentDischargeM3s: 31.2,
    sluiceStatus: 'Open',
    status: 'optimal',
  },
  {
    id: 'pump-dholaikhal',
    name: 'Dholaikhal Underground Pumping Station',
    nameBn: 'ধোলাইখাল আন্ডারগ্রাউন্ড পাম্প স্টেশন',
    location: 'Old Dhaka / Sutrapur',
    basin: 'Buriganga River Outfall',
    totalPumps: 4,
    activePumps: 3,
    dischargeCapacityM3s: 22,
    currentDischargeM3s: 18.5,
    sluiceStatus: 'Throttled',
    status: 'warning',
  },
  {
    id: 'pump-goran',
    name: 'Goran Chatbari Sluice & Pumping Station',
    nameBn: 'গোরান চটবাড়ি বন্যা নিয়ন্ত্রণ পাম্প',
    location: 'Mirpur Western Embankment',
    basin: 'Turag Flood Embankment',
    totalPumps: 4,
    activePumps: 4,
    dischargeCapacityM3s: 25,
    currentDischargeM3s: 16.0,
    sluiceStatus: 'Open',
    status: 'optimal',
  },
];

export const CANAL_BASINS: CanalRetentionBasin[] = [
  {
    id: 'basin-hatirjheel',
    name: 'Hatirjheel Integrated Retention Reservoir',
    nameBn: 'হাতিরঝিল সমন্বিত জলাধার অববাহিকা',
    outfallRiver: 'Balu River via Rampura Canal',
    currentFillPercent: 78,
    thresholdRisk: 'elevated',
    lastDredged: 'May 2026',
  },
  {
    id: 'basin-kallyanpur',
    name: 'Kallyanpur Retention Pond & Regulating Reservoir',
    nameBn: 'কল্যাণপুর রিটেনশন পন্ড ও রেগুলেটিং লেক',
    outfallRiver: 'Turag River',
    currentFillPercent: 62,
    thresholdRisk: 'nominal',
    lastDredged: 'January 2026',
  },
  {
    id: 'basin-rayerbazar',
    name: 'Rayerbazar - Hazaribagh Khal Outflow',
    nameBn: 'রায়েরবাজার - হাজারীবাগ খাল ড্রেনেজ',
    outfallRiver: 'Buriganga River',
    currentFillPercent: 84,
    thresholdRisk: 'severe',
    lastDredged: 'November 2025',
  },
  {
    id: 'basin-dholai',
    name: 'Dholai Khal Box Culvert & Interceptor',
    nameBn: 'ধোলাইখাল বক্স কালভার্ট ও ইন্টারসেপ্টর',
    outfallRiver: 'Buriganga River',
    currentFillPercent: 72,
    thresholdRisk: 'elevated',
    lastDredged: 'March 2026',
  },
];

interface WaterloggingMonitorProps {
  activeLocation: UpazilaLocation;
  weatherData?: LiveWeatherData | null;
  onNavigateToTab: (tab: string) => void;
  onBack: () => void;
}

export const WaterloggingMonitor: React.FC<WaterloggingMonitorProps> = ({
  activeLocation,
  weatherData,
  onNavigateToTab,
  onBack,
}) => {
  const { t, toBnDigits, language } = useLanguage();

  const [activePumpView, setActivePumpView] = useState<'all' | 'optimal' | 'warning'>('all');

  // Compute live runoff saturation based on rain
  const rain1h = weatherData?.rain1hMm || 0;
  const saturationPercent = Math.min(95, Math.round(35 + rain1h * 12));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer shrink-0 mt-0.5"
            title="Return to City Overview"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Waves className="w-5 h-5 text-blue-600" />
                <span>{t('waterloggingTitle', 'Waterlogging & Flood Basin Monitor')}</span>
              </h1>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                DWASA & CWASA TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {t(
                'waterloggingSubtitle',
                'Real-time urban drainage monitoring, WASA heavy-duty pump telemetry & canal saturation levels across Bangladesh'
              )}
            </p>
          </div>
        </div>

        {/* CTA: Report Waterlogging */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('incidents')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('reportWaterloggingHere', 'Report Waterlogging at Current Location')}</span>
          </button>
        </div>
      </div>

      {/* Waterlogging Depth Tiers Visual Guide */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-600" />
            <span>Standard Municipal Water Depth Tiers & Transit Impact Matrix</span>
          </span>
          <span className="text-[11px] text-slate-500">Dhaka North & South City Corporation Guidelines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Stage 0 */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-xs">
                {t('stageNormal', 'Stage 0: Normal / Dry (< 5 cm)')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-emerald-800">
              Clear roadway. Free flow for pedestrians, rickshaws, and low sedans.
            </p>
            <span className="text-[10px] font-mono text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 inline-block font-semibold">
              Nominal Transit
            </span>
          </div>

          {/* Stage 1 */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 text-xs">
                {t('stageAnkle', 'Stage 1: Ankle Deep (5 - 15 cm)')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-[11px] text-amber-800">
              Slow vehicular speeds. Caution for pedestrians near curbs and open catch-pits.
            </p>
            <span className="text-[10px] font-mono text-amber-700 bg-white px-1.5 py-0.5 rounded border border-amber-200 inline-block font-semibold">
              Caution Advised
            </span>
          </div>

          {/* Stage 2 */}
          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-900 text-xs">
                {t('stageKnee', 'Stage 2: Knee Deep (15 - 40 cm)')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            </div>
            <p className="text-[11px] text-orange-800">
              CNG auto-rickshaws and motorbikes stall. Road diversions activated.
            </p>
            <span className="text-[10px] font-mono text-orange-700 bg-white px-1.5 py-0.5 rounded border border-orange-200 inline-block font-semibold">
              Motorbike / Auto Stalled
            </span>
          </div>

          {/* Stage 3 */}
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 text-xs">
                {t('stageWaist', 'Stage 3: Waist Deep (> 40 cm)')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-rose-800">
              Impassable for light transit. Heavy rescue vehicles or high-clearance buses only.
            </p>
            <span className="text-[10px] font-mono text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200 inline-block font-semibold">
              Rescue Grid Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Telemetry: WASA Pump Stations & Canal Retention Basins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* WASA Pump Stations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{t('drainageCapacity', 'WASA Pump Status')}</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                Live 4 Heavy Stations
              </span>
            </div>

            <div className="space-y-3">
              {WASA_PUMP_STATIONS.map((pump) => (
                <div
                  key={pump.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'bn' ? pump.nameBn : pump.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {pump.location} • {pump.basin}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pump.status === 'optimal'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {pump.status === 'optimal' ? 'Full Operational' : 'Partial / Under Load'}
                    </span>
                  </div>

                  {/* Telemetry numbers */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Pumps Running</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {toBnDigits(pump.activePumps)} / {toBnDigits(pump.totalPumps)}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Discharge Rate</span>
                      <span className="font-bold text-blue-600 font-mono">
                        {toBnDigits(pump.currentDischargeM3s)} m³/s
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Sluice Gate</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {pump.sluiceStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canal Basins & Runoff Saturation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Runoff Saturation Gauge Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>{t('saturationCurve', 'Rainfall Runoff Saturation')}</span>
            </h2>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">Runoff Capacity Utilization:</span>
                <span className="font-extrabold text-sm text-blue-700 font-mono">
                  {toBnDigits(saturationPercent)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-blue-200/60 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    saturationPercent > 75
                      ? 'bg-rose-500'
                      : saturationPercent > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${saturationPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-blue-800 leading-snug">
                {weatherData && weatherData.rain1hMm > 0
                  ? `Active rainfall (${weatherData.rain1hMm} mm/h) draining towards ${activeLocation.canalOrRiver}.`
                  : `Clear atmospheric status. Drainage network maintaining nominal reserve capacity.`}
              </p>
            </div>
          </div>

          {/* Retention Basins & Khals */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <Waves className="w-4 h-4 text-emerald-600" />
              <span>{t('retentionBasins', 'Retention Basins & Khals')}</span>
            </h2>

            <div className="space-y-2.5">
              {CANAL_BASINS.map((basin) => (
                <div
                  key={basin.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                      {language === 'bn' ? basin.nameBn : basin.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        basin.currentFillPercent >= 80
                          ? 'bg-rose-100 text-rose-800'
                          : basin.currentFillPercent >= 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {toBnDigits(basin.currentFillPercent)}% Full
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Outfall: {basin.outfallRiver}</span>
                    <span>Dredged: {basin.lastDredged}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
