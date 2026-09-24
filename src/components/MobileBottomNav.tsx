/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Layers,
  AlertTriangle,
  Train,
  Waves,
  Bot,
  Menu,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenCopilot: () => void;
  isCopilotOpen?: boolean;
  unresolvedHazardsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileSidebar,
  onOpenCopilot,
  isCopilotOpen = false,
  unresolvedHazardsCount = 0,
}) => {
  const { t, toBnDigits } = useLanguage();

  const navItems = [
    {
      id: 'overview',
      label: t('map', 'Map'),
      icon: Layers,
      action: () => setActiveTab('overview'),
      isActive: activeTab === 'overview' && !isCopilotOpen,
    },
    {
      id: 'incidents',
      label: t('hazards', 'Hazards'),
      icon: AlertTriangle,
      badge: unresolvedHazardsCount > 0 ? toBnDigits(unresolvedHazardsCount) : undefined,
      action: () => setActiveTab('incidents'),
      isActive: activeTab === 'incidents' && !isCopilotOpen,
    },
    {
      id: 'metro',
      label: t('metro', 'Metro'),
      icon: Train,
      action: () => setActiveTab('metro'),
      isActive: activeTab === 'metro' && !isCopilotOpen,
    },
    {
      id: 'waterlogging',
      label: t('drainage', 'Drainage'),
      icon: Waves,
      action: () => setActiveTab('waterlogging'),
      isActive: activeTab === 'waterlogging' && !isCopilotOpen,
    },
    {
      id: 'copilot',
      label: t('copilot', 'AI Copilot'),
      icon: Bot,
      action: onOpenCopilot,
      isActive: isCopilotOpen,
      isSpecial: true,
    },
    {
      id: 'more',
      label: t('more', 'More'),
      icon: Menu,
      action: onOpenMobileSidebar,
      isActive: false,
    },
  ];

  return (
    <nav
      id="nagarshield-mobile-bottom-bar"
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 px-1 py-1 flex items-center justify-around shadow-lg select-none pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative active:scale-95 ${
              item.isActive
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            {/* Top Indicator Dot for active item */}
            {item.isActive && (
              <span className="absolute -top-1 w-5 h-0.5 rounded-full bg-sky-500 dark:bg-sky-400" />
            )}

            <div className="relative">
              {item.isSpecial ? (
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                    item.isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}

              {/* Dynamic Badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-1 ring-white dark:ring-slate-900">
                  {item.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] truncate max-w-full leading-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
