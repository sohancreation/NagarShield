/**
 * Netlify Serverless API Handler
 * Handles /api/ai/* and /api/weather/* endpoints when hosted on Netlify
 */

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  '';

const OPENWEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY ||
  process.env.VITE_OPENWEATHER_API_KEY ||
  '';

const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

async function callGemini(contents: any[], systemInstruction?: string, generationConfig?: any) {
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload: any = { contents };
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }
      if (generationConfig) {
        payload.generationConfig = generationConfig;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return { text, model };
    } catch {
      // Try next model
    }
  }
  throw new Error('All models exhausted in Netlify function');
}

export async function handler(event: any) {
  const path = event.path || '';
  const method = event.httpMethod || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Health check
  if (path.includes('/health')) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'ok', service: 'NagarShield Netlify Serverless Engine' }),
    };
  }

  // Parse body safely for POST
  let body: any = {};
  if (method === 'POST' && event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      body = {};
    }
  }

  // 1. AI Chat
  if (path.includes('/ai/chat')) {
    try {
      const { messages = [], roleId = 'resilience_specialist', cityName = 'Dhaka' } = body;
      const sys = `You are NagarShield AI Urban Resilience Specialist for ${cityName}. Provide actionable, urgent guidance for climate and mobility hazards.`;
      const contents = messages.slice(-10).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const { text, model } = await callGemini(contents, sys);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          role: 'model',
          content: text,
          model,
          groundingType: 'none',
          sources: [],
        }),
      };
    } catch (err: any) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          role: 'model',
          content: 'Dhaka urban resilience monitoring active. Low-lying catchment underpasses should be monitored for waterlogging; utilize elevated arterial bypass corridors.',
          model: 'serverless-fallback',
          groundingType: 'none',
          sources: [],
        }),
      };
    }
  }

  // 2. AI Planner
  if (path.includes('/ai/planner')) {
    try {
      const { zone = 'Lowland Basin', floodRisk = 80, heatRisk = 75, trafficRisk = 85 } = body;
      const prompt = `Analyze urban zone: ${zone}. Flood: ${floodRisk}/100, Heat: ${heatRisk}/100, Traffic: ${trafficRisk}/100. Return JSON { "summary": "...", "recommendations": [ { "id": "rec-1", "title": "...", "category": "DRAINAGE", "priority": "URGENT", "reason": "...", "targetZone": "${zone}", "estimatedTrafficImpact": "-15 min", "estimatedResilienceGain": "+35%" } ] }`;

      const { text, model } = await callGemini(
        [{ parts: [{ text: prompt }] }],
        'Output valid JSON only.',
        { responseMimeType: 'application/json' }
      );
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ source: model, ...parsed }),
      };
    } catch {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          source: 'serverless-fallback',
          summary: 'Multi-hazard corridor assessment requires automated drainage pumping and dynamic signal priority.',
          recommendations: [
            {
              id: 'rec-1',
              title: 'Automated Culvert Silt Clearance & Dewatering',
              category: 'DRAINAGE',
              priority: 'URGENT',
              reason: 'Prevents standing water from disabling arterial traffic lanes.',
              targetZone: body.zone || 'Zone 1',
              estimatedTrafficImpact: '-18 min delay',
              estimatedResilienceGain: '+40% drainage rate',
            },
          ],
        }),
      };
    }
  }

  // 3. Weather current
  if (path.includes('/weather/current')) {
    const city = event.queryStringParameters?.city || 'Dhaka';
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.split(' ')[0] + ',BD')}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        const rain1h = data.rain ? data.rain['1h'] || 0 : 0;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            city: data.name || city,
            temperatureC: Math.round(data.main.temp),
            feelsLikeC: Math.round(data.main.feels_like),
            condition: data.weather?.[0]?.description || 'Partly Cloudy',
            humidityPercent: data.main.humidity,
            windSpeedKmh: Math.round(data.wind.speed * 3.6),
            rain1hMm: rain1h,
            drainageSurchargePercent: Math.min(100, Math.round(rain1h * 8.5 + 25)),
            updatedAt: new Date().toLocaleTimeString(),
          }),
        };
      }
    } catch {
      // Fallback
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        city,
        temperatureC: 30,
        feelsLikeC: 34,
        condition: 'Partly Cloudy',
        humidityPercent: 74,
        windSpeedKmh: 12,
        rain1hMm: 0,
        drainageSurchargePercent: 30,
        updatedAt: new Date().toLocaleTimeString(),
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status: 'active', message: 'NagarShield API router' }),
  };
}
