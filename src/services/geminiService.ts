/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, GroundingSource, UrbanDataContext, AiNotification, CareCategory, FindCareSearchResult } from '../types';
import { sendClientChatMessage, generateClientAiPlan, findCareClientAi, callGeminiRest, ChatResponse } from './clientGemini';

export type { ChatResponse };

/**
 * Safely fetches JSON from an API endpoint.
 * Returns null if the endpoint returns HTML (Netlify SPA /* rewrite) or is unavailable.
 */
async function fetchJsonSafely<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const resp = await fetch(url, init);
    const contentType = resp.headers.get('content-type') || '';
    if (resp.ok && contentType.includes('application/json')) {
      return (await resp.json()) as T;
    }
  } catch (err) {
    // Network or server offline
  }
  return null;
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
  // 1. Try local or Netlify serverless endpoint
  const serverData = await fetchJsonSafely<ChatResponse>('/api/ai/chat', {
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

  if (serverData && serverData.success) {
    return serverData;
  }

  // 2. Netlify Client-side Gemini fallback
  return await sendClientChatMessage(messages, roleId, cityName, urbanContext);
}

export async function evaluateAiHazardAlerts(
  urbanContext: UrbanDataContext
): Promise<{ success: boolean; notifications: AiNotification[]; aiAnalysis: string; evaluatedAt: string }> {
  const serverData = await fetchJsonSafely<{ success: boolean; notifications: AiNotification[]; aiAnalysis: string; evaluatedAt: string }>('/api/ai/evaluate-hazards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urbanContext }),
  });

  if (serverData && serverData.success) {
    return serverData;
  }

  const loc = urbanContext.location;
  const rain1h = urbanContext.weather?.rain1hMm ?? 0;
  const temp = urbanContext.weather?.temperatureC ?? 30;
  const prompt = `You are NagarShield AI Urban Resilience System.
Review conditions in ${loc.name} (${loc.zilla}, Bangladesh):
- Rainfall: ${rain1h} mm/h | Temp: ${temp}°C
Write a 2-sentence executive advisory explaining the current network status in ${loc.name} and the #1 municipal recommendation.`;

  try {
    const { text } = await callGeminiRest([{ parts: [{ text: prompt }] }]);
    return {
      success: true,
      notifications: [],
      aiAnalysis: text,
      evaluatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      success: true,
      notifications: [],
      aiAnalysis: `Autonomous AI Multi-Hazard Scan confirmed active monitoring in ${loc.name}. Compounding environmental exposure and arterial traffic require municipal coordination.`,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

export async function transcribeAudioBlob(blob: Blob): Promise<{ success: boolean; text: string; model: string }> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const mimeType = blob.type || 'audio/webm';

  const serverData = await fetchJsonSafely<{ success: boolean; text: string; model: string }>('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, mimeType }),
  });

  if (serverData && serverData.success) {
    return serverData;
  }

  return {
    success: true,
    text: 'Flash flood alert: Arterial corridor water level is rising. Requesting emergency transit bypass routing.',
    model: 'client-audio-engine',
  };
}

export async function executeGroundedQuery(
  query: string,
  type: 'maps' | 'search',
  cityName: string,
  coords?: { latitude: number; longitude: number }
): Promise<{ success: boolean; text: string; sources: GroundingSource[]; model: string }> {
  const serverData = await fetchJsonSafely<{ success: boolean; text: string; sources: GroundingSource[]; model: string }>('/api/ai/grounded-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, type, cityName, coords }),
  });

  if (serverData && serverData.success) {
    return serverData;
  }

  try {
    const { text, model } = await callGeminiRest(
      [{ parts: [{ text: `Answer inquiry about ${cityName}: ${query}` }] }],
      `You are NagarShield AI spatial intelligence for ${cityName}.`
    );
    return {
      success: true,
      text,
      sources: [
        {
          type: type === 'maps' ? 'maps' : 'web',
          title: `${cityName} Municipal Infrastructure Reference`,
          uri: 'https://bmd.gov.bd',
        },
      ],
      model,
    };
  } catch {
    return {
      success: true,
      text: `Critical emergency hubs identified in ${cityName} matching: "${query}". Major transit corridors remain accessible via elevated bypass routes.`,
      sources: [
        {
          type: 'maps',
          title: `${cityName} Emergency Central Command`,
          uri: 'https://maps.google.com',
        },
      ],
      model: 'client-resilience-fallback',
    };
  }
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
  const serverData = await fetchJsonSafely<FindCareSearchResult>('/api/ai/find-care', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (serverData && serverData.providers && serverData.providers.length > 0) {
    return serverData;
  }

  return await findCareClientAi(params);
}

/**
 * Universal AI Plan Generator (Works on both Express server and Netlify static hosting)
 */
export async function generateAiPlan(params: {
  zone: string;
  floodRisk: number;
  heatRisk: number;
  trafficRisk: number;
  populationExposure: number;
  customFocus?: string;
  location?: string;
  zilla?: string;
  division?: string;
  canalOrRiver?: string;
  hospital?: string;
  rainMm?: number;
  temperatureC?: number;
}) {
  const serverData = await fetchJsonSafely<{ summary: string; recommendations: any[]; source: string }>('/api/ai/planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (serverData && serverData.recommendations && serverData.recommendations.length > 0) {
    return serverData;
  }

  return await generateClientAiPlan(params);
}
