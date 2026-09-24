/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Sliders,
  Layers,
  ChevronRight,
  CheckCircle2,
  Info,
  CloudSun,
  MapPin,
  Bot,
  Mic,
  UserCheck,
  Building2,
  Radio,
  Crosshair,
  ArrowLeft,
  Train,
  Waves,
  RefreshCw,
} from 'lucide-react';
import {
  INITIAL_ROAD_SEGMENTS,
  INITIAL_ZONES,
  INITIAL_JUNCTIONS,
  EMERGENCY_FACILITIES,
  LIVE_MOBILITY_METRICS,
  CITIZEN_ROUTES,
  DEFAULT_AI_RECOMMENDATIONS,
} from './data/mockCityData';
import {
  BANGLADESH_LOCATIONS,
  DEFAULT_BANGLADESH_LOCATION,
  UpazilaLocation,
  getLocationDetails,
} from './data/bangladeshLocations';
import { getCustomizedCityData } from './data/locationAdapters';
import {
  RoadSegment,
  ResilienceWeights,
  UrbanZone,
  JunctionNode,
  LiveWeatherData,
  WeatherForecastData,
  AiNotification,
  UrbanDataContext,
  EmergencyFacility,
  RouteOption,
  LiveMobilityData,
} from './types';
import { fetchLiveWeather, fetchWeatherForecast } from './services/weatherService';
import { auth, fetchUserProfile, saveUserProfile, UserProfile, logOut } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { evaluateAiHazardAlerts } from './services/geminiService';
import { playAlertChime, speakAlertWarning } from './utils/soundAlerts';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthModal } from './components/AuthModal';
import { NotificationCenter, NotificationToast } from './components/NotificationCenter';
import { ThreePillarCards } from './components/ThreePillarCards';
import { GisRiskMap } from './components/GisRiskMap';
import { MobilityDisruptionHotspots } from './components/MobilityDisruptionHotspots';
import { EmergencyRouteMode } from './components/EmergencyRouteMode';
import { ClimateRouteAnalysis } from './components/ClimateRouteAnalysis';
import { PlannerTrafficDashboard } from './components/PlannerTrafficDashboard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { WeightsModal } from './components/WeightsModal';
import { WeatherMonitoring } from './components/WeatherMonitoring';
import { GeminiChatbot } from './components/GeminiChatbot';
import { GoogleMapLocator } from './components/GoogleMapLocator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FindCareDashboard } from './components/FindCareDashboard';
import { AuthLandingPage } from './components/AuthLandingPage';
import { IncidentReporter } from './components/IncidentReporter';
import { DhakaMetroTracker } from './components/DhakaMetroTracker';
import { WaterloggingMonitor } from './components/WaterloggingMonitor';
import { AdminPanel } from './components/AdminPanel';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { IncidentReport } from './types/incident';
import { subscribeToIncidents, DEFAULT_BANGLADESH_INCIDENTS } from './services/incidentService';

const DEFAULT_DEMO_USER_PROFILE: UserProfile = {
  uid: 'demo-officer-session',
  email: 'demo.planner@nagarshield.gov.bd',
  displayName: 'Engr. Sohanur Rahman (Demo Planner)',
  photoURL: undefined,
  division: DEFAULT_BANGLADESH_LOCATION.division,
  zilla: DEFAULT_BANGLADESH_LOCATION.zilla,
  upazila: DEFAULT_BANGLADESH_LOCATION.name,
  locationName: `${DEFAULT_BANGLADESH_LOCATION.name}, ${DEFAULT_BANGLADESH_LOCATION.zilla}, ${DEFAULT_BANGLADESH_LOCATION.division}`,
  lat: DEFAULT_BANGLADESH_LOCATION.lat,
  lon: DEFAULT_BANGLADESH_LOCATION.lon,
  role: 'planner',
};

function AppContent() {
  const { theme, isNight, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overviewMapMode, setOverviewMapMode] = useState<'google-map' | 'schematic'>('google-map');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // User Authentication State: The application lands first on SignIn / SignUp page.
  // After sign in, the user can access and use the platform.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nagarshield_session_active') === 'true';
  });

  // Active Bangladesh Location & User Profile State
  const [activeLocation, setActiveLocation] = useState<UpazilaLocation>(() => {
    const saved = localStorage.getItem('nagarshield_saved_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loc = getLocationDetails(parsed.division, parsed.zilla, parsed.upazila);
        if (loc) return loc;
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_BANGLADESH_LOCATION;
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const saved = localStorage.getItem('nagarshield_saved_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.upazila && parsed.zilla) {
          return `${parsed.upazila}, ${parsed.zilla}`;
        }
      } catch (e) {
        // ignore
      }
    }
    return `${DEFAULT_BANGLADESH_LOCATION.name}, ${DEFAULT_BANGLADESH_LOCATION.zilla}`;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nagarshield_saved_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_DEMO_USER_PROFILE;
  });

  // Auth & Location Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup' | 'location'>('location');

  // Dynamic Geographic & Infrastructure Data (Customized based on Bangladesh Upazila & Live Weather)
  const [roads, setRoads] = useState<RoadSegment[]>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).roads);
  const [zones, setZones] = useState<UrbanZone[]>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).zones);
  const [junctions, setJunctions] = useState<JunctionNode[]>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).junctions);
  const [facilities, setFacilities] = useState<EmergencyFacility[]>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).facilities);
  const [activeRoutes, setActiveRoutes] = useState<RouteOption[]>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).routes);
  const [mobilityMetrics, setMobilityMetrics] = useState<LiveMobilityData>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).mobilityMetrics);

  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(() => getCustomizedCityData(DEFAULT_BANGLADESH_LOCATION, null).roads[0]);
  const [activeHighlightedRoute, setActiveHighlightedRoute] = useState<string | null>(null);

  const [resilienceWeights, setResilienceWeights] = useState<ResilienceWeights>({
    floodRisk: 30,
    heatRisk: 25,
    trafficRisk: 25,
    populationExposure: 10,
    infrastructure: 10,
  });

  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState<boolean>(false);

  // Real-time Weather State
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecastData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Real-time Crowdsourced Hazard Incidents State (Firestore persistence)
  const [incidents, setIncidents] = useState<IncidentReport[]>(DEFAULT_BANGLADESH_INCIDENTS);

  useEffect(() => {
    const unsubscribeIncidents = subscribeToIncidents((updated) => {
      setIncidents(updated);
    });
    return () => unsubscribeIncidents();
  }, []);

  // 1. Firebase Auth Listener: Load User Profile and Registered Bangladesh Location from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('nagarshield_session_active', 'true');
        try {
          const profile = await fetchUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            localStorage.setItem('nagarshield_saved_profile', JSON.stringify(profile));
            const loc = getLocationDetails(profile.division, profile.zilla, profile.upazila);
            if (loc) {
              setActiveLocation(loc);
              setSelectedCity(`${loc.name}, ${loc.zilla}`);
            }
          } else {
            // New user without profile saved yet
            const defaultProf: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'NagarShield User',
              photoURL: user.photoURL || undefined,
              division: DEFAULT_BANGLADESH_LOCATION.division,
              zilla: DEFAULT_BANGLADESH_LOCATION.zilla,
              upazila: DEFAULT_BANGLADESH_LOCATION.name,
              locationName: `${DEFAULT_BANGLADESH_LOCATION.name}, ${DEFAULT_BANGLADESH_LOCATION.zilla}, ${DEFAULT_BANGLADESH_LOCATION.division}`,
              lat: DEFAULT_BANGLADESH_LOCATION.lat,
              lon: DEFAULT_BANGLADESH_LOCATION.lon,
              role: 'citizen',
            };
            setUserProfile(defaultProf);
            localStorage.setItem('nagarshield_saved_profile', JSON.stringify(defaultProf));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        const activeLocal = localStorage.getItem('nagarshield_session_active') === 'true';
        if (!activeLocal) {
          setIsAuthenticated(false);
          setUserProfile(DEFAULT_DEMO_USER_PROFILE);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Live Weather & Forecast for Active Bangladesh Coordinates
  const loadWeatherData = async (location: UpazilaLocation) => {
    setIsWeatherLoading(true);
    try {
      const cityQuery = `${location.name}, ${location.zilla}`;
      const [current, forecast] = await Promise.all([
        fetchLiveWeather(cityQuery, location.lat, location.lon),
        fetchWeatherForecast(cityQuery, location.lat, location.lon),
      ]);
      setLiveWeather(current);
      setWeatherForecast(forecast);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Trigger weather reload whenever activeLocation changes
  useEffect(() => {
    loadWeatherData(activeLocation);
  }, [activeLocation]);

  // 3. Dynamically update roads, zones, junctions, emergency facilities for the active Bangladesh Upazila
  useEffect(() => {
    const customized = getCustomizedCityData(activeLocation, liveWeather);
    setZones(customized.zones);
    setRoads(customized.roads);
    setJunctions(customized.junctions);
    setFacilities(customized.facilities);
    setMobilityMetrics(customized.mobilityMetrics);
    setActiveRoutes(customized.routes);
    setSelectedSegment(customized.roads[0]);
  }, [activeLocation, liveWeather]);

  // 4. ALWAYS AUTO-REFRESH TELEMETRY ENGINE
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [autoRefreshIntervalSec, setAutoRefreshIntervalSec] = useState<number>(15);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(15);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Background Telemetry & Weather Refresher
  const refreshAllTelemetry = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const cityQuery = `${activeLocation.name}, ${activeLocation.zilla}`;
      const [current, forecast] = await Promise.all([
        fetchLiveWeather(cityQuery, activeLocation.lat, activeLocation.lon).catch(() => null),
        fetchWeatherForecast(cityQuery, activeLocation.lat, activeLocation.lon).catch(() => null),
      ]);
      if (current) {
        setLiveWeather(current);
      }
      if (forecast) {
        setWeatherForecast(forecast);
      }

      // Re-adapt urban and infrastructure data with dynamic live updates
      const customized = getCustomizedCityData(activeLocation, current || liveWeather);
      setZones(customized.zones);
      setRoads(customized.roads);
      setJunctions(customized.junctions);
      setFacilities(customized.facilities);
      setMobilityMetrics(customized.mobilityMetrics);
      setActiveRoutes(customized.routes);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn('Auto-refresh background telemetry notice:', err);
    } finally {
      if (!silent) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // 1-second countdown ticker that triggers refresh on reaching 0
  useEffect(() => {
    if (!isAutoRefresh) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          refreshAllTelemetry(true);
          return autoRefreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, autoRefreshIntervalSec, activeLocation, liveWeather]);

  const handleManualRefresh = () => {
    setRefreshCountdown(autoRefreshIntervalSec);
    refreshAllTelemetry(false);
  };

  // Handle successful signin or registration from AuthLandingPage
  const handleAuthenticated = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
    localStorage.setItem('nagarshield_session_active', 'true');
    localStorage.setItem('nagarshield_saved_profile', JSON.stringify(profile));

    const loc = getLocationDetails(profile.division, profile.zilla, profile.upazila) || DEFAULT_BANGLADESH_LOCATION;
    setActiveLocation(loc);
    setSelectedCity(`${loc.name}, ${loc.zilla}`);
    loadWeatherData(loc);
  };

  // Handle user profile updates (e.g. from registration or location selector)
  const handleProfileUpdated = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nagarshield_saved_profile', JSON.stringify(profile));
    const loc = getLocationDetails(profile.division, profile.zilla, profile.upazila);
    if (loc) {
      setActiveLocation(loc);
      setSelectedCity(`${loc.name}, ${loc.zilla}`);
    }
  };

  // Handle Sign Out -> returns user to the Sign In / Sign Up landing page
  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      localStorage.removeItem('nagarshield_session_active');
      localStorage.removeItem('nagarshield_saved_profile');
      setIsAuthenticated(false);
      setUserProfile(DEFAULT_DEMO_USER_PROFILE);
      setActiveLocation(DEFAULT_BANGLADESH_LOCATION);
      setSelectedCity(`${DEFAULT_BANGLADESH_LOCATION.name}, ${DEFAULT_BANGLADESH_LOCATION.zilla}`);
    }
  };

  const handleOpenAuthModal = (mode: 'signin' | 'signup' | 'location' = 'signin') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Quick switch from emergency mode to GIS Map with highlighted route
  const handleHighlightRouteOnMap = (routeId: string) => {
    setActiveHighlightedRoute(routeId);
    setActiveTab('overview');
    if (routeId === 'route-a') {
      setSelectedSegment(roads.find((r) => r.id === 'road-a') || null);
    } else if (routeId === 'route-b') {
      setSelectedSegment(roads.find((r) => r.id === 'road-alt') || null);
    }
  };

  // Handle user selecting an upazila from any dropdown or GPS
  const handleSelectLocation = (loc: UpazilaLocation) => {
    setActiveLocation(loc);
    setSelectedCity(`${loc.name}, ${loc.zilla}`);
    setActiveToastNotification(null);
    const customized = getCustomizedCityData(loc, liveWeather);
    setRoads(customized.roads);
    setZones(customized.zones);
    setJunctions(customized.junctions);
    setFacilities(customized.facilities);
    setActiveRoutes(customized.routes);
    setMobilityMetrics(customized.mobilityMetrics);
    setSelectedSegment(customized.roads[0] || null);
    loadWeatherData(loc);

    // Persist new location to user profile
    setUserProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        division: loc.division,
        zilla: loc.zilla,
        upazila: loc.name,
        locationName: `${loc.name}, ${loc.zilla}, ${loc.division}`,
        lat: loc.lat,
        lon: loc.lon,
      };
      try {
        localStorage.setItem('nagarshield_saved_profile', JSON.stringify(updated));
        if (updated.uid && !updated.uid.startsWith('demo-')) {
          saveUserProfile(updated).catch(() => {});
        }
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Proactive AI Hazard Notification & Early Warning System State
  const [notifications, setNotifications] = useState<AiNotification[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [activeToastNotification, setActiveToastNotification] = useState<AiNotification | null>(null);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const notifiedIdsRef = React.useRef<Set<string>>(new Set());

  const handleOpenCopilot = (prompt?: string) => {
    if (prompt) {
      setCopilotInitialPrompt(prompt);
    }
    setIsCopilotOpen(true);
  };

  // Aggregate Ground-Truth City Risk Pillars
  const cityFloodRisk = React.useMemo(() => {
    return Math.round(zones.reduce((acc, z) => acc + z.floodRiskScore, 0) / Math.max(1, zones.length));
  }, [zones]);

  const cityHeatRisk = React.useMemo(() => {
    return Math.round(zones.reduce((acc, z) => acc + z.heatRiskScore, 0) / Math.max(1, zones.length));
  }, [zones]);

  const cityTrafficRisk = React.useMemo(() => {
    return Math.round(roads.reduce((acc, r) => acc + r.trafficRiskScore, 0) / Math.max(1, roads.length));
  }, [roads]);

  const cityPopExposure = React.useMemo(() => {
    return Math.round(zones.reduce((acc, z) => acc + z.populationExposureScore, 0) / Math.max(1, zones.length));
  }, [zones]);

  const cityInfraVuln = React.useMemo(() => {
    return Math.round(zones.reduce((acc, z) => acc + z.infrastructureVulnerabilityScore, 0) / Math.max(1, zones.length));
  }, [zones]);

  // Ground-Truth Urban Data Context for AI
  const urbanDataContext: UrbanDataContext = React.useMemo(() => {
    const primaryHospital = facilities.find((f) => f.type === 'HOSPITAL')?.name || 'Dhaka Medical College Hospital';
    const primaryFire = facilities.find((f) => f.type === 'FIRE_STATION' || f.type === 'SHELTER')?.name || 'Tejgaon Fire & Rescue Hub';
    const floodAffectedCount = roads.filter((r) => r.waterloggingDepthCm > 10).length;
    const congestedCount = roads.filter((r) => r.trafficRiskScore > 65).length;
    const averageDelay = Math.round(roads.reduce((acc, r) => acc + r.estimatedDelayMin, 0) / Math.max(1, roads.length));

    // Dynamically calculate compound resilience score based on user weights and live indicators
    const avgTrafficRisk = cityTrafficRisk;
    const avgFloodRisk = cityFloodRisk;
    const avgHeatRisk = cityHeatRisk;
    const weightedDisruption = (
      (avgFloodRisk * resilienceWeights.floodRisk) +
      (avgHeatRisk * resilienceWeights.heatRisk) +
      (avgTrafficRisk * resilienceWeights.trafficRisk) +
      (cityPopExposure * resilienceWeights.populationExposure) +
      (cityInfraVuln * resilienceWeights.infrastructure)
    ) / 100;
    const dynamicResilienceScore = Math.max(20, Math.min(98, Math.round(100 - weightedDisruption * 0.72)));

    return {
      location: {
        name: activeLocation.name,
        zilla: activeLocation.zilla,
        division: activeLocation.division,
        coordinates: { lat: activeLocation.lat, lng: activeLocation.lon },
        elevationMeters: activeLocation.elevationM,
        canalOrRiver: activeLocation.canalOrRiver,
        criticalFacilities: {
          hospital: primaryHospital,
          fireStation: primaryFire,
          emergencyReliefHub: 'Upazila Disaster Operations Center',
        },
      },
      weather: {
        temperatureC: liveWeather?.temperatureC ?? 30.0,
        feelsLikeC: liveWeather?.feelsLikeC ?? 32.5,
        rain1hMm: liveWeather?.rain1hMm ?? 0,
        humidityPercent: liveWeather?.humidityPercent ?? 70,
        windSpeedKmh: liveWeather?.windSpeedKmh ?? 10,
        weatherDescription: liveWeather?.weatherDescription ?? 'Fair skies',
        aqi: liveWeather?.airQuality?.aqi ?? 2,
        heatIndexCategory: liveWeather?.compoundImpacts?.heatIndexCategory ?? 'Normal',
        drainageSurchargePercent: liveWeather?.compoundImpacts?.drainageSurchargePercent ?? 20,
        frictionLossPercent: liveWeather?.compoundImpacts?.frictionLossPercent ?? 5,
      },
      mobility: {
        congestedSegmentsCount: congestedCount,
        averageDelayMin: averageDelay,
        floodAffectedRoadsCount: floodAffectedCount,
        emergencyCorridorsActive: 1,
        trafficCondition: congestedCount >= 3 ? 'Heavy Congestion' : (congestedCount > 0 ? 'Moderate Flow' : 'Free-Flow / Normal'),
      },
      resilienceScore: dynamicResilienceScore,
      roadsSummary: roads.map((r) => ({
        id: r.id,
        name: r.name,
        waterloggingDepthCm: r.waterloggingDepthCm,
        trafficRiskScore: r.trafficRiskScore,
        estimatedDelayMin: r.estimatedDelayMin,
        status: r.isClosed ? 'CLOSED' : (r.isEmergencyCorridor ? 'EMERGENCY_CORRIDOR' : r.congestionLevel),
      })),
    };
  }, [activeLocation, liveWeather, roads, facilities, zones, resilienceWeights, cityTrafficRisk, cityFloodRisk, cityHeatRisk, cityPopExposure, cityInfraVuln]);

  // Run AI Hazard Evaluation against live data
  const runAiHazardEvaluation = async () => {
    setIsAiScanning(true);
    try {
      const result = await evaluateAiHazardAlerts(urbanDataContext);
      if (result.success && Array.isArray(result.notifications)) {
        setNotifications((prev) => {
          const existingMap = new Map(prev.map((n) => [n.id, n]));
          return result.notifications.map((n) => {
            const existing = existingMap.get(n.id);
            if (existing) {
              return { ...n, isRead: existing.isRead, isDismissed: existing.isDismissed };
            }
            return n;
          });
        });

        // Trigger Audio Chime & Speech on new critical/warning alerts
        const urgentItems = result.notifications.filter(
          (n) => (n.level === 'CRITICAL' || n.level === 'WARNING') && !n.isDismissed && !notifiedIdsRef.current.has(n.id)
        );

        if (urgentItems.length > 0) {
          const topAlert = urgentItems[0];
          urgentItems.forEach((n) => notifiedIdsRef.current.add(n.id));

          playAlertChime(topAlert.level === 'CRITICAL' ? 'critical' : 'warning');

          setActiveToastNotification(topAlert);
          setTimeout(() => {
            setActiveToastNotification((curr) => (curr?.id === topAlert.id ? null : curr));
          }, 8000);
        }
      }
    } catch (err) {
      console.error('Error running AI hazard evaluation:', err);
    } finally {
      setIsAiScanning(false);
    }
  };

  // Trigger evaluation on location/weather/road updates and background recurring timer
  useEffect(() => {
    runAiHazardEvaluation();
    const timer = setInterval(() => {
      runAiHazardEvaluation();
    }, 60000);
    return () => clearInterval(timer);
  }, [activeLocation, liveWeather, roads, resilienceWeights]);

  // Notification action handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isDismissed: true } : n)));
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isDismissed: true })));
  };

  const handleAskAiAboutNotification = (notif: AiNotification) => {
    handleOpenCopilot(
      `AI Hazard Inquiry for ${notif.locationName || activeLocation.name}:\nRegarding the alert "${notif.title}":\n"${notif.message}"\nObserved metric: ${notif.metricValue || 'N/A'}.\nRecommended countermeasure: "${notif.actionRecommendation || 'N/A'}".\nWhat immediate life-safety countermeasure and traffic diversion should be enacted?`
    );
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead && !n.isDismissed).length;

  // If user is not yet authenticated, land first on SignIn / SignUp page
  if (!isAuthenticated) {
    return <AuthLandingPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div
      id="nagarshield-main-content-wrap"
      className={`min-h-screen flex font-sans antialiased transition-colors duration-200 ${
        isNight
          ? 'bg-[#000000] text-slate-100'
          : isDark
          ? 'bg-[#0b1120] text-slate-100'
          : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Sleek Modern Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeLocation={activeLocation}
        userProfile={userProfile}
        weatherData={liveWeather}
        onOpenAuthModal={handleOpenAuthModal}
        onSignOut={handleSignOut}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        notificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenCopilot={() => handleOpenCopilot()}
        isCopilotOpen={isCopilotOpen}
      />

      {/* Main Content Layout: responsive padding for mobile & desktop */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 pb-16 md:pb-0">
        {/* Crisp Top Navigation Bar */}
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeLocation={activeLocation}
          onSelectLocation={handleSelectLocation}
          weatherData={liveWeather}
          userProfile={userProfile}
          onOpenAuthModal={handleOpenAuthModal}
          onSignOut={handleSignOut}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          notificationCount={unreadNotificationCount}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onBack={() => setActiveTab('overview')}
          isAutoRefresh={isAutoRefresh}
          onToggleAutoRefresh={() => setIsAutoRefresh(!isAutoRefresh)}
          onManualRefresh={handleManualRefresh}
          lastRefreshedAt={lastRefreshedAt}
          refreshCountdown={refreshCountdown}
          autoRefreshIntervalSec={autoRefreshIntervalSec}
          onChangeRefreshInterval={(sec) => {
            setAutoRefreshIntervalSec(sec);
            setRefreshCountdown(sec);
          }}
          isRefreshing={isRefreshing}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3.5 sm:py-5 space-y-4 sm:space-y-6">
          {/* Tactical Night Mode Active Banner if in Night mode */}
          {isNight && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/80 border border-emerald-500/30 text-emerald-300 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-[11px] uppercase tracking-wide">
                  Tactical Night Mode Engaged
                </span>
                <span className="text-[11px] text-emerald-400/80 font-mono hidden sm:inline">
                  · OLED #000000 True Black · Glare Reduction Active
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                EOC NIGHT OPS
              </span>
            </div>
          )}

          {/* Compact Telemetry & Jurisdiction Quick-Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                {activeLocation.name}, {activeLocation.zilla}
              </span>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                {activeLocation.division} Division
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Elevation: <strong className="text-slate-700 dark:text-slate-200">{activeLocation.elevationM}m</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                Drainage: <strong className="text-slate-700 dark:text-slate-200">{activeLocation.canalOrRiver}</strong>
              </span>

              {/* Live Telemetry Auto-Refresh Status Pill */}
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-semibold flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoRefresh ? 'bg-emerald-400 opacity-75' : 'bg-slate-400 opacity-0'}`} />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isAutoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </span>
                <span>Auto-refresh: {isAutoRefresh ? `every ${autoRefreshIntervalSec}s (in ${refreshCountdown}s)` : 'Paused'}</span>
              </span>

              {userProfile && (
                <span className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> {userProfile.displayName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold transition cursor-pointer flex items-center gap-1 text-xs"
                title="Trigger immediate telemetry refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
              </button>
              <button
                id="banner-google-map-btn"
                onClick={() => setActiveTab('google-map')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-slate-700 font-semibold transition cursor-pointer flex items-center gap-1 text-xs"
                title="Open Google Maps Platform"
              >
                <Crosshair className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Locate on Map</span>
              </button>
              <button
                onClick={() => handleOpenAuthModal('location')}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Switch Upazila</span>
              </button>
            </div>
          </div>

        {/* TAB 1: Overview & Main Dashboard (Section 15) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* The 3 Core Pillars + Urban Resilience Index */}
            <ThreePillarCards
              floodRisk={cityFloodRisk}
              heatRisk={cityHeatRisk}
              trafficRisk={cityTrafficRisk}
              populationExposure={cityPopExposure}
              infrastructureVulnerability={cityInfraVuln}
              weights={resilienceWeights}
              weatherData={liveWeather}
              mobilityData={mobilityMetrics}
              cityName={activeLocation.name}
              onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
              onSelectPillar={(pillar) => {
                if (pillar === 'traffic') setActiveTab('disruption');
              }}
            />

            {/* Visual Geolocation & Risk Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  Map Geolocation Mode:
                </span>
                <span className="text-[11px] text-slate-500">
                  {overviewMapMode === 'google-map'
                    ? `Live Google Maps Platform with satellite, traffic & facilities for ${activeLocation.name}`
                    : `Urban GIS segment schematic & UMDI risk overlay`}
                </span>
              </div>
              <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  id="overview-toggle-google-map"
                  onClick={() => setOverviewMapMode('google-map')}
                  className={`px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5 cursor-pointer ${
                    overviewMapMode === 'google-map'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Google Map</span>
                </button>
                <button
                  type="button"
                  id="overview-toggle-schematic"
                  onClick={() => setOverviewMapMode('schematic')}
                  className={`px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5 cursor-pointer ${
                    overviewMapMode === 'schematic'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>GIS Schematic</span>
                </button>
              </div>
            </div>

            {/* Map View Rendering */}
            {overviewMapMode === 'google-map' ? (
              <GoogleMapLocator
                activeLocation={activeLocation}
                onSelectLocation={(loc) => {
                  setActiveLocation(loc);
                  setSelectedCity(`${loc.name}, ${loc.zilla}`);
                }}
                currentWeather={liveWeather}
              />
            ) : (
              <GisRiskMap
                roads={roads}
                zones={zones}
                junctions={junctions}
                facilities={facilities}
                selectedSegmentId={selectedSegment?.id || null}
                onSelectSegment={setSelectedSegment}
                activeHighlightedRoute={activeHighlightedRoute}
                incidents={incidents}
                onSelectIncident={(inc) => {
                  setActiveTab('incidents');
                }}
              />
            )}

            {/* AI Recommendation Banner */}
            <div className="bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-white rounded-xl p-4 border border-indigo-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-950">AI Urban Copilot Guidance</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
                      {activeLocation.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {liveWeather && liveWeather.rain1hMm > 1.2 ? (
                      <>
                        Active rain detected ({liveWeather.rain1hMm} mm/h). Clear sluice gates at <strong>{activeLocation.canalOrRiver}</strong> and prioritize emergency corridor access to <strong>{activeLocation.criticalFacilities.hospital}</strong>.
                      </>
                    ) : (
                      <>
                        Standard atmospheric & traffic flow conditions. Nominal flood risk; optimal window for routine culvert desilting along <strong>{activeLocation.canalOrRiver}</strong> and maintaining clear pathways to <strong>{activeLocation.criticalFacilities.hospital}</strong>.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenCopilot()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask Copilot</span>
                </button>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition border border-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Planner View</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Feature Access Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              <div
                onClick={() => setActiveTab('incidents')}
                className="bg-white p-3.5 rounded-xl border border-amber-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer group bg-amber-50/15"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Citizen Hazard Reporter
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  {incidents.filter((i) => i.status !== 'resolved').length} live hazards reported. Community validation & rapid dispatch.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('metro')}
                className="bg-white p-3.5 rounded-xl border border-emerald-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition cursor-pointer group bg-emerald-50/15"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-emerald-600" />
                    Dhaka Metro MRT-6
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  Live train headways, station crowding, Rapid Pass fare calculator & feeder bays.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('waterlogging')}
                className="bg-white p-3.5 rounded-xl border border-blue-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition cursor-pointer group bg-blue-50/15"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Waves className="w-4 h-4 text-blue-600" />
                    Waterlogging & Basins
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  WASA pump telemetry, drainage khals, water depth tiers & runoff saturation curves.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('weather')}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-sky-600" />
                    Weather Radar
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  {liveWeather
                    ? `${liveWeather.temperatureC}°C, ${liveWeather.weatherDescription} • ${liveWeather.rain1hMm} mm/h rain`
                    : 'Hourly rain intensity, satellite radar, and 5-day flood forecasts.'}
                </p>
              </div>

              <div
                onClick={() => setActiveTab('emergency')}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-300 hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Emergency Access
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  Direct clearance routes to {activeLocation.criticalFacilities.hospital}.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('routes')}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    Citizen Router
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  Compare shaded, dry paths against high-heat corridors.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('google-map')}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-sky-600" />
                    Google Maps Locator
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500">
                  GPS device locating, live traffic flows, and satellite overlays.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Dedicated Google Maps Locator */}
        {activeTab === 'google-map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer flex items-center gap-1.5 text-xs shrink-0 shadow-2xs"
                  title="Return to City Overview Dashboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Back</span>
                </button>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Google Maps Platform Geolocation & Asset Locator
                  </h2>
                  <p className="text-slate-500 mt-0.5">
                    Locate your exact device position with GPS, explore satellite & terrain layers, inspect emergency hospitals, fire stations, and drainage canals for {activeLocation.name}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenAuthModal('location')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Switch Upazila Dropdown</span>
                </button>
              </div>
            </div>

            <GoogleMapLocator
              activeLocation={activeLocation}
              onSelectLocation={(loc) => {
                setActiveLocation(loc);
                setSelectedCity(`${loc.name}, ${loc.zilla}`);
              }}
              currentWeather={liveWeather}
            />
          </div>
        )}

        {/* TAB: Weather Monitoring */}
        {activeTab === 'weather' && (
          <WeatherMonitoring
            currentWeather={liveWeather}
            forecast={weatherForecast}
            isLoading={isWeatherLoading}
            selectedCity={`${activeLocation.name}, ${activeLocation.zilla}`}
            onSelectCity={(c) => setSelectedCity(c)}
            onRefresh={() => loadWeatherData(activeLocation)}
            onNavigateToTab={setActiveTab}
            activeLocation={activeLocation}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* TAB 2: Mobility Disruption & Hotspots (UMDI) */}
        {activeTab === 'disruption' && (
          <MobilityDisruptionHotspots
            roads={roads}
            zones={zones}
            junctions={junctions}
            onSelectRoad={(road) => {
              setSelectedSegment(road);
              setActiveTab('overview');
            }}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* TAB 3: Emergency Access Mode */}
        {activeTab === 'emergency' && (
          <EmergencyRouteMode
            facilities={facilities}
            zones={zones}
            roads={roads}
            onHighlightRoute={handleHighlightRouteOnMap}
            onBack={() => setActiveTab('overview')}
            activeLocation={activeLocation}
            weatherData={liveWeather}
          />
        )}

        {/* TAB: Find Care & Medical Triage */}
        {activeTab === 'find-care' && (
          <FindCareDashboard
            activeLocation={activeLocation}
            onNavigateToTab={setActiveTab}
            onSelectRouteTarget={(provider) => {
              setActiveTab('routes');
            }}
          />
        )}

        {/* TAB 4: Climate Citizen Route Analysis */}
        {activeTab === 'routes' && (
          <ClimateRouteAnalysis
            routes={activeRoutes}
            onSelectRoute={(routeId) => {
              setActiveHighlightedRoute(routeId);
            }}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* TAB 5: Planner Traffic Dashboard */}
        {activeTab === 'planner' && (
          <PlannerTrafficDashboard
            zones={zones}
            roads={roads}
            junctions={junctions}
            resilienceWeights={resilienceWeights}
            onUpdateWeights={setResilienceWeights}
            onBack={() => setActiveTab('overview')}
            activeLocation={activeLocation}
            weatherData={liveWeather}
          />
        )}

        {/* TAB 6: What-If Scenario Simulator */}
        {activeTab === 'simulator' && (
          <WhatIfSimulator
            roads={roads}
            zones={zones}
            resilienceWeights={resilienceWeights}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* TAB: Citizen Crowdsourced Incident Reporter */}
        {activeTab === 'incidents' && (
          <IncidentReporter
            incidents={incidents}
            activeLocation={activeLocation}
            userProfile={userProfile}
            onSelectIncidentLocation={(inc) => {
              setOverviewMapMode('schematic');
              setActiveTab('overview');
            }}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* TAB: Dhaka Metro Rail (MRT-6) Live Transit */}
        {activeTab === 'metro' && (
          <DhakaMetroTracker onBack={() => setActiveTab('overview')} />
        )}

        {/* TAB: Waterlogging & Flood Basin Monitor */}
        {activeTab === 'waterlogging' && (
          <WaterloggingMonitor
            activeLocation={activeLocation}
            weatherData={liveWeather}
            onNavigateToTab={setActiveTab}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* TAB: Admin User Management & Oversight */}
        {activeTab === 'admin' && (
          <AdminPanel
            currentUserProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

        {/* Clean Footer */}
        <footer className="bg-white border-t border-slate-200/90 text-slate-500 text-xs py-4 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                <span>NagarShield AI</span>
                <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  National Mobility & Climate
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Serving {activeLocation.name}, {activeLocation.zilla} • {activeLocation.division} Division, Bangladesh
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>🌧️ Climate</span>
              <span>•</span>
              <span>🔥 Heat</span>
              <span>•</span>
              <span>🚦 Mobility</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth & Location Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUserProfile={userProfile}
        onProfileUpdated={handleProfileUpdated}
        onSignedOut={handleSignOut}
        initialMode={authModalInitialMode}
      />

      {/* Weights Modal */}
      <WeightsModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        weights={resilienceWeights}
        onUpdateWeights={setResilienceWeights}
      />

      {/* Native-feel Mobile Bottom Navigation Dock */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenCopilot={() => handleOpenCopilot()}
        isCopilotOpen={isCopilotOpen}
        unresolvedHazardsCount={incidents.filter((i) => i.status !== 'resolved').length}
      />

      {/* Floating AI Copilot Quick Launcher Button (Desktop only; on mobile dock has dedicated button) */}
      {!isCopilotOpen && (
        <button
          type="button"
          onClick={() => handleOpenCopilot()}
          className="hidden md:flex fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3.5 rounded-full shadow-lg border border-white/20 items-center gap-2 cursor-pointer transition transform hover:scale-105 group"
          title="Open AI Urban Copilot Popup"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Bot className="w-4 h-4 text-white" />
          <span>Ask Copilot</span>
        </button>
      )}

      {/* AI Urban Copilot Popup Window (Floating widget over any dashboard page) */}
      {isCopilotOpen && (
        <GeminiChatbot
          selectedCity={`${activeLocation.name}, ${activeLocation.zilla}, Bangladesh`}
          urbanContext={urbanDataContext}
          initialPrompt={copilotInitialPrompt}
          onClearInitialPrompt={() => setCopilotInitialPrompt(null)}
          onClose={() => setIsCopilotOpen(false)}
        />
      )}

      {/* AI Hazard Warning Notification Center Slide-over */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        isScanning={isAiScanning}
        onRunAiScan={runAiHazardEvaluation}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDismiss={handleDismissNotification}
        onClearAll={handleClearAllNotifications}
        onAskAiAboutNotification={handleAskAiAboutNotification}
        onNavigateToSection={(tab) => setActiveTab(tab)}
      />

      {/* Floating Interactive Toast for New Live Warnings */}
      <NotificationToast
        notification={activeToastNotification}
        onDismiss={() => setActiveToastNotification(null)}
        onReviewWithAi={(notif) => {
          handleAskAiAboutNotification(notif);
          setActiveToastNotification(null);
        }}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setActiveToastNotification(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
