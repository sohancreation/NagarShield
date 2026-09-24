/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Menu,
  MapPin,
  Crosshair,
  CloudSun,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  RefreshCw,
  Sparkles,
  Layers,
  Building2,
  CheckCircle2,
  Bell,
  ArrowLeft,
  Languages,
} from 'lucide-react';
import { UpazilaLocation, findNearestUpazila } from '../data/bangladeshLocations';
import { LiveWeatherData } from '../types';
import { UserProfile } from '../services/firebase';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

interface TopbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeLocation: UpazilaLocation;
  onSelectLocation: (location: UpazilaLocation) => void;
  weatherData?: LiveWeatherData | null;
  userProfile: UserProfile | null;
  onOpenAuthModal: (mode?: 'signin' | 'signup' | 'location') => void;
  onSignOut: () => void;
  onOpenMobileSidebar?: () => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onBack?: () => void;
  // Always Auto-Refresh live telemetry props
  isAutoRefresh?: boolean;
  onToggleAutoRefresh?: () => void;
  onManualRefresh?: () => void;
  lastRefreshedAt?: Date;
  refreshCountdown?: number;
  autoRefreshIntervalSec?: number;
  onChangeRefreshInterval?: (sec: number) => void;
  isRefreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  setActiveTab,
  activeLocation,
  onSelectLocation,
  weatherData,
  userProfile,
  onOpenAuthModal,
  onSignOut,
  onOpenMobileSidebar,
  notificationCount = 0,
  onOpenNotifications,
  onBack,
  isAutoRefresh = true,
  onToggleAutoRefresh,
  onManualRefresh,
  lastRefreshedAt,
  refreshCountdown = 15,
  autoRefreshIntervalSec = 15,
  onChangeRefreshInterval,
  isRefreshing = false,
}) => {
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);
  const [isRefreshMenuOpen, setIsRefreshMenuOpen] = useState<boolean>(false);

  const { language, toggleLanguage, t, toBnDigits } = useLanguage();

  const tabTitles: Record<string, { title: string; subtitle: string; titleBn?: string; subtitleBn?: string }> = {
    overview: {
      title: 'Urban Resilience Dashboard',
      subtitle: 'Compound flood, heat, and traffic mobility analytics',
      titleBn: 'সারসংক্ষেপ ও জিআইএস মানচিত্র',
      subtitleBn: 'বন্যা, তাপমাত্রা এবং যানজট সহনশীলতা অ্যানালিটিক্স',
    },
    'google-map': {
      title: 'Google Maps Locator',
      subtitle: 'Live satellite, traffic flows, and emergency facilities',
      titleBn: 'গুগল ম্যাপস লোকেটার',
      subtitleBn: 'স্যাটেলাইট, রিয়েল-টাইম ট্রাফিক এবং জরুরি সেবা কেন্দ্র',
    },
    incidents: {
      title: 'Citizen Hazard & Incident Reporter',
      subtitle: 'Crowdsourced hazard reports with real-time community validation',
      titleBn: 'নাগরিক দুর্যোগ ও সমস্যা রিপোর্টার',
      subtitleBn: 'নাগরিকদের পাঠানো সরাসরি প্রতিবেদন ও জরুরি টিম মোতায়েন',
    },
    metro: {
      title: 'Dhaka Metro Rail (MRT-6)',
      subtitle: 'Live elevated transit headways, station crowding & fare matrix',
      titleBn: 'ঢাকা মেট্রোরেল (এমআরটি-৬)',
      subtitleBn: 'লাইভ ট্রেনের আগমন সময়, স্টেশনের ভিড় এবং ভাড়া তালিকা',
    },
    waterlogging: {
      title: 'Waterlogging & Flood Basin Monitor',
      subtitle: 'WASA pump stations, canal retention levels & runoff saturation',
      titleBn: 'জলাবদ্ধতা ও ড্রেনেজ খাল পর্যবেক্ষণ কেন্দ্র',
      subtitleBn: 'ওয়াসা পাম্প স্টেশন ও ঢাকা-চট্টগ্রামের প্রধান খালের অবস্থা',
    },
    copilot: {
      title: 'AI Urban Copilot',
      subtitle: 'AI reasoning grounded in maps & climate records',
      titleBn: 'এআই আরবান কোপাইলট',
      subtitleBn: 'মানচিত্র ও জলবায়ু তথ্যে গ্রাউন্ডেড কৃত্রিম বুদ্ধিমত্তা',
    },
    weather: {
      title: 'Weather & Climate Monitoring',
      subtitle: 'Hourly observations, radar rain, and 5-day flood outlook',
      titleBn: 'আবহাওয়া ও জলবায়ু পর্যবেক্ষণ',
      subtitleBn: 'ঘণ্টাভিত্তিক বৃষ্টিপাত, স্যাটেলাইট রাডার ও পূর্বাভাস',
    },
    disruption: {
      title: 'Mobility Disruption (UMDI)',
      subtitle: 'Corridor risk indices and intersection bottlenecks',
      titleBn: 'যানজট ও চলাচল বিঘ্ন (ইউএমডিআই)',
      subtitleBn: 'সড়ক ঝুঁকি সূচক এবং ইন্টারসেকশন যানজট',
    },
    emergency: {
      title: 'Emergency Access Mode',
      subtitle: 'Hospital and fire response route clearance',
      titleBn: 'জরুরি করিডোর সেবা',
      subtitleBn: 'হাসপাতাল ও ফায়ার সার্ভিসের দ্রুততম রুট',
    },
    'find-care': {
      title: 'Find Care & Medical Triage',
      subtitle: 'Nearby pharmacies, tertiary hospitals, doctors, and diagnostic labs',
      titleBn: 'জরুরি চিকিৎসা ও হাসপাতাল',
      subtitleBn: 'নিকটবর্তী ফার্মেসি, বিশেষায়িত হাসপাতাল ও ডায়াগনস্টিক ল্যাব',
    },
    routes: {
      title: 'Climate Citizen Router',
      subtitle: 'Heat and flood exposure route comparison',
      titleBn: 'নাগরিক নিরাপদ রুট নির্দেশক',
      subtitleBn: 'তাপমাত্রা ও জলাবদ্ধতা এড়িয়ে নিরাপদ পথ নির্দেশিকা',
    },
    planner: {
      title: 'Planner Mitigation Dashboard',
      subtitle: 'Strategic drainage and traffic intervention engine',
      titleBn: 'নগর পরিকল্পনাবিদ স্টুডিও',
      subtitleBn: 'ড্রেনেজ ও যানজট নিরসন কর্মপরিকল্পনা',
    },
    simulator: {
      title: 'What-If Resilience Simulator',
      subtitle: 'Scenario modeling for signal retiming & culvert upgrades',
      titleBn: 'পরিস্থিতি সিমুলেটর',
      subtitleBn: 'কালভার্ট সম্প্রসারণ ও ট্রাফিক সিগন্যাল রূপরেখা',
    },
  };

  const rawInfo = tabTitles[activeTab] || {
    title: 'NagarShield AI',
    subtitle: 'Urban Decision Platform',
    titleBn: 'নগরশীল্ড এআই',
    subtitleBn: 'নগর সিদ্ধান্ত প্ল্যাটফর্ম',
  };

  const currentTabInfo = {
    title: language === 'bn' && rawInfo.titleBn ? rawInfo.titleBn : rawInfo.title,
    subtitle: language === 'bn' && rawInfo.subtitleBn ? rawInfo.subtitleBn : rawInfo.subtitle,
  };

  // Quick GPS Locate Me
  const handleQuickGpsLocate = () => {
    if (!navigator.geolocation) {
      setGpsFeedback('GPS not supported');
      setTimeout(() => setGpsFeedback(null), 3000);
      return;
    }

    setIsGpsLocating(true);
    setGpsFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLocating(false);
        const { upazila, distanceKm } = findNearestUpazila(pos.coords.latitude, pos.coords.longitude);
        onSelectLocation(upazila);
        setGpsFeedback(`Located: ${upazila.name} (${distanceKm} km)`);
        setTimeout(() => setGpsFeedback(null), 4000);
      },
      (err) => {
        setIsGpsLocating(false);
        setGpsFeedback('GPS permission denied');
        setTimeout(() => setGpsFeedback(null), 3000);
      },
      { timeout: 8000 }
    );
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20 shadow-2xs">
      {/* Left: Mobile Menu, Back Button & Current Tab Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Button */}
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Dedicated Back Button from All Windows */}
        {activeTab !== 'overview' && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-200 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0 group"
            title="Back to previous window or Overview"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-sky-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-xs sm:text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
            <span className="truncate">{currentTabInfo.title}</span>
          </h1>
          <p className="text-[11px] text-slate-500 truncate hidden md:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Location Quick-Pill, GPS Locate, Weather, Auth */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Active Location Dropdown Pill */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
          <button
            onClick={() => onOpenAuthModal('location')}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400 transition cursor-pointer"
            title="Click to change municipal location"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="max-w-[70px] sm:max-w-[130px] md:max-w-[160px] truncate font-bold text-[11px] sm:text-xs">
              {activeLocation.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Quick GPS button */}
          <button
            onClick={handleQuickGpsLocate}
            disabled={isGpsLocating}
            className="px-1.5 sm:px-2 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 text-xs font-medium border-l border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Auto-detect current GPS location in Bangladesh"
          >
            <Crosshair className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isGpsLocating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-[11px]">{isGpsLocating ? 'GPS...' : 'GPS'}</span>
          </button>
        </div>

        {/* ALWAYS AUTO-REFRESH LIVE TELEMETRY PILL */}
        <div className="relative">
          <div className="flex items-center rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 p-0.5 shadow-2xs">
            <button
              onClick={() => onManualRefresh?.()}
              disabled={isRefreshing}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 transition cursor-pointer text-xs font-bold"
              title={`Live Telemetry Auto-Refreshes every ${autoRefreshIntervalSec}s (Next in ${refreshCountdown}s). Click to refresh now.`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoRefresh ? 'bg-emerald-400 opacity-75' : 'bg-slate-400 opacity-0'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                LIVE
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 hidden xs:inline">
                {isRefreshing ? '...' : `${refreshCountdown}s`}
              </span>
              <RefreshCw className={`w-3 h-3 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Dropdown menu trigger for refresh interval / toggle */}
            <button
              onClick={() => setIsRefreshMenuOpen(!isRefreshMenuOpen)}
              className="px-1 py-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 rounded-md transition cursor-pointer"
              title="Auto-refresh settings"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Auto Refresh Menu Dropdown */}
          {isRefreshMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRefreshMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Always Auto-Refresh
                  </span>
                  <button
                    onClick={() => onToggleAutoRefresh?.()}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                      isAutoRefresh
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isAutoRefresh ? 'ENABLED' : 'PAUSED'}
                  </button>
                </div>

                <div className="space-y-1.5 mb-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Refresh Rate
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[10, 15, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          onChangeRefreshInterval?.(sec);
                          setIsRefreshMenuOpen(false);
                        }}
                        className={`py-1 text-center rounded-lg font-mono text-[10px] cursor-pointer transition ${
                          autoRefreshIntervalSec === sec
                            ? 'bg-sky-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Last synced:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onManualRefresh?.();
                    setIsRefreshMenuOpen(false);
                  }}
                  className="w-full mt-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Now</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* GPS Feedback Toast/Badge */}
        {gpsFeedback && (
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700/60 animate-in fade-in">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            {gpsFeedback}
          </span>
        )}

        {/* Live Weather Pill */}
        <button
          onClick={() => setActiveTab('weather')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50/80 hover:bg-sky-100 text-sky-800 border border-sky-200/80 text-xs font-semibold transition cursor-pointer"
          title="Open live weather telemetry"
        >
          <CloudSun className="w-3.5 h-3.5 text-sky-600" />
          <span>{weatherData ? `${weatherData.temperatureC}°C` : '29°C'}</span>
          <span className="text-[10px] text-sky-600/80 font-normal">
            {weatherData?.weatherDescription || 'Fair'}
          </span>
        </button>

        {/* AI Notification Center Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
          title="AI Hazard Warning Center"
          aria-label="AI Hazard Warning Center"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Bengali / English Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition cursor-pointer shadow-2xs"
          title={language === 'en' ? 'বাংলা ভাষায় দেখুন' : 'Switch to English'}
        >
          <Languages className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-sans font-extrabold text-[11px]">{language === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Display Theme Mode Switcher (Light / Dark / Night OLED) */}
        <ThemeToggle variant="compact" />

        {/* Small Circle Profile Button & Sign Out */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenAuthModal('location')}
            className="relative w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs transition hover:ring-2 hover:ring-emerald-400 dark:hover:ring-emerald-400 cursor-pointer overflow-hidden shrink-0 group"
            title={`${userProfile?.displayName || 'User Profile'} (${userProfile?.role || 'Planner'}) • Click to change profile / jurisdiction`}
            aria-label="User Profile"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'Profile'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="uppercase text-xs font-black tracking-tight">
                {userProfile?.displayName
                  ? userProfile.displayName.trim().charAt(0).toUpperCase()
                  : 'M'}
              </span>
            )}
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900"
              title="Active session"
            />
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Sign Out from Grid"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
