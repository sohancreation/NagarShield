/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  toBnDigits: (value: number | string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & App
    appName: 'NagarShield',
    appSubname: 'Urban Resilience Grid',
    live: 'LIVE',
    officialGrid: 'Govt. of Bangladesh Urban Resilience',

    // Sidebar Nav
    monitoring: 'Monitoring',
    overview: 'Overview & GIS Map',
    googleMap: 'Google Maps Locator',
    weather: 'Weather & Climate',
    disruption: 'Mobility & Congestion',
    incidents: 'Citizen Hazard Reporter',
    metro: 'Dhaka Metro Rail (MRT-6)',
    waterlogging: 'Waterlogging & Flood Basins',
    resilience: 'Resilience',
    routes: 'Citizen Safe Router',
    findCare: 'Find Care & Triage',
    emergency: 'Emergency Access',
    intelligence: 'Intelligence',
    copilot: 'AI Urban Copilot',
    planner: 'Planner Studio',
    simulator: 'Scenario Simulator',

    // Roles
    urbanPlanner: 'Urban Planner',
    emergencyOfficer: 'Emergency Officer',
    analyst: 'Analyst',
    citizen: 'Citizen',

    // Topbar & Actions
    searchPlaceholder: 'Search Upazila, Road, Canal, or Emergency Center...',
    refresh: 'Refresh',
    notifications: 'Notifications',
    theme: 'Theme',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    register: 'Create Account',
    jurisdiction: 'Jurisdiction',
    switchUpazila: 'Switch Upazila',
    locateOnMap: 'Locate on Map',
    back: 'Back',

    // Quick Telemetry Strip
    division: 'Division',
    elevation: 'Elevation',
    drainage: 'Drainage',
    registered: 'Registered',

    // Incident Reporter
    hazardReporterTitle: 'Citizen Hazard & Incident Reporter',
    hazardReporterSubtitle: 'Crowdsourced municipal hazard reporting with real-time verification and emergency dispatch for Bangladesh cities',
    reportNewHazard: 'Report Hazard',
    allIncidents: 'All Hazards',
    waterloggingIncidents: 'Waterlogging',
    powerIncidents: 'Electrical Hazard',
    roadIncidents: 'Road Obstacles',
    manholeIncidents: 'Open Drain/Manhole',
    activeHazards: 'Active Hazards',
    criticalCount: 'Critical Urgency',
    verifiedByCommunity: 'Verified by Community',
    resolvedIn24h: 'Resolved (24h)',
    verifyHazard: 'Verify / Still There',
    verified: 'Verified',
    statusReported: 'Reported',
    statusInvestigating: 'Under Inspection',
    statusDispatched: 'Team Dispatched',
    statusResolved: 'Resolved',
    waterDepth: 'Water Depth',
    landmark: 'Landmark',
    reportedBy: 'Reported by',
    photoEvidence: 'Photo Evidence',
    submitReport: 'Submit Incident to Responders',

    // Metro MRT-6
    metroTitle: 'Dhaka Metro Rail (MRT-6) Live Transit Monitor',
    metroSubtitle: 'Elevated rapid transit tracking, live train headways, station crowding & fare matrix for Dhaka commuters',
    nextTrainUttara: 'Next to Uttara North',
    nextTrainMotijheel: 'Next to Motijheel',
    headwayPeak: 'Peak Headway: 6-8 mins',
    headwayOffPeak: 'Regular Headway: 10-12 mins',
    fareCalculator: 'MRT Fare & Rapid Pass Calculator',
    originStation: 'Departure Station',
    destinationStation: 'Arrival Station',
    estimatedTime: 'Travel Time',
    standardFare: 'Standard Fare',
    mrtPassFare: 'MRT Pass Fare (10% Off)',
    savedVsRoad: 'Saved vs Road Traffic',
    stationExplorer: 'Station Real-Time Telemetry',
    crowdLevel: 'Crowd Level',
    platformWait: 'Avg. Platform Wait',
    lastMileFeeder: 'Last-Mile Connectors',
    serviceBulletin: 'DMTCL Service Advisory',

    // Waterlogging & Flood Basins
    waterloggingTitle: 'Waterlogging & Flood Basin Monitor',
    waterloggingSubtitle: 'Real-time urban drainage monitoring, WASA heavy-duty pump telemetry & canal saturation levels across Bangladesh',
    drainageCapacity: 'WASA Pump Status',
    retentionBasins: 'Retention Basins & Khals',
    saturationCurve: 'Rainfall Runoff Saturation',
    stageNormal: 'Stage 0: Normal / Dry (< 5 cm)',
    stageAnkle: 'Stage 1: Ankle Deep (5 - 15 cm)',
    stageKnee: 'Stage 2: Knee Deep (15 - 40 cm)',
    stageWaist: 'Stage 3: Waist Deep / Impassable (> 40 cm)',
    activePumps: 'Active WASA Pumps',
    totalDischarge: 'Current Discharge',
    reportWaterloggingHere: 'Report Waterlogging at Current Location',

    // Common
    loading: 'Loading live data...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    minsAgo: 'mins ago',
    hoursAgo: 'hours ago',
  },
  bn: {
    // Brand & App
    appName: 'নগরশীল্ড',
    appSubname: 'নগর সহনশীলতা ও দুর্যোগ গ্রিড',
    live: 'লাইভ',
    officialGrid: 'বাংলাদেশ সরকার নগর সহনশীলতা কমান্ড',

    // Sidebar Nav
    monitoring: 'তদারকি ও পর্যবেক্ষণ',
    overview: 'সারসংক্ষেপ ও জিআইএস মানচিত্র',
    googleMap: 'গুগল ম্যাপস লোকেটার',
    weather: 'আবহাওয়া ও জলবায়ু',
    disruption: 'যানজট ও চলাচল বিঘ্ন',
    incidents: 'নাগরিক সমস্যা ও দুর্যোগ রিপোর্টার',
    metro: 'ঢাকা মেট্রোরেল (এমআরটি-৬)',
    waterlogging: 'জলাবদ্ধতা ও ড্রেনেজ অববাহিকা',
    resilience: 'সহনশীলতা ও নিরাপত্তা',
    routes: 'নাগরিক নিরাপদ রুট নির্দেশক',
    findCare: 'জরুরি চিকিৎসা ও হাসপাতাল',
    emergency: 'জরুরি করিডোর সেবা',
    intelligence: 'কৃত্রিম বুদ্ধিমত্তা',
    copilot: 'এআই আরবান কোপাইলট',
    planner: 'নগর পরিকল্পনাবিদ স্টুডিও',
    simulator: 'পরিস্থিতি সিমুলেটর',

    // Roles
    urbanPlanner: 'নগর পরিকল্পনাবিদ',
    emergencyOfficer: 'জরুরি রেসপন্ডার অফিসার',
    analyst: 'বিশ্লেষক',
    citizen: 'নাগরিক',

    // Topbar & Actions
    searchPlaceholder: 'উপজেলা, সড়ক, খাল বা জরুরি কেন্দ্র খুঁজুন...',
    refresh: 'রিফ্রেশ',
    notifications: 'বিজ্ঞপ্তি',
    theme: 'থিম',
    signOut: 'লগআউট',
    signIn: 'লগইন',
    register: 'অ্যাকাউন্ট খুলুন',
    jurisdiction: 'এলাকা',
    switchUpazila: 'উপজেলা পরিবর্তন',
    locateOnMap: 'মানচিত্রে খুঁজুন',
    back: 'ফিরে যান',

    // Quick Telemetry Strip
    division: 'বিভাগ',
    elevation: 'উচ্চতা',
    drainage: 'নিষ্কাশন খাল',
    registered: 'নিবন্ধিত কর্মকর্তা',

    // Incident Reporter
    hazardReporterTitle: 'নাগরিক দুর্যোগ ও সড়ক সমস্যা রিপোর্টার',
    hazardReporterSubtitle: 'ছবিসহ সরাসরি জলাবদ্ধতা, ভাঙা ম্যানহোল, ছিঁড়ে পড়া তার ও সড়ক প্রতিবন্ধকতা রিপোর্ট করুন',
    reportNewHazard: 'নতুন সমস্যা রিপোর্ট করুন',
    allIncidents: 'সব রিপোর্ট',
    waterloggingIncidents: 'জলাবদ্ধতা',
    powerIncidents: 'বিদ্যুতের তার/ঝুঁকি',
    roadIncidents: 'সড়ক প্রতিবন্ধকতা',
    manholeIncidents: 'খোলা ম্যানহোল/ড্রেন',
    activeHazards: 'চলমান দুর্যোগ',
    criticalCount: 'জরুরি বিপদ',
    verifiedByCommunity: 'নাগরিক কর্তৃক যাচাইকৃত',
    resolvedIn24h: '২৪ ঘণ্টায় সমাধান',
    verifyHazard: 'যাচাই করুন / এখনো আছে',
    verified: 'যাচাই সম্পন্ন',
    statusReported: 'রিপোর্ট গৃহীত',
    statusInvestigating: 'পরিদর্শনে টিম',
    statusDispatched: 'টিম পাঠানো হয়েছে',
    statusResolved: 'সমাধান সম্পন্ন',
    waterDepth: 'পানির গভীরতা',
    landmark: 'নির্দিষ্ট স্থান / ল্যান্ডমার্ক',
    reportedBy: 'রিপোর্ট করেছেন',
    photoEvidence: 'ছবি প্রমাণ',
    submitReport: 'রেসপন্ডারদের কাছে পাঠান',

    // Metro MRT-6
    metroTitle: 'ঢাকা মেট্রোরেল (এমআরটি-৬) লাইভ ট্র্যাকার',
    metroSubtitle: 'উত্তরা থেকে মতিঝিল মেট্রোরেলের লাইভ ট্রেনের আগমন সময়, স্টেশনের ভিড় এবং ভাড়া তালিকা',
    nextTrainUttara: 'উত্তরা উত্তরের পরবর্তী ট্রেন',
    nextTrainMotijheel: 'মতিঝিলের পরবর্তী ট্রেন',
    headwayPeak: 'পিক আওয়ার ব্যবধান: ৬-৮ মিনিট',
    headwayOffPeak: 'সাধারণ ব্যবধান: ১০-১২ মিনিট',
    fareCalculator: 'ভাড়া ও র্যাপিড পাস ক্যালকুলেটর',
    originStation: 'যাত্রা শুরুর স্টেশন',
    destinationStation: 'গন্তব্য স্টেশন',
    estimatedTime: 'ভ্রমণ সময়',
    standardFare: 'সাধারণ ভাড়া',
    mrtPassFare: 'এমআরটি পাস ভাড়া (১০% ছাড়)',
    savedVsRoad: 'সড়ক ট্রাফিকের তুলনায় সাশ্রয়',
    stationExplorer: 'স্টেশনের লাইভ অবস্থা',
    crowdLevel: 'ভিড়ের মাত্রা',
    platformWait: 'গড় অপেক্ষার সময়',
    lastMileFeeder: 'রিকশা ও বাস সংযোগ',
    serviceBulletin: 'ডিএমটিসিএল লাইভ বুলেটিন',

    // Waterlogging & Flood Basins
    waterloggingTitle: 'জলাবদ্ধতা ও ড্রেনেজ খাল পর্যবেক্ষণ কেন্দ্র',
    waterloggingSubtitle: 'ঢাকা ও বাংলাদেশের প্রধান খাল, ওয়াসা হেভি-ডিউটি পাম্প এবং বৃষ্টির পানি নিষ্কাশন তদারকি',
    drainageCapacity: 'ওয়াসা পাম্প স্টেশন স্ট্যাটাস',
    retentionBasins: 'ধারণ অববাহিকা ও খালসমূহ',
    saturationCurve: 'বৃষ্টিপাত ও পানি শোষণ মাত্রা',
    stageNormal: 'স্তর ০: স্বাভাবিক / শুষ্ক (< ৫ সে.মি.)',
    stageAnkle: 'স্তর ১: গোড়ালি সমান পানি (৫ - ১৫ সে.মি.)',
    stageKnee: 'স্তর ২: হাঁটু সমান পানি (১৫ - ৪০ সে.মি.)',
    stageWaist: 'স্তর ৩: কোমর সমান পানি / বিপজ্জনক (> ৪০ সে.মি.)',
    activePumps: 'চালু ওয়াসা পাম্প',
    totalDischarge: 'বর্তমান নিষ্কাশন হার',
    reportWaterloggingHere: 'এই এলাকায় জলাবদ্ধতা রিপোর্ট করুন',

    // Common
    loading: 'তথ্য লোড হচ্ছে...',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',
    minsAgo: 'মিনিট আগে',
    hoursAgo: 'ঘণ্টা আগে',
  },
};

const BENGALI_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
  toBnDigits: (val: number | string) => String(val),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('nagarshield_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('nagarshield_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    if (translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  };

  const toBnDigits = (value: number | string): string => {
    if (language !== 'bn') return String(value);
    return String(value).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[digit] || digit);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        toBnDigits,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
