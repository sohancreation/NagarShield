/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Key, ShieldCheck, ExternalLink, X, Check, AlertCircle } from 'lucide-react';
import { getStoredGeminiKey, saveStoredGeminiKey } from '../services/clientGemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState(() => getStoredGeminiKey());
  const [mapsKey, setMapsKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nagarshield_user_maps_api_key');
      if (stored && stored.trim()) return stored.trim();
    }
    return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) || '';
  });
  const [isSaved, setIsSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedGemini = apiKey.trim();
    const trimmedMaps = mapsKey.trim();

    if (trimmedGemini) {
      saveStoredGeminiKey(trimmedGemini);
      if (onKeyUpdated) onKeyUpdated(trimmedGemini);
    }

    if (trimmedMaps && typeof window !== 'undefined') {
      localStorage.setItem('nagarshield_user_maps_api_key', trimmedMaps);
    }

    setIsSaved(true);
    setStatusMsg('API Keys successfully saved and applied!');
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Google Gemini API Key</h3>
              <p className="text-xs text-slate-400">Configure AI access for Netlify & browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter your Google Gemini API key to power live Copilot chat, decision planning, and clinical triage.
            Your key is stored securely in your browser's <code className="text-sky-400 bg-slate-800 px-1 py-0.5 rounded">localStorage</code>.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Gemini AI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsSaved(false);
                setStatusMsg('');
              }}
              placeholder="AQ... or AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Google Maps API Key (Optional)
            </label>
            <input
              type="password"
              value={mapsKey}
              onChange={(e) => {
                setMapsKey(e.target.value);
                setIsSaved(false);
                setStatusMsg('');
              }}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 transition font-mono"
            />
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                isSaved
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between font-medium text-slate-300">
              <span>Don't have an API key?</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline underline-offset-2"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p>
              Free keys can be created in seconds from Google AI Studio. If Google reports a key as leaked, simply create a fresh key and paste it here.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition flex items-center gap-1.5 shadow-md shadow-sky-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
