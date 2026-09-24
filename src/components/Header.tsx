/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  CloudRain,
  CloudSun,
  Thermometer,
  TrafficCone,
  MapPin,
  Layers,
  Activity,
  AlertTriangle,
  Compass,
  Sliders,
  Sparkles,
  Bot,
  User,
  LogIn,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { LiveMobilityData, LiveWeatherData } from '../types';
import { UserProfile } from '../services/firebase';
import { UpazilaLocation } from '../data/bangladeshLocations';

interface HeaderProps {
  mobilityData: LiveMobilityData;
  weatherData?: LiveWeatherData | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onRefreshData?: () => void;
  userProfile: UserProfile | null;
  activeLocation: UpazilaLocation;
  onOpenAuthModal: (mode?: 'signin' | 'signup' | 'location') => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobilityData,
  weatherData,
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  userProfile,
  activeLocation,
  onOpenAuthModal,
  onSignOut,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview & GIS Map', icon: Layers },
    { id: 'google-map', label: 'Google Maps Locator', icon: MapPin },
    { id: 'copilot', label: 'AI Urban Copilot', icon: Bot },
    { id: 'weather', label: 'Weather Monitoring', icon: CloudSun },
    { id: 'disruption', label: 'Mobility Disruption (UMDI)', icon: Activity },
    { id: 'emergency', label: 'Emergency Access Mode', icon: AlertTriangle },
    { id: 'routes', label: 'Climate Citizen Router', icon: Compass },
    { id: 'planner', label: 'Planner Dashboard', icon: Sparkles },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  ];

  return (
    <header id="nagarshield-header" className="bg-slate-900 border-b border-slate-800 text-white">
      {/* Top Banner: Live Urban Conditions & Data Source Disclosure */}
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Urban Conditions
            </span>

            {/* Live Temperature & Condition from OpenWeather */}
            <button
              onClick={() => setActiveTab('weather')}
              className="flex items-center gap-1.5 text-amber-300 bg-slate-900/90 hover:bg-slate-800/90 transition px-2.5 py-0.5 rounded border border-slate-700/60 font-mono text-left cursor-pointer"
              title="Click to open full Weather Monitoring"
            >
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{weatherData ? `${weatherData.temperatureC}°C` : '29.0°C'}</span>
              <span className="text-slate-400 text-[10px]">
                {weatherData ? `FL: ${weatherData.feelsLikeC}°C` : 'HEAT'}
              </span>
            </button>

            {/* Live Rain / Condition */}
            <button
              onClick={() => setActiveTab('weather')}
              className="flex items-center gap-1.5 text-sky-300 bg-slate-900/90 hover:bg-slate-800/90 transition px-2.5 py-0.5 rounded border border-slate-700/60 font-mono cursor-pointer"
              title="Click to open full Weather Monitoring"
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {weatherData ? `${weatherData.rain1hMm} mm/h` : '0 mm'}
              </span>
              <span className="text-slate-400 text-[10px] capitalize">
                {weatherData ? weatherData.weatherCondition : 'PRECIP'}
              </span>
            </button>

            {/* Air Quality (AQI) indicator */}
            {weatherData?.airQuality && (
              <button
                onClick={() => setActiveTab('weather')}
                className="hidden sm:flex items-center gap-1 text-teal-300 bg-slate-900/90 hover:bg-slate-800/90 transition px-2 py-0.5 rounded border border-slate-700/60 font-mono text-[11px] cursor-pointer"
              >
                <span>AQI:</span>
                <strong className="text-teal-400 font-bold">{weatherData.airQuality.label}</strong>
              </button>
            )}

            <div className="flex items-center gap-1 text-rose-300 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-700/60 font-mono">
              <TrafficCone className="w-3.5 h-3.5 text-rose-400" />
              <span>High Traffic Impact</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Active Bangladesh Location Pill (Clickable Dropdown Mode Switcher) */}
            <button
              type="button"
              id="header-location-switch-btn"
              onClick={() => onOpenAuthModal('location')}
              className="flex items-center gap-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-600/40 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer"
              title="Click to switch Division, Zilla, and Upazila"
            >
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{activeLocation.name}, {activeLocation.zilla} ({activeLocation.division})</span>
              <ChevronDown className="w-3 h-3 text-sky-400/80" />
            </button>

            {/* Auth / Profile State */}
            {userProfile ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => onOpenAuthModal('location')}
                  className="flex items-center gap-1.5 text-slate-200 bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer hover:bg-slate-800 transition"
                  title="Click to view profile & change jurisdiction"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold text-slate-200 max-w-[100px] truncate">
                    {userProfile.displayName}
                  </span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 uppercase font-mono">
                    {userProfile.role === 'urban_planner' ? 'Planner' : userProfile.role === 'emergency_responder' ? 'Responder' : 'Citizen'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-slate-400 hover:text-rose-300 transition text-[11px] p-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="header-signin-btn"
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  id="header-signup-btn"
                  onClick={() => onOpenAuthModal('signup')}
                  className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-0.5 rounded text-[11px] font-bold shadow-xs transition cursor-pointer"
                >
                  <User className="w-3 h-3" />
                  <span>Sign Up (BD Location)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Positioning */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-rose-600 p-0.5 shadow-md shadow-sky-900/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                NagarShield <span className="text-sky-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/60">AI</span>
              </h1>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Pillar III: Mobility Resilience
              </span>
              <span className="hidden sm:inline-block text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                📍 {activeLocation.name}, {activeLocation.zilla}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Urban decision-support platform combining climate risk, heat exposure, and mobility intelligence in Bangladesh.
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Banner */}
        <div className="flex items-center gap-2 text-xs bg-slate-950/60 border border-slate-800 p-1.5 rounded-lg">
          <div className="px-2 py-1 text-center">
            <div className="text-[10px] text-slate-400">Congested Segments</div>
            <div className="font-bold text-amber-400 font-mono">{mobilityData.congestedSegmentsCount} links</div>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div className="px-2 py-1 text-center">
            <div className="text-[10px] text-slate-400">Flood Inundated</div>
            <div className="font-bold text-sky-400 font-mono">{mobilityData.floodAffectedRoadsCount} corridors</div>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div className="px-2 py-1 text-center">
            <div className="text-[10px] text-slate-400">Emergency Base</div>
            <div className="font-bold text-emerald-400 font-mono text-[11px] max-w-[140px] truncate" title={activeLocation.criticalFacilities.hospital}>
              {activeLocation.criticalFacilities.hospital.split(' ')[0]} Hub
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav id="main-nav-tabs" className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-800/80 pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
