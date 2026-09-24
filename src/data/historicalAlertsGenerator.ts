/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LiveWeatherData } from '../types';
import { UpazilaLocation } from './bangladeshLocations';

export interface HistoricalAlertEvent {
  id: string;
  category: 'FLOOD' | 'HEATWAVE' | 'STORM' | 'WIND' | 'AIR_QUALITY';
  level: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  title: string;
  description: string;
  time: string;
  metricTrigger: string;
}

export interface HistoricalAlertDay {
  date: string; // e.g. "Sep 16"
  dayName: string; // e.g. "Wed"
  fullDate: string; // e.g. "2026-09-16"
  isToday: boolean;
  totalAlerts: number;
  flood: number;
  heatwave: number;
  storm: number;
  wind: number;
  airQuality: number;
  critical: number;
  warning: number;
  advisory: number;
  peakSeverity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'NORMAL';
  events: HistoricalAlertEvent[];
}

export interface HistoricalAlertsSummary {
  locationName: string;
  zillaName: string;
  divisionName: string;
  terrainType: string;
  totalAlerts7Days: number;
  criticalCount: number;
  warningCount: number;
  advisoryCount: number;
  categoryTotals: {
    flood: number;
    heatwave: number;
    storm: number;
    wind: number;
    airQuality: number;
  };
  mostFrequentCategory: 'FLOOD' | 'HEATWAVE' | 'STORM' | 'WIND' | 'AIR_QUALITY';
  mostFrequentCategoryPercentage: number;
  peakDay: {
    date: string;
    dayName: string;
    count: number;
  };
  trendDescription: string;
  history: HistoricalAlertDay[];
}

/**
 * Deterministic pseudo-random number generator seeded with a string
 */
function createSeededRandom(seedStr: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h >>> 0) % 10000) / 10000;
  };
}

/**
 * Generate 7-day historical extreme weather alerts tailored to current location and weather
 */
export function generate7DayHistoricalAlerts(
  location?: UpazilaLocation | null,
  currentWeather?: LiveWeatherData | null,
  selectedCity?: string
): HistoricalAlertsSummary {
  const locName = location?.name || (selectedCity ? selectedCity.split(',')[0].trim() : 'Active Station');
  const zillaName = location?.zilla || (selectedCity && selectedCity.includes(',') ? selectedCity.split(',')[1].trim() : 'Bangladesh');
  const divisionName = location?.division || 'National';
  const terrainType = location?.terrainType || 'urban_delta';
  const canalOrRiver = location?.canalOrRiver || 'Local Drainage Basin';

  // Seed with location coordinates and name for determinism across re-renders
  const lat = location?.lat ?? currentWeather?.coord.lat ?? 23.81;
  const lon = location?.lon ?? currentWeather?.coord.lon ?? 90.41;
  const seedKey = `${locName}-${zillaName}-${lat.toFixed(2)}-${lon.toFixed(2)}-7day-history`;
  const rng = createSeededRandom(seedKey);

  // Determine hazard affinity based on terrain
  // Weights determine likelihood of each hazard category [flood, heatwave, storm, wind, aqi]
  let weights = {
    flood: 0.35,
    heatwave: 0.25,
    storm: 0.20,
    wind: 0.10,
    airQuality: 0.10,
  };

  switch (terrainType) {
    case 'haor_wetland': // e.g. Sylhet, Sunamganj
      weights = { flood: 0.55, storm: 0.25, wind: 0.10, heatwave: 0.05, airQuality: 0.05 };
      break;
    case 'coastal_estuary': // e.g. Chittagong, Cox's Bazar, Barishal
      weights = { flood: 0.30, storm: 0.30, wind: 0.30, heatwave: 0.05, airQuality: 0.05 };
      break;
    case 'urban_delta': // e.g. Dhaka, Mirpur
      weights = { flood: 0.35, heatwave: 0.30, storm: 0.15, wind: 0.05, airQuality: 0.15 };
      break;
    case 'alluvial_plain': // e.g. Rajshahi, Rangpur
      weights = { heatwave: 0.45, storm: 0.25, flood: 0.15, wind: 0.10, airQuality: 0.05 };
      break;
    case 'hilly_tract': // e.g. Chittagong Hill Tracts
      weights = { flood: 0.45, storm: 0.30, wind: 0.15, heatwave: 0.05, airQuality: 0.05 };
      break;
  }

  // Base date calculation: today is local reference date
  const now = currentWeather?.observedAt ? new Date(currentWeather.observedAt) : new Date();
  
  const history: HistoricalAlertDay[] = [];
  const categoryTotals = {
    flood: 0,
    heatwave: 0,
    storm: 0,
    wind: 0,
    airQuality: 0,
  };
  let totalCritical = 0;
  let totalWarning = 0;
  let totalAdvisory = 0;

  // Generate 7 days (day 0 is 6 days ago, day 6 is Today)
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateFormatted = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = dayDate.toISOString().split('T')[0];
    const isToday = i === 0;

    const dayRng = rng();
    // Daily alert count ranges from 0 to 4 based on hazard intensity and day
    let alertCount = 0;
    
    // Wave pattern to make a realistic weather event cluster across days 2-4
    const isWavePeak = i === 2 || i === 3;
    if (isWavePeak) {
      alertCount = Math.floor(dayRng * 3) + 2; // 2 to 4 alerts on storm/heat peak day
    } else {
      alertCount = Math.floor(dayRng * 2.5); // 0 to 2 alerts on regular days
    }

    // For today, adjust based on live weather readings
    if (isToday && currentWeather) {
      const hasLiveRain = currentWeather.rain1hMm > 2 || (currentWeather.weatherCondition || '').toLowerCase().includes('rain');
      const hasLiveHeat = currentWeather.feelsLikeC > 36;
      const hasLiveStorm = (currentWeather.weatherCondition || '').toLowerCase().includes('thunder');
      if (hasLiveRain || hasLiveHeat || hasLiveStorm) {
        alertCount = Math.max(alertCount, 2);
      }
      if (currentWeather.alerts && currentWeather.alerts.length > 0) {
        alertCount = Math.max(alertCount, currentWeather.alerts.length);
      }
    }

    const events: HistoricalAlertEvent[] = [];
    let floodCount = 0;
    let heatwaveCount = 0;
    let stormCount = 0;
    let windCount = 0;
    let aqiCount = 0;
    let critCount = 0;
    let warnCount = 0;
    let advCount = 0;

    for (let a = 0; a < alertCount; a++) {
      const catRoll = rng();
      let category: 'FLOOD' | 'HEATWAVE' | 'STORM' | 'WIND' | 'AIR_QUALITY' = 'FLOOD';
      
      const floodThresh = weights.flood;
      const heatThresh = floodThresh + weights.heatwave;
      const stormThresh = heatThresh + weights.storm;
      const windThresh = stormThresh + weights.wind;

      if (catRoll < floodThresh) category = 'FLOOD';
      else if (catRoll < heatThresh) category = 'HEATWAVE';
      else if (catRoll < stormThresh) category = 'STORM';
      else if (catRoll < windThresh) category = 'WIND';
      else category = 'AIR_QUALITY';

      // Severity level roll
      const sevRoll = rng();
      let level: 'CRITICAL' | 'WARNING' | 'ADVISORY' = 'ADVISORY';
      if (sevRoll > 0.65) level = 'CRITICAL';
      else if (sevRoll > 0.3) level = 'WARNING';
      else level = 'ADVISORY';

      if (level === 'CRITICAL') critCount++;
      else if (level === 'WARNING') warnCount++;
      else advCount++;

      // Time stamp between 06:00 and 21:00
      const hour = Math.floor(rng() * 15) + 6;
      const min = Math.floor(rng() * 4) * 15;
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      // Construct realistic contextual alert title and metrics based on location
      let title = '';
      let description = '';
      let metricTrigger = '';

      switch (category) {
        case 'FLOOD':
          floodCount++;
          categoryTotals.flood++;
          metricTrigger = `Precipitation ${Math.round(rng() * 35 + 25)} mm/h • Canal capacity exceeded`;
          title = level === 'CRITICAL' ? `Severe Waterlogging & Basin Surcharge` : `Drainage Culvert Overflow Advisory`;
          description = `Heavy precipitation along ${canalOrRiver} basin in ${locName} caused storm culverts to operate past safe clearance levels.`;
          break;
        case 'HEATWAVE':
          heatwaveCount++;
          categoryTotals.heatwave++;
          metricTrigger = `Apparent Heat Index ${Math.round((rng() * 6 + 39) * 10) / 10}°C • Solar UV 9.8`;
          title = level === 'CRITICAL' ? `Severe Thermal Exhaustion Warning` : `Elevated Urban Heat Island Alert`;
          description = `Extreme radiant heat across paved corridors of ${locName}. Critical warning for outdoor workers and unshaded transport links.`;
          break;
        case 'STORM':
          stormCount++;
          categoryTotals.storm++;
          metricTrigger = `Cloud-to-Ground Lightning Rate 18 strikes/min • Radar reflectivity 52 dBZ`;
          title = level === 'CRITICAL' ? `Severe Convective Squall & Lightning` : `Localized Nor'wester Thunderstorm Warning`;
          description = `Rapid convective cloud development over ${locName} producing frequent lightning strikes and sudden localized downpours.`;
          break;
        case 'WIND':
          windCount++;
          categoryTotals.wind++;
          metricTrigger = `Sustained wind 48 km/h • Peak gusts ${Math.round(rng() * 25 + 60)} km/h`;
          title = level === 'CRITICAL' ? `Gale-Force Squall & Debris Risk` : `High Wind Gust Advisory`;
          description = `Strong wind shear affecting overhead utility lines and vulnerable transit canopies in ${locName}.`;
          break;
        case 'AIR_QUALITY':
          aqiCount++;
          categoryTotals.airQuality++;
          metricTrigger = `PM2.5 ${Math.round(rng() * 80 + 130)} µg/m³ • AQI Category Very Unhealthy`;
          title = level === 'CRITICAL' ? `Hazardous Particulate Inversion Spike` : `Air Stagnation & Dust Advisory`;
          description = `Atmospheric inversion trapped vehicular exhaust and particulate matter across ${locName}'s main arterial intersections.`;
          break;
      }

      events.push({
        id: `hist-alert-${i}-${a}-${category.toLowerCase()}`,
        category,
        level,
        title,
        description,
        time: timeStr,
        metricTrigger,
      });
    }

    totalCritical += critCount;
    totalWarning += warnCount;
    totalAdvisory += advCount;

    let peakSeverity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'NORMAL' = 'NORMAL';
    if (critCount > 0) peakSeverity = 'CRITICAL';
    else if (warnCount > 0) peakSeverity = 'WARNING';
    else if (advCount > 0) peakSeverity = 'ADVISORY';

    history.push({
      date: dateFormatted,
      dayName,
      fullDate,
      isToday,
      totalAlerts: alertCount,
      flood: floodCount,
      heatwave: heatwaveCount,
      storm: stormCount,
      wind: windCount,
      airQuality: aqiCount,
      critical: critCount,
      warning: warnCount,
      advisory: advCount,
      peakSeverity,
      events,
    });
  }

  const totalAlerts7Days = history.reduce((sum, d) => sum + d.totalAlerts, 0);

  // Find most frequent category
  let mostFrequentCategory: 'FLOOD' | 'HEATWAVE' | 'STORM' | 'WIND' | 'AIR_QUALITY' = 'FLOOD';
  let maxCount = -1;
  (Object.keys(categoryTotals) as (keyof typeof categoryTotals)[]).forEach((cat) => {
    const uppercaseCat = cat === 'airQuality' ? 'AIR_QUALITY' : (cat.toUpperCase() as any);
    if (categoryTotals[cat] > maxCount) {
      maxCount = categoryTotals[cat];
      mostFrequentCategory = uppercaseCat;
    }
  });

  const mostFrequentCategoryPercentage = totalAlerts7Days > 0 ? Math.round((maxCount / totalAlerts7Days) * 100) : 0;

  // Find peak day
  let peakDay = { date: history[0]?.date || 'N/A', dayName: history[0]?.dayName || 'N/A', count: 0 };
  history.forEach((d) => {
    if (d.totalAlerts > peakDay.count) {
      peakDay = { date: d.date, dayName: d.dayName, count: d.totalAlerts };
    }
  });

  // Descriptive trend note
  let trendDescription = '';
  if (mostFrequentCategory === 'FLOOD') {
    trendDescription = `Monsoon drainage surcharge along ${canalOrRiver} drove ${mostFrequentCategoryPercentage}% of recorded extreme warnings in ${locName}.`;
  } else if (mostFrequentCategory === 'HEATWAVE') {
    trendDescription = `Persistent solar radiation and lack of urban canopy accounted for ${mostFrequentCategoryPercentage}% of alert issuances in ${locName}.`;
  } else if (mostFrequentCategory === 'STORM' || mostFrequentCategory === 'WIND') {
    trendDescription = `Convective atmospheric instability and cyclonic depressions dominated ${locName}'s 7-day weather profile.`;
  } else {
    trendDescription = `Particulate concentration spikes and temperature inversions led atmospheric advisories in ${locName}.`;
  }

  return {
    locationName: locName,
    zillaName,
    divisionName,
    terrainType,
    totalAlerts7Days,
    criticalCount: totalCritical,
    warningCount: totalWarning,
    advisoryCount: totalAdvisory,
    categoryTotals,
    mostFrequentCategory,
    mostFrequentCategoryPercentage,
    peakDay,
    trendDescription,
    history,
  };
}
