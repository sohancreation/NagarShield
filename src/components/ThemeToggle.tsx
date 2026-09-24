/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sparkles, Check, Eye, Shield, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'icon-only';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, setTheme, cycleTheme, nightVisionHud, toggleNightVisionHud } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: { id: ThemeMode; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'light',
      label: 'Day Light',
      desc: 'High clarity daylight visibility',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark Slate',
      desc: 'Balanced low-light contrast',
      icon: Moon,
    },
    {
      id: 'night',
      label: 'Tactical Night',
      desc: 'OLED #000 true black & glare reduction',
      icon: Sparkles,
    },
  ];

  // 1. Segmented Control Variant (Ideal for Sidebar)
  if (variant === 'segmented') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span className="flex items-center gap-1">
            {theme === 'light' && <Sun className="w-3 h-3 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-3 h-3 text-sky-400" />}
            {theme === 'night' && <Sparkles className="w-3 h-3 text-emerald-400" />}
            <span>Display Theme</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 capitalize">
            {theme === 'night' ? 'OLED Night' : theme}
          </span>
        </div>

        {/* 3-Way Segmented Switcher */}
        <div className="grid grid-cols-3 p-0.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                  isSelected
                    ? opt.id === 'night'
                      ? 'bg-slate-950 text-emerald-300 font-semibold shadow-xs border border-emerald-500/30'
                      : opt.id === 'dark'
                      ? 'bg-slate-800 text-sky-300 font-semibold shadow-xs border border-sky-500/30'
                      : 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={opt.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  isSelected
                    ? opt.id === 'night'
                      ? 'text-emerald-400'
                      : opt.id === 'dark'
                      ? 'text-sky-400'
                      : 'text-amber-500'
                    : 'text-slate-400'
                }`} />
                <span className="capitalize">{opt.id}</span>
              </button>
            );
          })}
        </div>

        {/* Extra Tactical HUD Toggle in Night Mode */}
        {theme === 'night' && (
          <button
            type="button"
            onClick={toggleNightVisionHud}
            className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] border transition cursor-pointer ${
              nightVisionHud
                ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>Low-Glare EOC Night Filter</span>
            </span>
            <span className="font-mono text-[9px] uppercase font-bold">
              {nightVisionHud ? 'ON' : 'OFF'}
            </span>
          </button>
        )}
      </div>
    );
  }

  // 2. Icon-Only Quick Cycle Variant
  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        className={`p-2 rounded-xl border transition cursor-pointer relative group ${
          theme === 'night'
            ? 'bg-slate-950 hover:bg-slate-900 border-emerald-600/40 text-emerald-400 shadow-xs'
            : theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-400'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-amber-600'
        } ${className}`}
        title={`Current: ${theme.toUpperCase()} mode (Click to cycle)`}
        aria-label="Toggle Theme Mode"
      >
        {theme === 'light' && <Sun className="w-4 h-4 transition-transform group-hover:rotate-45" />}
        {theme === 'dark' && <Moon className="w-4 h-4 transition-transform group-hover:-rotate-12" />}
        {theme === 'night' && <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />}
      </button>
    );
  }

  // 3. Compact Dropdown Button Variant (Default for Topbar)
  const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Sparkles;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-2xs ${
          theme === 'night'
            ? 'bg-[#000000] hover:bg-slate-900 border-emerald-500/40 text-emerald-300'
            : theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
            : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
        }`}
        title="Switch Light, Dark, or Night Mode"
        aria-expanded={isOpen}
      >
        <CurrentIcon
          className={`w-3.5 h-3.5 shrink-0 ${
            theme === 'light'
              ? 'text-amber-500'
              : theme === 'dark'
              ? 'text-sky-400'
              : 'text-emerald-400'
          }`}
        />
        <span className="hidden sm:inline capitalize font-medium text-[11px]">
          {theme === 'night' ? 'Night OLED' : theme}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-200">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Display Appearance
          </div>

          <div className="space-y-0.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                    isSelected
                      ? opt.id === 'night'
                        ? 'bg-emerald-950/60 text-emerald-200'
                        : opt.id === 'dark'
                        ? 'bg-slate-800 text-sky-200'
                        : 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className={`p-1 rounded-md shrink-0 mt-0.5 ${
                    opt.id === 'light'
                      ? 'bg-amber-500/10 text-amber-400'
                      : opt.id === 'dark'
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick HUD filter if Night mode */}
          {theme === 'night' && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 px-1">
              <button
                type="button"
                onClick={toggleNightVisionHud}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/60 hover:bg-black text-[10px] text-slate-300 border border-slate-800 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Night Vision Filter</span>
                </span>
                <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                  nightVisionHud
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {nightVisionHud ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
