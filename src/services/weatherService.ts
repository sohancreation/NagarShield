/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LiveWeatherData, WeatherForecastData } from '../types';

export async function fetchLiveWeather(
  city: string,
  lat?: number,
  lon?: number
): Promise<LiveWeatherData> {
  let url = `/api/weather/current?city=${encodeURIComponent(city)}`;
  if (typeof lat === 'number' && typeof lon === 'number') {
    url += `&lat=${lat}&lon=${lon}`;
  }
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Weather fetch failed: ${resp.statusText}`);
  }
  return resp.json();
}

export async function fetchWeatherForecast(
  city: string,
  lat?: number,
  lon?: number
): Promise<WeatherForecastData> {
  let url = `/api/weather/forecast?city=${encodeURIComponent(city)}`;
  if (typeof lat === 'number' && typeof lon === 'number') {
    url += `&lat=${lat}&lon=${lon}`;
  }
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Forecast fetch failed: ${resp.statusText}`);
  }
  return resp.json();
}
