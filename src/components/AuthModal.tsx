/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Compass,
  CheckCircle2,
  Crosshair,
  User,
  Sparkles,
  Building2,
  Radio,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Activity,
  Waves,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  getAllDivisions,
  getZillasByDivision,
  getDivisionForZilla,
  getUpazilasByZilla,
  getLocationDetails,
  findNearestUpazila,
  UpazilaLocation,
  DEFAULT_BANGLADESH_LOCATION,
} from '../data/bangladeshLocations';
import { UserProfile, saveUserProfile } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile | null;
  onProfileUpdated: (profile: UserProfile) => void;
  onSignedOut?: () => void;
  initialMode?: 'signin' | 'signup' | 'location';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onProfileUpdated,
  onSignedOut,
}) => {
  const [displayName, setDisplayName] = useState(
    currentUserProfile?.displayName || 'Engr. Sohanur Rahman (Demo Planner)'
  );
  const [role, setRole] = useState<'planner' | 'emergency_officer' | 'researcher' | 'citizen'>(
    (currentUserProfile?.role as any) || 'planner'
  );

  // Location dropdown hierarchy
  const [selectedDivision, setSelectedDivision] = useState<string>(
    currentUserProfile?.division || DEFAULT_BANGLADESH_LOCATION.division
  );
  const [selectedZilla, setSelectedZilla] = useState<string>(
    currentUserProfile?.zilla || DEFAULT_BANGLADESH_LOCATION.zilla
  );
  const [selectedUpazila, setSelectedUpazila] = useState<string>(
    currentUserProfile?.upazila || DEFAULT_BANGLADESH_LOCATION.name
  );

  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync state if profile changes
  useEffect(() => {
    if (currentUserProfile) {
      setDisplayName(currentUserProfile.displayName || 'Demo Officer');
      setSelectedDivision(currentUserProfile.division || DEFAULT_BANGLADESH_LOCATION.division);
      setSelectedZilla(currentUserProfile.zilla || DEFAULT_BANGLADESH_LOCATION.zilla);
      setSelectedUpazila(currentUserProfile.upazila || DEFAULT_BANGLADESH_LOCATION.name);
      setRole((currentUserProfile.role as any) || 'planner');
    }
  }, [currentUserProfile, isOpen]);

  if (!isOpen) return null;

  // Handle division change
  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division);
    const zillas = getZillasByDivision(division);
    if (zillas.length > 0) {
      setSelectedZilla(zillas[0]);
      const upazilas = getUpazilasByZilla(division, zillas[0]);
      if (upazilas.length > 0) {
        setSelectedUpazila(upazilas[0].name);
      }
    }
  };

  // Handle zilla change
  const handleZillaChange = (zilla: string) => {
    setSelectedZilla(zilla);
    const correctDiv = getDivisionForZilla(zilla);
    if (correctDiv && correctDiv !== selectedDivision) {
      setSelectedDivision(correctDiv);
    }
    const upazilas = getUpazilasByZilla(correctDiv, zilla);
    if (upazilas.length > 0) {
      setSelectedUpazila(upazilas[0].name);
    }
  };

  // GPS Locate
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setFeedbackMsg('GPS geolocation is not supported in this browser.');
      return;
    }
    setIsGpsLocating(true);
    setFeedbackMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLocating(false);
        const { upazila, distanceKm } = findNearestUpazila(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setSelectedDivision(upazila.division);
        setSelectedZilla(upazila.zilla);
        setSelectedUpazila(upazila.name);
        setFeedbackMsg(`GPS identified nearest Upazila: ${upazila.name} (~${distanceKm} km)`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      },
      (err) => {
        setIsGpsLocating(false);
        setFeedbackMsg('GPS permission denied or unavailable. Using manual selection.');
        setTimeout(() => setFeedbackMsg(null), 4000);
      },
      { timeout: 7000 }
    );
  };

  const handleApplyProfile = async () => {
    const loc = getLocationDetails(selectedDivision, selectedZilla, selectedUpazila) || DEFAULT_BANGLADESH_LOCATION;
    const updatedProfile: UserProfile = {
      uid: currentUserProfile?.uid || 'demo-officer-session',
      email: currentUserProfile?.email || 'officer@nagarshield.gov.bd',
      displayName: displayName.trim() || currentUserProfile?.displayName || 'Officer',
      photoURL: currentUserProfile?.photoURL,
      division: selectedDivision,
      zilla: selectedZilla,
      upazila: selectedUpazila,
      locationName: `${loc.name}, ${loc.zilla}, ${loc.division}`,
      lat: loc.lat,
      lon: loc.lon,
      role: role as any,
    };

    try {
      if (currentUserProfile?.uid && !currentUserProfile.uid.startsWith('demo-')) {
        await saveUserProfile(updatedProfile);
      }
    } catch (e) {
      console.warn('Profile save note:', e);
    }

    onProfileUpdated(updatedProfile);
    onClose();
  };

  const handleResetToDefault = () => {
    setDisplayName(currentUserProfile?.displayName || 'Engr. Sohanur Rahman');
    setRole((currentUserProfile?.role as any) || 'planner');
    setSelectedDivision('Dhaka');
    setSelectedZilla('Dhaka');
    setSelectedUpazila('Mirpur');
    setFeedbackMsg('Location reset to Mirpur, Dhaka (Default Jurisdiction).');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const divisions = getAllDivisions();
  const availableZillas = getZillasByDivision(selectedDivision);
  const availableUpazilas = getUpazilasByZilla(selectedDivision, selectedZilla);

  const roles = [
    {
      id: 'planner',
      title: 'Urban Mobility Planner',
      icon: Building2,
      desc: 'Corridor capacity upgrades, signal offsets, stormwater culverts, and capital resilience modeling.',
      color: 'border-sky-500 bg-sky-50/50 text-sky-900',
      badge: 'Analytical Lead',
    },
    {
      id: 'emergency_officer',
      title: 'Emergency Response Dispatcher',
      icon: ShieldAlert,
      desc: 'Hospital trauma access routes, fire station clearance, and dynamic monsoon flood detours.',
      color: 'border-rose-500 bg-rose-50/50 text-rose-900',
      badge: 'Life-Safety Ops',
    },
    {
      id: 'researcher',
      title: 'Resilience & Climate Specialist',
      icon: Waves,
      desc: 'Compound heat island metrics, drainage surcharge calculations, and hazard risk maps.',
      color: 'border-indigo-500 bg-indigo-50/50 text-indigo-900',
      badge: 'Hydrology & GIS',
    },
    {
      id: 'citizen',
      title: 'Climate Commuter / Citizen',
      icon: Compass,
      desc: 'Shaded walking pathways, safe departure time windows, and thermal comfort guidance.',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
      badge: 'Public Guidance',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Municipal Demo Account Profile</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/40">
                  DEMO MODE • FULL ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized simulation session. No signup or password required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Feedback notice */}
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Demo Identity Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Demo Officer Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Officer / Specialist Name"
                  className="font-bold text-sm text-slate-900 bg-transparent border-b border-slate-300 hover:border-slate-500 focus:border-sky-600 focus:outline-hidden py-0.5"
                />
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  demo.planner@nagarshield.gov.bd
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefault}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset to default demo account"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Role Persona Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Select Demo Operating Persona
              </label>
              <span className="text-[11px] text-slate-500">Adapts AI suggestions and tool views</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roles.map((r) => {
                const isSelected = role === r.id;
                const IconComp = r.icon;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id as any)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? `${r.color} shadow-sm ring-1 ring-sky-500`
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4 text-slate-800" />
                          <span className="font-extrabold text-xs text-slate-900">{r.title}</span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{r.desc}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-500">Focus Area:</span>
                      <span className="font-bold text-slate-700">{r.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jurisdiction Selector */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                Active Bangladesh Jurisdiction
              </label>

              <button
                onClick={handleGpsDetect}
                disabled={isGpsLocating}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 text-sky-600 ${isGpsLocating ? 'animate-spin' : ''}`} />
                <span>{isGpsLocating ? 'Locating...' : 'Use My Live GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Division */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  1. Division
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {div} Division
                    </option>
                  ))}
                </select>
              </div>

              {/* Zilla / District */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  2. District (Zilla)
                </label>
                <select
                  value={selectedZilla}
                  onChange={(e) => handleZillaChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {availableZillas.map((zil) => (
                    <option key={zil} value={zil}>
                      {zil}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  3. Upazila / Metro Thana ({availableUpazilas.length} available)
                </label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {availableUpazilas.map((upa) => (
                    <option key={upa.name} value={upa.name}>
                      {upa.name} ({upa.elevationM}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Configured for <strong>{selectedUpazila}</strong>, {selectedZilla} District, {selectedDivision} Division.
              </span>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            {onSignedOut && (
              <button
                type="button"
                onClick={() => {
                  onSignedOut();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800/60 transition cursor-pointer"
                title="Sign out from session"
              >
                <span>Sign Out</span>
              </button>
            )}
          </div>

          <button
            onClick={handleApplyProfile}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition shadow-md shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Persona & Jurisdiction</span>
          </button>
        </div>

      </div>
    </div>
  );
};
