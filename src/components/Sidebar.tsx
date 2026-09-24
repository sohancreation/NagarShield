/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Layers,
  MapPin,
  Bot,
  CloudSun,
  Activity,
  AlertTriangle,
  Compass,
  Sparkles,
  Sliders,
  HeartPulse,
  Shield,
  LogOut,
  Train,
  Waves,
  Flame,
  X,
} from 'lucide-react';
import { UpazilaLocation } from '../data/bangladeshLocations';
import { UserProfile } from '../services/firebase';
import { LiveWeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeLocation: UpazilaLocation;
  userProfile: UserProfile | null;
  weatherData?: LiveWeatherData | null;
  onOpenAuthModal: (mode?: 'signin' | 'signup' | 'location') => void;
  onSignOut?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onOpenCopilot?: () => void;
  isCopilotOpen?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  meta?: string;
  statusDot?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  weatherData,
  onOpenAuthModal,
  onSignOut,
  isMobileOpen = false,
  setIsMobileOpen,
  onOpenCopilot,
  isCopilotOpen,
}) => {
  const { t, toBnDigits } = useLanguage();

  const navSections: NavSection[] = [
    {
      title: t('monitoring', 'Monitoring'),
      items: [
        {
          id: 'overview',
          label: t('overview', 'Overview & GIS Map'),
          icon: Layers,
        },
        {
          id: 'waterlogging',
          label: t('waterlogging', 'Waterlogging & Flood Basins'),
          icon: Waves,
          statusDot: 'bg-blue-400',
        },
        {
          id: 'weather',
          label: t('weather', 'Weather & Climate'),
          icon: CloudSun,
          meta: weatherData ? `${toBnDigits(Math.round(weatherData.temperatureC))}°` : undefined,
        },
        {
          id: 'disruption',
          label: t('disruption', 'Mobility & Congestion'),
          icon: Activity,
        },
        {
          id: 'google-map',
          label: t('googleMap', 'Google Maps Locator'),
          icon: MapPin,
        },
      ],
    },
    {
      title: t('resilience', 'Resilience & Transit'),
      items: [
        {
          id: 'incidents',
          label: t('incidents', 'Citizen Hazard Reporter'),
          icon: AlertTriangle,
          statusDot: 'bg-rose-500 animate-pulse',
        },
        {
          id: 'metro',
          label: t('metro', 'Dhaka Metro Rail (MRT-6)'),
          icon: Train,
          meta: 'MRT-6',
        },
        {
          id: 'routes',
          label: t('routes', 'Citizen Safe Router'),
          icon: Compass,
        },
        {
          id: 'find-care',
          label: t('findCare', 'Find Care & Triage'),
          icon: HeartPulse,
        },
        {
          id: 'emergency',
          label: t('emergency', 'Emergency Access'),
          icon: Shield,
        },
      ],
    },
    {
      title: t('intelligence', 'Intelligence'),
      items: [
        {
          id: 'copilot',
          label: t('copilot', 'AI Urban Copilot'),
          icon: Bot,
          meta: 'POPUP',
        },
        {
          id: 'planner',
          label: t('planner', 'Planner Studio'),
          icon: Sparkles,
        },
        {
          id: 'simulator',
          label: t('simulator', 'Scenario Simulator'),
          icon: Sliders,
        },
      ],
    },
  ];

  const handleSelectTab = (id: string) => {
    if (id === 'copilot' && onOpenCopilot) {
      onOpenCopilot();
      if (setIsMobileOpen) {
        setIsMobileOpen(false);
      }
      return;
    }
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const roleLabel =
    userProfile?.role === 'urban_planner' || userProfile?.role === 'planner'
      ? t('urbanPlanner', 'Urban Planner')
      : userProfile?.role === 'emergency_responder' || userProfile?.role === 'emergency_officer'
      ? t('emergencyOfficer', 'Emergency Officer')
      : userProfile?.role === 'researcher'
      ? t('analyst', 'Analyst')
      : t('citizen', 'Citizen');

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen?.(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        id="nagarshield-main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 md:z-30 bg-[#0b0f19] border-r border-slate-800/60 text-slate-300 flex flex-col w-72 sm:w-64 select-none font-sans transition-transform duration-200 ease-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Clean, Lightweight Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 group-hover:border-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">
                {t('appName', 'NagarShield')}
              </span>
              <span className="text-[10px] text-sky-400 font-semibold px-1 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">
                AI
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-300">{t('live', 'LIVE')}</span>
            </div>

            {/* Mobile Close Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen?.(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Minimal Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h2 className="px-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {section.title}
            </h2>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.id === 'copilot' ? Boolean(isCopilotOpen) : activeTab === item.id;
                  const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group text-left ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 font-semibold border-l-2 border-sky-400 pl-2 rounded-r-lg'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-sky-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>

                    {/* Clean inline meta tag */}
                    {item.meta && (
                      <span
                        className={`text-[10px] font-mono shrink-0 ${
                          isActive ? 'text-sky-300' : 'text-slate-500'
                        }`}
                      >
                        {item.meta}
                      </span>
                    )}

                    {/* Status dot */}
                    {item.statusDot && !isActive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${item.statusDot} shrink-0`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Minimal Footer */}
      <div className="h-14 px-3 border-t border-slate-800/60 bg-[#080c15] shrink-0 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenAuthModal('location')}
          className="flex items-center gap-2 min-w-0 text-left cursor-pointer group"
          title="Click to view profile & jurisdiction"
        >
          <div className="relative w-7 h-7 rounded-full bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs transition overflow-hidden">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'Profile'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {userProfile?.displayName
                  ? userProfile.displayName.trim().charAt(0).toUpperCase()
                  : 'M'}
              </span>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate transition-colors">
              {userProfile?.displayName?.split(' ')[0] || 'Officer'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {roleLabel}
            </p>
          </div>
        </button>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
    </>
  );
};
