/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, GroundingSource, UrbanDataContext, AiNotification, CareCategory, FindCareSearchResult } from '../types';

export interface ChatResponse {
  success: boolean;
  role: 'model';
  content: string;
  model: string;
  groundingType: 'none' | 'search' | 'maps';
  sources?: GroundingSource[];
  error?: string;
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  model: 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview' = 'gemini-3.5-flash',
  roleId: string = 'resilience_specialist',
  grounding: 'none' | 'search' | 'maps' = 'none',
  cityName: string = 'Dhaka Metropolitan Basin',
  userLocation?: { latitude: number; longitude: number },
  urbanContext?: UrbanDataContext
): Promise<ChatResponse> {
  const resp = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model,
      roleId,
      grounding,
      cityName,
      userLocation,
      urbanContext,
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Chat request failed with status ${resp.status}`);
  }

  return await resp.json();
}

export async function evaluateAiHazardAlerts(
  urbanContext: UrbanDataContext
): Promise<{ success: boolean; notifications: AiNotification[]; aiAnalysis: string; evaluatedAt: string }> {
  const resp = await fetch('/api/ai/evaluate-hazards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urbanContext,
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Hazard evaluation failed with status ${resp.status}`);
  }

  return await resp.json();
}


export async function transcribeAudioBlob(blob: Blob): Promise<{ success: boolean; text: string; model: string }> {
  // Convert Blob to Base64
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const mimeType = blob.type || 'audio/webm';

  const resp = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64: base64,
      mimeType,
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Transcription failed with status ${resp.status}`);
  }

  return await resp.json();
}

export async function executeGroundedQuery(
  query: string,
  type: 'maps' | 'search',
  cityName: string,
  coords?: { latitude: number; longitude: number }
): Promise<{ success: boolean; text: string; sources: GroundingSource[]; model: string }> {
  const resp = await fetch('/api/ai/grounded-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      type,
      cityName,
      coords,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Grounded query failed with status ${resp.status}`);
  }

  return await resp.json();
}

export async function findCareWithAi(params: {
  query: string;
  category?: CareCategory;
  location: {
    name: string;
    zilla: string;
    division: string;
    lat: number;
    lon: number;
    canalOrRiver?: string;
  };
  radiusKm?: number;
  emergencyOnly?: boolean;
  openNow?: boolean;
}): Promise<FindCareSearchResult> {
  const resp = await fetch('/api/ai/find-care', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Find Care request failed with status ${resp.status}`);
  }

  return await resp.json();
}
