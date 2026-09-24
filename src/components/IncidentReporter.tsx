/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Waves,
  Zap,
  TreeDeciduous,
  CircleDot,
  Flame,
  Car,
  MapPin,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Plus,
  Filter,
  Camera,
  ArrowLeft,
  Navigation,
  ShieldCheck,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import { IncidentReport, IncidentType, IncidentSeverity, IncidentStatus } from '../types/incident';
import { UpazilaLocation } from '../data/bangladeshLocations';
import { UserProfile } from '../services/firebase';
import { createIncidentReport, toggleIncidentUpvote, updateIncidentStatus } from '../services/incidentService';
import { useLanguage } from '../context/LanguageContext';

interface IncidentReporterProps {
  incidents: IncidentReport[];
  activeLocation: UpazilaLocation;
  userProfile: UserProfile | null;
  onSelectIncidentLocation?: (incident: IncidentReport) => void;
  onBack: () => void;
  onRefresh?: () => void;
}

const TYPE_CONFIG: Record<
  IncidentType,
  { label: string; labelBn: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  waterlogging: {
    label: 'Waterlogging / Flood',
    labelBn: 'জলাবদ্ধতা / প্লাবন',
    icon: Waves,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  },
  electrical_wire: {
    label: 'Electrical Cable Hazard',
    labelBn: 'বিদ্যুতের খোলা তার / ঝুঁকি',
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  fallen_tree: {
    label: 'Fallen Tree / Debris',
    labelBn: 'গাছ ভেঙে রাস্তা বন্ধ',
    icon: TreeDeciduous,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  open_manhole: {
    label: 'Open Manhole / Sewer',
    labelBn: 'খোলা ম্যানহোল / ভাঙা ড্রেন',
    icon: CircleDot,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  },
  road_damage: {
    label: 'Road Caved In / Crater',
    labelBn: 'সড়ক ধস / বড় গর্ত',
    icon: AlertTriangle,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  },
  gas_leak: {
    label: 'Gas Leak / Fire Risk',
    labelBn: 'গ্যাস পাইপ ফুটো / আগুন',
    icon: Flame,
    color: 'bg-red-500/10 text-red-500 border-red-500/30',
  },
  fire_smoke: {
    label: 'Fire Outbreak / Smoke',
    labelBn: 'অগ্নিঝুঁকি / ধোঁয়া',
    icon: Flame,
    color: 'bg-red-500/10 text-red-500 border-red-500/30',
  },
  traffic_gridlock: {
    label: 'Complete Road Blockade',
    labelBn: 'সম্পূর্ণ যানজট / রাস্তা অবরুদ্ধ',
    icon: Car,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  },
  other: {
    label: 'General Municipal Hazard',
    labelBn: 'অন্যান্য পৌর সমস্যা',
    icon: AlertTriangle,
    color: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
  },
};

const PHOTO_PRESETS = [
  { id: 'waterlogged_road', label: 'Waterlogged Street', labelBn: 'পানিবন্দি সড়ক' },
  { id: 'electrical_wire', label: 'Snapped Cable', labelBn: 'ছেঁড়া বিদ্যুতের তার' },
  { id: 'open_manhole', label: 'Uncovered Manhole', labelBn: 'খোলা ম্যানহোল' },
  { id: 'fallen_tree', label: 'Fallen Tree Branch', labelBn: 'ভেঙে পড়া গাছ' },
  { id: 'road_damage', label: 'Asphalt Pothole', labelBn: 'ভাঙা পিচঢালা রাস্তা' },
];

export const IncidentReporter: React.FC<IncidentReporterProps> = ({
  incidents,
  activeLocation,
  userProfile,
  onSelectIncidentLocation,
  onBack,
}) => {
  const { t, toBnDigits, language } = useLanguage();

  const [activeFilter, setActiveFilter] = useState<'all' | IncidentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('all');
  const [onlyCurrentUpazila, setOnlyCurrentUpazila] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<IncidentType>('waterlogging');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [waterDepthCm, setWaterDepthCm] = useState<number>(25);
  const [selectedPreset, setSelectedPreset] = useState<string>('waterlogged_road');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);

  // Current user identifier for upvote toggling
  const currentUserId = userProfile?.uid || 'guest-user-session';

  // Metrics
  const activeCount = incidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const verifiedCount = incidents.filter((i) => (i.upvotes || 0) >= 10).length;

  // Filtered List
  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilter !== 'all' && inc.type !== activeFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (onlyCurrentUpazila && inc.upazila.toLowerCase() !== activeLocation.name.toLowerCase()) return false;
    return true;
  });

  const handleUpvote = async (incidentId: string) => {
    await toggleIncidentUpvote(incidentId, currentUserId);
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    await updateIncidentStatus(incidentId, newStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !landmark.trim()) return;

    setIsSubmitting(true);
    try {
      await createIncidentReport({
        type,
        severity,
        title: title.trim(),
        description: description.trim() || 'Citizen submitted live municipal hazard report via NagarShield AI.',
        division: activeLocation.division,
        zilla: activeLocation.zilla,
        upazila: activeLocation.name,
        landmark: landmark.trim(),
        lat: activeLocation.lat + (Math.random() - 0.5) * 0.006,
        lon: activeLocation.lon + (Math.random() - 0.5) * 0.006,
        waterDepthCm: type === 'waterlogging' ? waterDepthCm : undefined,
        photoPreset: selectedPreset,
        reportedBy: {
          uid: userProfile?.uid,
          name: userProfile?.displayName || 'Citizen Reporter',
          role: userProfile?.role || 'Citizen',
        },
      });

      setFormSuccessMsg('Hazard reported successfully and dispatched to local municipal emergency grid!');
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setFormSuccessMsg(null);
        setTitle('');
        setDescription('');
        setLandmark('');
      }, 1500);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${toBnDigits(Math.max(1, diffMins))} ${t('minsAgo', 'mins ago')}`;
    }
    const diffHours = Math.floor(diffMins / 60);
    return `${toBnDigits(diffHours)} ${t('hoursAgo', 'hours ago')}`;
  };

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
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>{t('hazardReporterTitle', 'Citizen Hazard & Incident Reporter')}</span>
              </h1>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                {t('live', 'LIVE')} CROWD GRID
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {t(
                'hazardReporterSubtitle',
                'Crowdsourced municipal hazard reporting with real-time verification and emergency dispatch for Bangladesh cities'
              )}
            </p>
          </div>
        </div>

        {/* CTA: Report Hazard */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-md shadow-amber-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('reportNewHazard', 'Report Hazard')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t('activeHazards', 'Active Hazards')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {toBnDigits(activeCount)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across monitored sectors</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200/90 shadow-2xs bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-semibold">{t('criticalCount', 'Critical Urgency')}</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-700 font-mono">
            {toBnDigits(criticalCount)}
          </div>
          <p className="text-[10px] text-rose-500 mt-0.5">Impacting traffic / life safety</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/90 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">{t('verifiedByCommunity', 'Verified by Community')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono">
            {toBnDigits(verifiedCount)}
          </div>
          <p className="text-[10px] text-emerald-500 mt-0.5">≥ 10 community validations</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t('resolvedIn24h', 'Resolved (24h)')}</span>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {toBnDigits(resolvedCount)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">DNCC/DSCC emergency crews</p>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none]">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('allIncidents', 'All Hazards')}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('waterlogging')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              activeFilter === 'waterlogging'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-3 h-3" />
            <span>{t('waterloggingIncidents', 'Waterlogging')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('electrical_wire')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              activeFilter === 'electrical_wire'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{t('powerIncidents', 'Electrical Hazard')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fallen_tree')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              activeFilter === 'fallen_tree'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TreeDeciduous className="w-3 h-3" />
            <span>{t('roadIncidents', 'Road Obstacles')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('open_manhole')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              activeFilter === 'open_manhole'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CircleDot className="w-3 h-3" />
            <span>{t('manholeIncidents', 'Open Drain/Manhole')}</span>
          </button>
        </div>

        {/* Status & Scope Filters */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyCurrentUpazila}
              onChange={(e) => setOnlyCurrentUpazila(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <span>Only {activeLocation.name}</span>
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">Status: All</option>
            <option value="reported">Reported</option>
            <option value="investigating">Under Inspection</option>
            <option value="dispatched">Dispatched</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.map((incident) => {
          const config = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
          const Icon = config.icon;
          const hasUserUpvoted = incident.upvotedUserIds?.includes(currentUserId);

          return (
            <div
              key={incident.id}
              className={`bg-white rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between ${
                incident.severity === 'critical'
                  ? 'border-rose-300/80 shadow-xs'
                  : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Type icon + status + urgency */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {language === 'bn' ? config.labelBn : config.label}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {incident.title}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 capitalize ${
                      incident.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : incident.status === 'dispatched'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : incident.status === 'investigating'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {incident.status === 'resolved'
                      ? t('statusResolved', 'Resolved')
                      : incident.status === 'dispatched'
                      ? t('statusDispatched', 'Team Dispatched')
                      : incident.status === 'investigating'
                      ? t('statusInvestigating', 'Under Inspection')
                      : t('statusReported', 'Reported')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                  {incident.description}
                </p>

                {/* Depth gauge if waterlogging */}
                {incident.waterDepthCm !== undefined && (
                  <div className="mb-3 p-2 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('waterDepth', 'Water Depth')}:</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      ~{toBnDigits(incident.waterDepthCm)} cm (
                      {incident.waterDepthCm >= 40
                        ? t('stageWaist', 'Waist Deep')
                        : incident.waterDepthCm >= 15
                        ? t('stageKnee', 'Knee Deep')
                        : t('stageAnkle', 'Ankle Deep')}
                      )
                    </span>
                  </div>
                )}

                {/* Location Landmark */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium truncate">{incident.landmark}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                    {incident.upazila}, {incident.zilla}
                  </span>
                </div>

                {/* Photo Preview Indicator */}
                {incident.photoPreset && (
                  <div className="mb-3 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-[11px] text-slate-600">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Photo Tag: <strong>{incident.photoPreset.replace('_', ' ')}</strong></span>
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata + Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(incident.createdAt)}</span>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">{incident.reportedBy?.name || 'Citizen'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View on GIS */}
                  {onSelectIncidentLocation && (
                    <button
                      type="button"
                      onClick={() => onSelectIncidentLocation(incident)}
                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      title="View on Map"
                    >
                      <Navigation className="w-3 h-3 text-sky-600" />
                      <span>Map</span>
                    </button>
                  )}

                  {/* Upvote / Verify Button */}
                  <button
                    type="button"
                    onClick={() => handleUpvote(incident.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      hasUserUpvoted
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Verify hazard is still present"
                  >
                    <ThumbsUp className={`w-3 h-3 ${hasUserUpvoted ? 'text-white' : 'text-slate-500'}`} />
                    <span>{toBnDigits(incident.upvotes || 0)}</span>
                  </button>

                  {/* Status Toggle (Quick Responder Action) */}
                  <select
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value as any)}
                    className="p-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    title="Change status"
                  >
                    <option value="reported">Reported</option>
                    <option value="investigating">Inspecting</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Submit New Hazard Report */}
      {isSubmitModalOpen && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('reportNewHazard', 'Report Hazard')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Target: {activeLocation.name}, {activeLocation.zilla}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Incident Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hazard Classification *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      'waterlogging',
                      'electrical_wire',
                      'open_manhole',
                      'fallen_tree',
                      'road_damage',
                      'traffic_gridlock',
                    ] as IncidentType[]
                  ).map((tId) => {
                    const cfg = TYPE_CONFIG[tId];
                    const Icon = cfg.icon;
                    const isSelected = type === tId;
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setType(tId)}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 text-xs ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                        <span className="truncate">{language === 'bn' ? cfg.labelBn : cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgency / Severity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency / Risk Level *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as IncidentSeverity[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer text-center ${
                        severity === lvl
                          ? lvl === 'critical'
                            ? 'bg-rose-600 text-white'
                            : lvl === 'high'
                            ? 'bg-orange-600 text-white'
                            : lvl === 'medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hazard Summary Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Waist-deep flooding in front of City Complex"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Water Depth (if waterlogging) */}
              {type === 'waterlogging' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-900">Estimated Water Depth (cm):</span>
                    <span className="font-bold font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {waterDepthCm} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={waterDepthCm}
                    onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-600 font-mono">
                    <span>Ankle (10cm)</span>
                    <span>Knee (30cm)</span>
                    <span>Waist (60cm)</span>
                    <span>Impassable (100cm)</span>
                  </div>
                </div>
              )}

              {/* Landmark & Exact Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exact Street Address / Landmark *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Mirpur Section 10 Roundabout, East Footpath"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Observations (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe impact on vehicles, stranded pedestrians, or damaged infrastructure..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              {/* Photo Evidence Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attach Photographic Evidence</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PHOTO_PRESETS.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedPreset(photo.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                        selectedPreset === photo.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate block font-medium">
                        {language === 'bn' ? photo.labelBn : photo.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting to Grid...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('submitReport', 'Submit Incident to Responders')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
