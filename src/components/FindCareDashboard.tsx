/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Building2,
  Pill,
  Stethoscope,
  FlaskConical,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Compass,
  ArrowRight,
  Ambulance,
  PhoneCall,
  Share2,
  Bookmark,
  BookmarkCheck,
  Info,
  Map as MapIcon,
  Grid,
  Radio,
  RefreshCw,
  X,
} from 'lucide-react';
import { CareProvider, CareCategory, FindCareSearchResult } from '../types';
import { UpazilaLocation } from '../data/bangladeshLocations';
import {
  getCareProvidersForLocation,
  BANGLADESH_HEALTH_HELPLINES,
  calculateDistanceKm,
} from '../data/careProvidersData';
import { findCareWithAi } from '../services/geminiService';

interface FindCareDashboardProps {
  activeLocation: UpazilaLocation;
  onNavigateToTab: (tab: string, context?: any) => void;
  onSelectRouteTarget?: (provider: CareProvider) => void;
}

export const FindCareDashboard: React.FC<FindCareDashboardProps> = ({
  activeLocation,
  onNavigateToTab,
  onSelectRouteTarget,
}) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState<CareCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radiusFilter, setRadiusFilter] = useState<number>(20); // max km
  const [only24x7, setOnly24x7] = useState<boolean>(false);
  const [onlyEmergency, setOnlyEmergency] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'MAP'>('GRID');
  const [savedProviderIds, setSavedProviderIds] = useState<Set<string>>(new Set());

  // AI Search & Triage State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<FindCareSearchResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProviderForMap, setSelectedProviderForMap] = useState<CareProvider | null>(null);

  // Default localized providers based on selected location
  const baselineProviders = useMemo(() => {
    return getCareProvidersForLocation(activeLocation, 'ALL', '');
  }, [activeLocation]);

  // Combined providers list: merges AI suggestions (if any) with baseline location directory
  const displayedProviders = useMemo(() => {
    let list: CareProvider[] = [];

    if (aiResult?.providers && aiResult.providers.length > 0) {
      // Use AI enriched list + fill with baseline
      const aiIds = new Set(aiResult.providers.map((p) => p.name.toLowerCase()));
      const baselineFiltered = baselineProviders.filter(
        (bp) => !aiIds.has(bp.name.toLowerCase())
      );
      list = [...aiResult.providers, ...baselineFiltered];
    } else {
      list = [...baselineProviders];
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.specialty?.toLowerCase().includes(q) ||
          p.doctorName?.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.services.some((s) => s.toLowerCase().includes(q))
        );
      });
    }

    // Filter by 24/7
    if (only24x7) {
      list = list.filter((p) => p.is24x7);
    }

    // Filter by Emergency Unit
    if (onlyEmergency) {
      list = list.filter((p) => p.hasEmergencyUnit);
    }

    // Filter by Radius
    list = list.filter((p) => p.distanceKm <= radiusFilter);

    // Sort by distance ascending
    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [
    baselineProviders,
    aiResult,
    selectedCategory,
    searchQuery,
    only24x7,
    onlyEmergency,
    radiusFilter,
  ]);

  // Auto-run AI Care Evaluation on initial load or location change if query exists
  const handleRunAiCareSearch = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    setIsAiLoading(true);

    try {
      const result = await findCareWithAi({
        query: q || `Emergency healthcare facilities in ${activeLocation.name}`,
        category: selectedCategory,
        location: {
          name: activeLocation.name,
          zilla: activeLocation.zilla,
          division: activeLocation.division,
          lat: activeLocation.lat,
          lon: activeLocation.lon,
          canalOrRiver: activeLocation.canalOrRiver,
        },
        radiusKm: radiusFilter,
        emergencyOnly: onlyEmergency,
        openNow: only24x7,
      });

      setAiResult(result);
    } catch (err) {
      console.error('AI care search error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Re-trigger search when location changes
  useEffect(() => {
    setAiResult(null);
    setSelectedProviderForMap(null);
  }, [activeLocation]);

  const toggleBookmark = (id: string) => {
    setSavedProviderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyPhoneNumber = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRouteToFacility = (provider: CareProvider) => {
    if (onSelectRouteTarget) {
      onSelectRouteTarget(provider);
    }
    onNavigateToTab('routes');
  };

  const handleEmergencyDispatch = (provider: CareProvider) => {
    if (onSelectRouteTarget) {
      onSelectRouteTarget(provider);
    }
    onNavigateToTab('emergency');
  };

  const categoryTabs = [
    { id: 'ALL', label: 'All Care', icon: HeartPulse, count: displayedProviders.length },
    {
      id: 'HOSPITAL',
      label: 'Hospitals',
      icon: Building2,
      count: displayedProviders.filter((p) => p.category === 'HOSPITAL').length,
    },
    {
      id: 'PHARMACY',
      label: 'Pharmacies',
      icon: Pill,
      count: displayedProviders.filter((p) => p.category === 'PHARMACY').length,
    },
    {
      id: 'DOCTOR',
      label: 'Doctors & Specialists',
      icon: Stethoscope,
      count: displayedProviders.filter((p) => p.category === 'DOCTOR').length,
    },
    {
      id: 'DIAGNOSTIC',
      label: 'Diagnostic Labs',
      icon: FlaskConical,
      count: displayedProviders.filter((p) => p.category === 'DIAGNOSTIC').length,
    },
    {
      id: 'CLINIC',
      label: 'Clinics',
      icon: ShieldCheck,
      count: displayedProviders.filter((p) => p.category === 'CLINIC').length,
    },
  ];

  const quickPrompts = [
    '24/7 Pharmacy with insulin & oxygen',
    'Child specialist / Pediatrician open today',
    'Emergency Hospital with ICU & Burn Unit',
    'Dengue NS1 Antigen & CBC 2-hr blood test',
    'Cardiologist for chest pain triage',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Location Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    NagarShield Health Grid
                  </span>
                  <span className="flex items-center text-xs text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-ping" />
                    Live Grounding Active
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                  Find Care & Medical Triage
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 text-xs">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Active Jurisdiction</p>
                <p className="text-white font-bold text-sm">
                  {activeLocation.name}, {activeLocation.zilla}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Autonomous multi-disciplinary healthcare locator for pharmacies, tertiary hospitals, specialist doctors, diagnostic pathology labs, and maternal clinics across Bangladesh. Real-time distance calculation, direct emergency contact numbers, and flood-resilient route navigation.
          </p>

          {/* Quick Emergency Helplines Strip */}
          <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-amber-300 flex items-center mr-1">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
              National 24/7 Helplines:
            </span>
            {BANGLADESH_HEALTH_HELPLINES.map((hl) => (
              <a
                key={hl.number}
                href={`tel:${hl.number}`}
                className="inline-flex items-center space-x-2 bg-slate-800/90 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition-all duration-200 group"
                title={hl.description}
              >
                <PhoneCall className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-bold">{hl.number}</span>
                <span className="text-slate-400 text-[11px] group-hover:text-slate-200 hidden sm:inline">
                  • {hl.name.split('(')[0].trim()}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Search & AI Triage Box */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRunAiCareSearch();
                }
              }}
              placeholder={`Search pharmacies, hospitals, doctors, clinics, tests, or medicine in ${activeLocation.name}...`}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunAiCareSearch()}
              disabled={isAiLoading}
              className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Care Grid...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Ask AI Care Finder</span>
                </>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  viewMode === 'GRID'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('MAP')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  viewMode === 'MAP'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="GIS Map View"
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center">
            <Bot className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Quick Triage:
          </span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setSearchQuery(prompt);
                handleRunAiCareSearch(prompt);
              }}
              className="shrink-0 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Filter Row: Category Tabs + Quick Toggles */}
        <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categoryTabs.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CareCategory)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setOnly24x7(!only24x7)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                only24x7
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🟢 24/7 Open
            </button>

            <button
              onClick={() => setOnlyEmergency(!onlyEmergency)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                onlyEmergency
                  ? 'bg-rose-100 border-rose-300 text-rose-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🚨 Emergency Unit
            </button>

            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Radius:</span>
              <select
                value={radiusFilter}
                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value={3}>Within 3 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Any Distance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* AI Clinical Triage Advisory (if generated) */}
      {aiResult?.aiCareSummary && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-emerald-950">
                    NagarShield AI Medical Triage Guidance
                  </h3>
                  <span className="bg-emerald-200/60 text-emerald-800 text-[11px] px-2 py-0.5 rounded font-bold">
                    {aiResult.queryAnalyzed.intent || 'Clinical Evaluation'}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Target: {aiResult.queryAnalyzed.locationName}
                </span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {aiResult.aiCareSummary}
              </p>
              {aiResult.queryAnalyzed.specialtyDetected && (
                <div className="mt-2 text-xs text-emerald-800 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Recommended Clinical Specialty: {aiResult.queryAnalyzed.specialtyDetected}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Providers Header Counter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <span>Healthcare Facilities & Chambers</span>
            <span className="ml-2.5 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
              {displayedProviders.length} Found
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Sorted by physical proximity to {activeLocation.name} Sadar
          </p>
        </div>

        {savedProviderIds.size > 0 && (
          <div className="flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
            <BookmarkCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            {savedProviderIds.size} Saved
          </div>
        )}
      </div>

      {/* Main Content: Grid View or Map View */}
      {viewMode === 'GRID' ? (
        displayedProviders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching healthcare facilities found within {radiusFilter} km
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try expanding your radius, clearing your filters, or asking AI to scan regional tertiary medical centers across {activeLocation.zilla}.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setOnly24x7(false);
                  setOnlyEmergency(false);
                  setRadiusFilter(50);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProviders.map((provider) => {
              const isSaved = savedProviderIds.has(provider.id);
              const isCopied = copiedId === provider.id;

              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-3.5">
                    {/* Top Row: Category Badge + Distance Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                            provider.category === 'HOSPITAL'
                              ? 'bg-rose-100 text-rose-800'
                              : provider.category === 'PHARMACY'
                              ? 'bg-teal-100 text-teal-800'
                              : provider.category === 'DOCTOR'
                              ? 'bg-blue-100 text-blue-800'
                              : provider.category === 'DIAGNOSTIC'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {provider.category === 'HOSPITAL' && <Building2 className="w-3 h-3 mr-0.5" />}
                          {provider.category === 'PHARMACY' && <Pill className="w-3 h-3 mr-0.5" />}
                          {provider.category === 'DOCTOR' && <Stethoscope className="w-3 h-3 mr-0.5" />}
                          {provider.category === 'DIAGNOSTIC' && <FlaskConical className="w-3 h-3 mr-0.5" />}
                          {provider.category === 'CLINIC' && <ShieldCheck className="w-3 h-3 mr-0.5" />}
                          <span>{provider.category}</span>
                        </span>

                        {provider.is24x7 && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            24/7
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <div className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-700 flex items-center">
                          <Navigation className="w-3 h-3 mr-1 text-emerald-600" />
                          <span>{provider.distanceKm} km</span>
                        </div>

                        <button
                          onClick={() => toggleBookmark(provider.id)}
                          className={`p-1 rounded-md transition-colors ${
                            isSaved
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={isSaved ? 'Remove bookmark' : 'Bookmark facility'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Facility Name & Doctor Degree */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                        {provider.name}
                      </h3>
                      {provider.specialty && (
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          {provider.specialty}
                        </p>
                      )}
                      {provider.doctorDegree && (
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 italic">
                          {provider.doctorDegree}
                        </p>
                      )}
                    </div>

                    {/* Address & Operating Hours */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{provider.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className={provider.is24x7 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                          {provider.openStatus}
                        </span>
                      </div>
                    </div>

                    {/* Services Tags */}
                    {provider.services && provider.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {provider.services.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {provider.services.length > 4 && (
                          <span className="text-[10px] text-slate-400 px-1 py-0.5">
                            +{provider.services.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* AI Recommendation Context */}
                    {provider.aiRecommendation && (
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 text-xs text-emerald-900 flex items-start space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong className="font-bold">AI Insight:</strong> {provider.aiRecommendation}
                        </p>
                      </div>
                    )}

                    {/* Flood Route Status */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Route Reliability:</span>
                      {provider.floodSafeRoute ? (
                        <span className="text-emerald-700 font-bold flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                          High-Ground / Flood-Safe
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                          Possible Embankment Congestion
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="bg-slate-50 p-3 border-t border-slate-200/80 flex items-center gap-2">
                    {/* Direct Call Button */}
                    <a
                      href={`tel:${provider.contactNumber}`}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {provider.contactNumber}</span>
                    </a>

                    {/* Copy Phone */}
                    <button
                      onClick={() => copyPhoneNumber(provider.id, provider.contactNumber)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                      title={isCopied ? 'Copied!' : 'Copy number'}
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Safe Route */}
                    <button
                      onClick={() => handleRouteToFacility(provider)}
                      className="inline-flex items-center space-x-1 p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-xs font-bold transition-colors"
                      title="Plot safe route on Safe Router"
                    >
                      <Compass className="w-4 h-4 text-emerald-600" />
                    </button>

                    {/* Emergency Mode Dispatch (if hospital or emergency) */}
                    {provider.hasEmergencyUnit && (
                      <button
                        onClick={() => handleEmergencyDispatch(provider)}
                        className="inline-flex items-center space-x-1 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                        title="Open Emergency Dispatch Corridor"
                      >
                        <Ambulance className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Interactive Map View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                GIS Healthcare Spatial Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Pointers represent pharmacies, hospitals, and chambers around {activeLocation.name}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center text-rose-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mr-1" />
                Hospitals
              </span>
              <span className="flex items-center text-teal-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block mr-1" />
                Pharmacies
              </span>
              <span className="flex items-center text-blue-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block mr-1" />
                Doctors
              </span>
            </div>
          </div>

          <div className="relative h-[550px] bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Embedded interactive GIS SVG representation */}
            <svg
              className="w-full h-full"
              viewBox="0 0 800 500"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="#090d16" />
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Canal / River water feature */}
              <path
                d="M 50 150 Q 220 120 400 240 T 750 300"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <text x="650" y="270" fill="#38bdf8" fontSize="11" fontWeight="bold" opacity="0.8">
                {activeLocation.canalOrRiver || 'Waterway Drainage Canal'}
              </text>

              {/* Arterial Corridors */}
              <path d="M 100 400 L 700 100" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <path d="M 120 100 L 680 400" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <path d="M 400 50 L 400 450" stroke="#1e293b" strokeWidth="4" strokeDasharray="6 4" />

              {/* Active User GPS Center */}
              <g transform="translate(400, 250)">
                <circle r="22" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                <circle r="12" fill="#059669" />
                <circle r="4" fill="#ffffff" />
                <text x="18" y="4" fill="#6ee7b7" fontSize="12" fontWeight="bold">
                  {activeLocation.name} Sadar Point
                </text>
              </g>

              {/* Pinned Care Providers */}
              {displayedProviders.map((provider, index) => {
                // Generate deterministic position around center based on lat/lng offset
                const dx = ((provider.lng - activeLocation.lon) * 12000) % 320;
                const dy = -((provider.lat - activeLocation.lat) * 12000) % 180;
                const posX = 400 + dx;
                const posY = 250 + dy;

                const color =
                  provider.category === 'HOSPITAL'
                    ? '#f43f5e'
                    : provider.category === 'PHARMACY'
                    ? '#14b8a6'
                    : provider.category === 'DOCTOR'
                    ? '#3b82f6'
                    : provider.category === 'DIAGNOSTIC'
                    ? '#a855f7'
                    : '#10b981';

                const isSelected = selectedProviderForMap?.id === provider.id;

                return (
                  <g
                    key={provider.id}
                    transform={`translate(${posX}, ${posY})`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedProviderForMap(provider)}
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle r="24" fill={color} fillOpacity="0.3" className="animate-pulse" />
                    )}

                    {/* Marker pin */}
                    <circle
                      r={isSelected ? 14 : 11}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Distance label */}
                    <text
                      x="16"
                      y="4"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      className="drop-shadow-md select-none"
                    >
                      {provider.name.split(' ')[0]} ({provider.distanceKm}km)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Provider Pop-up Overlay inside Map */}
            {selectedProviderForMap && (
              <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 space-y-3 z-30">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {selectedProviderForMap.category} • {selectedProviderForMap.distanceKm} km away
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                      {selectedProviderForMap.name}
                    </h4>
                    <p className="text-xs text-slate-500">{selectedProviderForMap.address}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProviderForMap(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 font-medium">
                    Status: <strong className="text-emerald-700">{selectedProviderForMap.openStatus}</strong>
                  </span>
                  <span className="text-slate-600 font-medium">
                    Contact: <strong className="text-slate-900">{selectedProviderForMap.contactNumber}</strong>
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={`tel:${selectedProviderForMap.contactNumber}`}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <button
                    onClick={() => handleRouteToFacility(selectedProviderForMap)}
                    className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Get Route</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
