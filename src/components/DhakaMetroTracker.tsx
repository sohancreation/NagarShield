/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Train,
  ArrowLeft,
  Clock,
  Users,
  Compass,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MapPin,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface MetroStation {
  id: string;
  nameEn: string;
  nameBn: string;
  code: string;
  order: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  gateWaitMins: number;
  firstTrain: string;
  lastTrain: string;
  connectors: string[];
  connectorsBn: string[];
  lat: number;
  lon: number;
}

export const MRT_LINE_6_STATIONS: MetroStation[] = [
  {
    id: 'st-1',
    nameEn: 'Uttara North',
    nameBn: 'উত্তরা উত্তর (দিয়াবাড়ী)',
    code: 'UN',
    order: 1,
    crowdLevel: 'moderate',
    gateWaitMins: 2,
    firstTrain: '07:10 AM',
    lastTrain: '09:00 PM',
    connectors: ['Diabari shuttle', 'Shadhinota Shoroni rickshaws', 'Depot walkway'],
    connectorsBn: ['দিয়াবাড়ী শাটল', 'স্বাধীনতা সরণি রিকশা', 'ডিপো ওয়াকওয়ে'],
    lat: 23.8752,
    lon: 90.3842,
  },
  {
    id: 'st-2',
    nameEn: 'Uttara Center',
    nameBn: 'উত্তরা সেন্টার',
    code: 'UC',
    order: 2,
    crowdLevel: 'low',
    gateWaitMins: 1,
    firstTrain: '07:12 AM',
    lastTrain: '09:03 PM',
    connectors: ['Sector 16 rickshaw stand', 'Avenue 2 connector'],
    connectorsBn: ['সেক্টর ১৬ রিকশা স্ট্যান্ড', 'এভিনিউ ২ কানেক্টর'],
    lat: 23.8643,
    lon: 90.3855,
  },
  {
    id: 'st-3',
    nameEn: 'Uttara South',
    nameBn: 'উত্তরা দক্ষিণ',
    code: 'US',
    order: 3,
    crowdLevel: 'low',
    gateWaitMins: 1,
    firstTrain: '07:14 AM',
    lastTrain: '09:06 PM',
    connectors: ['Sector 18 circular shuttle', 'Ring road feeder'],
    connectorsBn: ['সেক্টর ১৮ সার্কুলার শাটল', 'রিং রোড ফিডার'],
    lat: 23.8519,
    lon: 90.3828,
  },
  {
    id: 'st-4',
    nameEn: 'Pallabi',
    nameBn: 'পল্লবী',
    code: 'PL',
    order: 4,
    crowdLevel: 'moderate',
    gateWaitMins: 3,
    firstTrain: '07:18 AM',
    lastTrain: '09:11 PM',
    connectors: ['Pallabi bus bay', 'Mirpur 12 feeder tempo', 'Purobi cinema alley'],
    connectorsBn: ['পল্লবী বাস বে', 'মিরপুর ১২ ফিডার টেম্পু', 'পুরবী সিনেমা গলি'],
    lat: 23.8329,
    lon: 90.3644,
  },
  {
    id: 'st-5',
    nameEn: 'Mirpur 11',
    nameBn: 'মিরপুর ১১',
    code: 'M11',
    order: 5,
    crowdLevel: 'moderate',
    gateWaitMins: 3,
    firstTrain: '07:20 AM',
    lastTrain: '09:14 PM',
    connectors: ['Block B bazaar gate', 'Avenue 3 rickshaws', 'Bihari camp bypass'],
    connectorsBn: ['ব্লক বি বাজার গেট', 'এভিনিউ ৩ রিকশা', 'বিহারী ক্যাম্প বাইপাস'],
    lat: 23.8223,
    lon: 90.3654,
  },
  {
    id: 'st-6',
    nameEn: 'Mirpur 10',
    nameBn: 'মিরপুর ১০ (গোলচত্বর)',
    code: 'M10',
    order: 6,
    crowdLevel: 'high',
    gateWaitMins: 5,
    firstTrain: '07:23 AM',
    lastTrain: '09:18 PM',
    connectors: ['BRTC AC Bus Counter', 'Mirpur 1/2 CNG Stand', 'Fire Service Footbridge'],
    connectorsBn: ['বিআরটিসি এসি বাস কাউন্টার', 'মিরপুর ১/২ সিএনজি স্ট্যান্ড', 'ফায়ার সার্ভিস ওভারব্রিজ'],
    lat: 23.8071,
    lon: 90.3686,
  },
  {
    id: 'st-7',
    nameEn: 'Kazipara',
    nameBn: 'কাজীপাড়া',
    code: 'KZ',
    order: 7,
    crowdLevel: 'moderate',
    gateWaitMins: 3,
    firstTrain: '07:26 AM',
    lastTrain: '09:22 PM',
    connectors: ['Rokeya Sarani bus stop', 'West Kazipara rickshaw bay'],
    connectorsBn: ['রোকেয়া সরণি বাস স্টপ', 'পশ্চিম কাজীপাড়া রিকশা বে'],
    lat: 23.7978,
    lon: 90.3732,
  },
  {
    id: 'st-8',
    nameEn: 'Shewrapara',
    nameBn: 'শেওড়াপাড়া',
    code: 'SW',
    order: 8,
    crowdLevel: 'moderate',
    gateWaitMins: 3,
    firstTrain: '07:28 AM',
    lastTrain: '09:25 PM',
    connectors: ['East Shewrapara market gate', 'Mirpur floodwall footpath'],
    connectorsBn: ['পূর্ব শেওড়াপাড়া বাজার গেট', 'মিরপুর বন্যা বাঁধ ফুটপাত'],
    lat: 23.7885,
    lon: 90.3768,
  },
  {
    id: 'st-9',
    nameEn: 'Agargaon',
    nameBn: 'আগারগাঁও',
    code: 'AG',
    order: 9,
    crowdLevel: 'high',
    gateWaitMins: 4,
    firstTrain: '07:31 AM',
    lastTrain: '09:30 PM',
    connectors: ['Passport Office Shuttle', 'Shere-Bangla Nagar walkway', 'BRTC circular'],
    connectorsBn: ['পাসপোর্ট অফিস শাটল', 'শেরেবাংলা নগর ফুটপাত', 'বিআরটিসি সার্কুলার'],
    lat: 23.7782,
    lon: 90.3802,
  },
  {
    id: 'st-10',
    nameEn: 'Bijoy Sarani',
    nameBn: 'বিজয় সরণি',
    code: 'BS',
    order: 10,
    crowdLevel: 'moderate',
    gateWaitMins: 2,
    firstTrain: '07:34 AM',
    lastTrain: '09:34 PM',
    connectors: ['Military Museum entrance', 'Rangs bhaban crossing rickshaws'],
    connectorsBn: ['সামরিক জাদুঘর প্রবেশদ্বার', 'র‌্যাংগস ভবন ক্রসিং রিকশা'],
    lat: 23.7661,
    lon: 90.3867,
  },
  {
    id: 'st-11',
    nameEn: 'Farmgate',
    nameBn: 'ফার্মগেট (ইন্দিরা রোড)',
    code: 'FG',
    order: 11,
    crowdLevel: 'high',
    gateWaitMins: 6,
    firstTrain: '07:37 AM',
    lastTrain: '09:38 PM',
    connectors: ['Ananda Cinema Hub', 'Tejgaon Bus Bay', 'Indira Road Footbridge'],
    connectorsBn: ['আনন্দ সিনেমা বাস হাব', 'তেজগাঁও বাস বে', 'ইন্দিরা রোড ওভারব্রিজ'],
    lat: 23.7571,
    lon: 90.3888,
  },
  {
    id: 'st-12',
    nameEn: 'Karwan Bazar',
    nameBn: 'কাওরান বাজার',
    code: 'KB',
    order: 12,
    crowdLevel: 'moderate',
    gateWaitMins: 3,
    firstTrain: '07:40 AM',
    lastTrain: '09:42 PM',
    connectors: ['Wholesale Market Gate', 'Petrobangla underpass', 'Panthapath feeder'],
    connectorsBn: ['পাইকারি বাজার গেট', 'পেট্রোবাংলা আন্ডারপাস', 'পান্থপথ ফিডার'],
    lat: 23.7505,
    lon: 90.3922,
  },
  {
    id: 'st-13',
    nameEn: 'Shahbagh',
    nameBn: 'শাহবাগ',
    code: 'SH',
    order: 13,
    crowdLevel: 'high',
    gateWaitMins: 4,
    firstTrain: '07:43 AM',
    lastTrain: '09:46 PM',
    connectors: ['BSMMU Hospital Corridor', 'National Museum gate', 'BIRDEM Ambulance bay'],
    connectorsBn: ['বিএসএমএমইউ পিজি হাসপাতাল করিডোর', 'জাতীয় জাদুঘর গেট', 'বারডেম অ্যাম্বুলেন্স বে'],
    lat: 23.7388,
    lon: 90.3958,
  },
  {
    id: 'st-14',
    nameEn: 'Dhaka University',
    nameBn: 'ঢাকা বিশ্ববিদ্যালয় (টিএসসি)',
    code: 'DU',
    order: 14,
    crowdLevel: 'moderate',
    gateWaitMins: 3,
    firstTrain: '07:46 AM',
    lastTrain: '09:50 PM',
    connectors: ['TSC Square walkway', 'Curzon Hall rickshaws', 'Doel Chattar feeder'],
    connectorsBn: ['টিএসসি চত্বর ওয়াকওয়ে', 'কার্জন হল রিকশা', 'দোয়েল চত্বর ফিডার'],
    lat: 23.7317,
    lon: 90.3965,
  },
  {
    id: 'st-15',
    nameEn: 'Bangladesh Secretariat',
    nameBn: 'বাংলাদেশ সচিবালয় (প্রেস ক্লাব)',
    code: 'SEC',
    order: 15,
    crowdLevel: 'high',
    gateWaitMins: 4,
    firstTrain: '07:49 AM',
    lastTrain: '09:54 PM',
    connectors: ['Press Club entrance', 'High Court crossing', 'Topkhana Road rickshaws'],
    connectorsBn: ['প্রেস ক্লাব গেট', 'হাইকোর্ট ক্রসিং', 'তোপখানা রোড রিকশা'],
    lat: 23.7291,
    lon: 90.4072,
  },
  {
    id: 'st-16',
    nameEn: 'Motijheel',
    nameBn: 'মতিঝিল (শাপলা চত্বর)',
    code: 'MJ',
    order: 16,
    crowdLevel: 'high',
    gateWaitMins: 5,
    firstTrain: '07:52 AM',
    lastTrain: '10:00 PM',
    connectors: ['Bangladesh Bank Gate', 'Kamalapur Station walkway', 'Dilkusha taxi stand'],
    connectorsBn: ['বাংলাদেশ ব্যাংক গেট', 'কমলাপুর রেলওয়ে ওয়াকওয়ে', 'দিলকুশা ট্যাক্সি স্ট্যান্ড'],
    lat: 23.733,
    lon: 90.4175,
  },
];

interface DhakaMetroTrackerProps {
  onBack: () => void;
}

export const DhakaMetroTracker: React.FC<DhakaMetroTrackerProps> = ({ onBack }) => {
  const { t, toBnDigits, language } = useLanguage();

  const [selectedStation, setSelectedStation] = useState<MetroStation>(
    MRT_LINE_6_STATIONS.find((s) => s.code === 'M10') || MRT_LINE_6_STATIONS[5] // Default Mirpur 10
  );

  // Train countdown timers (seconds)
  const [southboundSeconds, setSouthboundSeconds] = useState(245); // ~4 mins to Motijheel
  const [northboundSeconds, setNorthboundSeconds] = useState(410); // ~6.8 mins to Uttara

  // Fare Calculator State
  const [originCode, setOriginCode] = useState('M10'); // Mirpur 10
  const [destinationCode, setDestinationCode] = useState('MJ'); // Motijheel

  // Simulated balance checker
  const [mrtCardNumber, setMrtCardNumber] = useState('0188-2940-5821');
  const [cardBalance, setCardBalance] = useState<number | null>(480);

  useEffect(() => {
    const timer = setInterval(() => {
      setSouthboundSeconds((prev) => (prev <= 1 ? 480 : prev - 1));
      setNorthboundSeconds((prev) => (prev <= 1 ? 420 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${toBnDigits(mins)}m ${toBnDigits(secs.toString().padStart(2, '0'))}s`;
  };

  // Calculate official DMTCL fare based on station difference
  const calculateFare = (fromCode: string, toCode: string) => {
    const fromIdx = MRT_LINE_6_STATIONS.findIndex((s) => s.code === fromCode);
    const toIdx = MRT_LINE_6_STATIONS.findIndex((s) => s.code === toCode);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) {
      return { regularFare: 20, discountedFare: 18, travelMins: 3, roadTrafficMins: 25 };
    }
    const stationCount = Math.abs(toIdx - fromIdx);
    // Base fare 20 BDT up to 2 stations, + 10 BDT per 2 stations approx, max 100 BDT
    const regularFare = Math.min(100, Math.max(20, Math.round(20 + (stationCount - 1) * 5.5)));
    const discountedFare = Math.round(regularFare * 0.9); // 10% off for MRT Pass / Rapid Pass
    const travelMins = Math.round(stationCount * 2.2 + 2); // ~2.2 mins per station
    const roadTrafficMins = Math.round(stationCount * 9 + 15); // Average Dhaka road congestion
    return { regularFare, discountedFare, travelMins, roadTrafficMins };
  };

  const fareData = calculateFare(originCode, destinationCode);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer shrink-0 mt-0.5"
            title="Return to Overview"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Train className="w-5 h-5 text-emerald-600" />
                <span>{t('metroTitle', 'Dhaka Metro Rail (MRT-6) Live Transit Monitor')}</span>
              </h1>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                16 STATIONS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {t(
                'metroSubtitle',
                'Elevated rapid transit tracking, live train headways, station crowding & fare matrix for Dhaka commuters'
              )}
            </p>
          </div>
        </div>

        {/* Live Headway Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white flex items-center gap-2 text-xs font-mono border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold">PEAK INTERVAL: 6-8 MINS</span>
          </div>
        </div>
      </div>

      {/* DMTCL Weather & Monsoon Resilience Advisory */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 text-white rounded-2xl border border-emerald-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">
              DMTCL Elevated Grid Status
            </span>
            <p className="text-slate-200 text-xs">
              MRT-6 elevated viaducts remain <strong>100% immune to urban waterlogging</strong>. 1500V DC third-rail traction and station backup generators online.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] font-mono text-emerald-300 bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-700/50 shrink-0">
          <span>OPERATING: 07:10 - 21:40</span>
        </div>
      </div>

      {/* Live Train Approaching Countdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Southbound: To Motijheel */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-600 shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Southbound Towards Financial Center
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {t('nextTrainMotijheel', 'Next to Motijheel')}
              </h3>
              <p className="text-[11px] text-slate-500">
                Approaching: <strong>{selectedStation.nameEn} Platform 2</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Estimated Arrival</span>
            <span className="text-lg sm:text-xl font-extrabold text-sky-700 font-mono">
              {formatCountdown(southboundSeconds)}
            </span>
          </div>
        </div>

        {/* Northbound: To Uttara North */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Northbound Towards Suburb Terminal
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {t('nextTrainUttara', 'Next to Uttara North')}
              </h3>
              <p className="text-[11px] text-slate-500">
                Approaching: <strong>{selectedStation.nameEn} Platform 1</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Estimated Arrival</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono">
              {formatCountdown(northboundSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Station Explorer (Left) & Fare Matrix Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Station Explorer List & Selected Station Detail (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t('stationExplorer', 'Station Real-Time Telemetry')}</span>
              </h2>
              <span className="text-[11px] text-slate-500">Select any station to inspect</span>
            </div>

            {/* Scrollable Station Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {MRT_LINE_6_STATIONS.map((st) => {
                const isSelected = selectedStation.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStation(st)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border shrink-0 text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-[10px] opacity-80 font-mono">#{toBnDigits(st.order)}</span>
                    <span>{language === 'bn' ? st.nameBn : st.nameEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Station Deep-Dive Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'bn' ? selectedStation.nameBn : selectedStation.nameEn}
                    </h3>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-mono px-1.5 py-0.5 rounded font-bold">
                      {selectedStation.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order Station #{toBnDigits(selectedStation.order)} on Elevated Viaduct
                  </p>
                </div>

                {/* Crowd Level Badge */}
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    selectedStation.crowdLevel === 'high'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : selectedStation.crowdLevel === 'moderate'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="capitalize">
                    {selectedStation.crowdLevel} {t('crowdLevel', 'Crowd')}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Turnstile Gate Wait</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    ~{toBnDigits(selectedStation.gateWaitMins)} {t('minsAgo', 'mins').replace('ago', '')}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">First Train (Depot)</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedStation.firstTrain}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Last Train (Terminal)</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedStation.lastTrain}
                  </span>
                </div>
              </div>

              {/* Feeder & Connector Options */}
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  {t('lastMileFeeder', 'Last-Mile Connectors')} & Access Ways:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(language === 'bn' ? selectedStation.connectorsBn : selectedStation.connectors).map(
                    (conn, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Compass className="w-3 h-3 text-emerald-600" />
                        <span>{conn}</span>
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fare & Rapid Pass Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>{t('fareCalculator', 'MRT Fare & Rapid Pass Calculator')}</span>
            </h2>

            {/* Origin & Destination Selectors */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  {t('originStation', 'Departure Station')}
                </label>
                <select
                  value={originCode}
                  onChange={(e) => setOriginCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {MRT_LINE_6_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {language === 'bn' ? s.nameBn : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  {t('destinationStation', 'Arrival Station')}
                </label>
                <select
                  value={destinationCode}
                  onChange={(e) => setDestinationCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {MRT_LINE_6_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {language === 'bn' ? s.nameBn : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fare Summary Box */}
            <div className="p-3.5 bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl border border-sky-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">{t('standardFare', 'Standard Fare')}:</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {toBnDigits(fareData.regularFare)} BDT
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-300 shadow-2xs">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('mrtPassFare', 'MRT Pass Fare (10% Off)')}:</span>
                </span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {toBnDigits(fareData.discountedFare)} BDT
                </span>
              </div>

              {/* Time saved comparison */}
              <div className="pt-2 border-t border-sky-200/80 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/80 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Metro Ride Time</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {toBnDigits(fareData.travelMins)} Mins
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg">
                  <span className="text-[10px] text-rose-500 block">Road Traffic Time</span>
                  <span className="text-xs font-bold text-rose-700 font-mono">
                    ~{toBnDigits(fareData.roadTrafficMins)} Mins
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-800 font-semibold text-center flex items-center justify-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Save ~{toBnDigits(fareData.roadTrafficMins - fareData.travelMins)} minutes compared to surface roads
                </span>
              </div>
            </div>

            {/* Rapid Pass Balance Simulation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rapid Pass / MRT Pass Balance</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{mrtCardNumber}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-[11px]">Available Credit:</span>
                <span className="font-bold text-sm text-emerald-600 font-mono">
                  {cardBalance !== null ? `${toBnDigits(cardBalance)} BDT` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
