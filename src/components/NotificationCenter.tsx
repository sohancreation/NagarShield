/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Waves,
  ThermometerSun,
  TrafficCone,
  ShieldAlert,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Trash2,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { AiNotification } from '../types';
import { playAlertChime } from '../utils/soundAlerts';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AiNotification[];
  unreadCount: number;
  isScanning: boolean;
  onRunAiScan: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onAskAiAboutNotification: (notif: AiNotification) => void;
  onNavigateToSection: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  isScanning,
  onRunAiScan,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  onAskAiAboutNotification,
  onNavigateToSection,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (n.isDismissed) return false;
    if (filterMode === 'CRITICAL' && n.level !== 'CRITICAL') return false;
    if (filterMode === 'UNREAD' && n.isRead) return false;
    return true;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'ADVISORY':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-medium';
      case 'INFO':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FLOOD':
      case 'DRAINAGE':
        return <Waves className="w-3.5 h-3.5 text-sky-600" />;
      case 'HEATWAVE':
        return <ThermometerSun className="w-3.5 h-3.5 text-amber-600" />;
      case 'EMERGENCY':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'TRAFFIC':
        return <TrafficCone className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getTargetTab = (actionType?: string) => {
    switch (actionType) {
      case 'DISPATCH_EMERGENCY':
        return 'emergency';
      case 'FIND_CARE':
        return 'find-care';
      case 'VIEW_MAP':
        return 'google-map';
      case 'VIEW_ROUTES':
        return 'routes';
      case 'VIEW_WEATHER':
        return 'weather';
      case 'VIEW_PLANNER':
        return 'planner';
      case 'VIEW_HOTSPOTS':
        return 'disruption';
      default:
        return 'overview';
    }
  };

  const getTargetTabLabel = (actionType?: string) => {
    switch (actionType) {
      case 'DISPATCH_EMERGENCY':
        return 'Open Emergency Dispatcher';
      case 'FIND_CARE':
        return 'Find Care & Pharmacies';
      case 'VIEW_MAP':
        return 'Inspect on GIS Map';
      case 'VIEW_ROUTES':
        return 'Review Bypass Routes';
      case 'VIEW_WEATHER':
        return 'Check Live Weather';
      case 'VIEW_PLANNER':
        return 'View Planner Interventions';
      case 'VIEW_HOTSPOTS':
        return 'Inspect Traffic Hotspots';
      default:
        return 'View Map';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-2 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <BellRing className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">AI Hazard Warning Center</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Proactive multi-hazard telemetry & AI early warnings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Back to previous window"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Back</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              {[
                { id: 'ALL', label: `All (${notifications.length})` },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'UNREAD', label: `Unread (${unreadCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id as any)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    filterMode === f.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* AI Scan Trigger & Clean Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onRunAiScan}
                disabled={isScanning}
                className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Execute AI hazard scan on current telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">{isScanning ? 'Scanning...' : 'AI Scan'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Showing {filtered.length} alert warnings</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-slate-400 hover:text-rose-600 font-medium hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">All Clear & Monitored</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  No active warnings matching your filter. NagarShield AI continues to monitor compound climate & mobility data in the background.
                </p>
                <button
                  onClick={onRunAiScan}
                  className="mt-4 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition"
                >
                  Re-scan Telemetry Now
                </button>
              </div>
            ) : (
              filtered.map((notif) => {
                const isCritical = notif.level === 'CRITICAL';
                return (
                  <div
                    key={notif.id}
                    className={`rounded-xl border transition-all p-3.5 ${
                      !notif.isRead
                        ? isCritical
                          ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                          : 'bg-white border-sky-300 shadow-sm'
                        : 'bg-white border-slate-200 opacity-90'
                    }`}
                  >
                    {/* Notification Header */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="p-1 rounded-md bg-slate-100">
                          {getCategoryIcon(notif.category)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getLevelBadge(notif.level)}`}>
                          {notif.level}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {notif.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notif.isRead && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDismiss(notif.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Dismiss notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Body */}
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Metric Tag */}
                    {notif.metricValue && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">Observed:</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                          {notif.metricValue}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Action Recommendation Box */}
                    {notif.actionRecommendation && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-100/80 border border-slate-200/80 text-[11px] text-slate-700">
                        <div className="flex items-center gap-1 font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5">
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          AI Mitigation Countermeasure:
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          {notif.actionRecommendation}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onAskAiAboutNotification(notif);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                        title="Open AI Copilot and ask for tactical mitigation"
                      >
                        <Bot className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ask AI Copilot</span>
                      </button>

                      {notif.actionType && (
                        <button
                          onClick={() => {
                            onNavigateToSection(getTargetTab(notif.actionType));
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{getTargetTabLabel(notif.actionType)}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-white border-t border-slate-200 text-center text-[11px] text-slate-400">
            <span>Powered by NagarShield AI Decision-Support Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Interactive Toast for New Warnings
interface NotificationToastProps {
  notification: AiNotification | null;
  onDismiss: () => void;
  onReviewWithAi: (notif: AiNotification) => void;
  onNavigate: (tab: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onReviewWithAi,
  onNavigate,
}) => {
  if (!notification) return null;

  const isCritical = notification.level === 'CRITICAL';

  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-50 max-w-sm w-auto sm:w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`rounded-2xl p-4 shadow-xl border-2 backdrop-blur-md transition-all ${
          isCritical
            ? 'bg-rose-950/95 text-white border-rose-500 shadow-rose-950/40'
            : 'bg-slate-900/95 text-white border-sky-500 shadow-slate-950/40'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${isCritical ? 'bg-rose-800 text-rose-200' : 'bg-sky-800 text-sky-200'}`}>
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${isCritical ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'}`}>
                  {notification.level}
                </span>
                <span className="text-[10px] text-slate-300 font-bold">{notification.category}</span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight mt-0.5 line-clamp-1">
                {notification.title}
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-200 mt-2 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {notification.metricValue && (
          <div className="mt-2 text-[10px] font-mono font-bold text-amber-300">
            Observed: {notification.metricValue}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => onReviewWithAi(notification)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Bot className="w-3 h-3 text-sky-400" />
            <span>Consult AI</span>
          </button>

          <button
            onClick={() => {
              onNavigate(
                notification.actionType === 'DISPATCH_EMERGENCY'
                  ? 'emergency'
                  : notification.actionType === 'VIEW_WEATHER'
                  ? 'weather'
                  : notification.actionType === 'VIEW_ROUTES'
                  ? 'routes'
                  : 'overview'
              );
              onDismiss();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              isCritical ? 'bg-rose-500 hover:bg-rose-400 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
            }`}
          >
            <span>Inspect</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
