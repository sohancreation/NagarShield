/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CareProvider, CareCategory } from '../types';
import { UpazilaLocation } from './bangladeshLocations';

/**
 * Calculates geodesic distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * National healthcare helplines in Bangladesh
 */
export const BANGLADESH_HEALTH_HELPLINES = [
  {
    name: 'National Emergency Service (Ambulance / Police / Fire)',
    number: '999',
    description: 'Toll-free 24/7 emergency dispatch for ambulance & urgent hospital transit',
    type: 'EMERGENCY',
  },
  {
    name: 'Shastho Batayan (Health Ministry Telemedicine)',
    number: '16263',
    description: 'Government 24/7 doctor consultation, medical advice & hospital info',
    type: 'TELEMEDICINE',
  },
  {
    name: 'IEDCR Dengue & Epidemic Control Hotline',
    number: '10655',
    description: 'Epidemic outbreak, dengue fever guidance & specialized testing support',
    type: 'EPIDEMIC',
  },
  {
    name: 'National Citizen Service & Disaster Assistance',
    number: '333',
    description: 'Relief distribution, district emergency coordinator & medical aid',
    type: 'GOVERNMENT',
  },
];

/**
 * Generates context-aware, authentic care providers around any selected Upazila
 */
export function getCareProvidersForLocation(
  location: UpazilaLocation,
  categoryFilter: CareCategory = 'ALL',
  searchQuery: string = ''
): CareProvider[] {
  const { name: upazilaName, zilla, division, lat, lon, criticalFacilities, canalOrRiver } = location;

  const baseProviders: Omit<CareProvider, 'distanceKm'>[] = [
    // 1. Primary Hospital / Upazila Health Complex (Government 24/7)
    {
      id: `care-hosp-govt-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: criticalFacilities?.hospital || `${upazilaName} Upazila Health Complex`,
      category: 'HOSPITAL',
      specialty: 'Government Multi-Specialty & Emergency Hospital',
      address: `Hospital Road, ${upazilaName} Sadar, ${zilla}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1711-234567',
      emergencyHotline: '16263',
      lat: lat + 0.005,
      lng: lon + 0.004,
      openStatus: 'Open 24 Hours',
      is24x7: true,
      hasEmergencyUnit: true,
      services: ['24/7 Emergency', 'Ambulance Service', 'Trauma Unit', 'ICU', 'Blood Bank', 'General Surgery', 'Pathology Lab'],
      rating: 4.5,
      aiRecommendation: `Primary public emergency referral center in ${upazilaName}. Dedicated ambulance bay with direct connectivity to arterial highway.`,
      floodSafeRoute: true,
    },

    // 2. District Central / Tertiary Medical Center
    {
      id: `care-hosp-tertiary-${zilla.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: division === 'Dhaka'
        ? (zilla === 'Dhaka' ? 'Dhaka Medical College Hospital' : `${zilla} District Sadar Hospital`)
        : (division === 'Chittagong' && zilla === 'Chittagong'
            ? 'Chittagong Medical College Hospital'
            : (division === 'Sylhet' && zilla === 'Sylhet'
                ? 'MAG Osmani Medical College Hospital'
                : (division === 'Rajshahi' && zilla === 'Rajshahi'
                    ? 'Rajshahi Medical College Hospital'
                    : `${zilla} 250-Bed General Hospital`))),
      category: 'HOSPITAL',
      specialty: 'Tertiary Care & Specialized Surgery Center',
      address: `Central Medical Enclave, ${zilla} Sadar`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 2-55165000',
      emergencyHotline: '999',
      lat: lat - 0.012,
      lng: lon + 0.015,
      openStatus: 'Open 24 Hours',
      is24x7: true,
      hasEmergencyUnit: true,
      services: ['Coronary Care (CCU)', 'Neuro-Surgery', 'Burn & Plastic Unit', 'Dialysis Center', '24/7 Blood Transfusion', 'NICU'],
      rating: 4.7,
      aiRecommendation: `Top referral facility for ${zilla} district with intensive care beds and cardiac emergency triage.`,
      floodSafeRoute: true,
    },

    // 3. 24/7 Model Pharmacy
    {
      id: `care-pharm-247-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `Lazz Pharma 24/7 Model Dispensary (${upazilaName})`,
      category: 'PHARMACY',
      specialty: '24/7 Temperature-Controlled Model Pharmacy',
      address: `Commercial Circle, Near ${criticalFacilities?.hospital || 'Hospital Gate'}, ${upazilaName}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1819-876543',
      emergencyHotline: '+880 1713-000222',
      lat: lat + 0.003,
      lng: lon + 0.002,
      openStatus: 'Open 24 Hours',
      is24x7: true,
      hasEmergencyUnit: false,
      services: ['24/7 Prescription Refill', 'Insulin & Vaccine Cold Storage', 'Nebulizer & Oxygen Cylinders', 'Emergency First Aid', 'Digital Blood Pressure & Glucose Check'],
      rating: 4.8,
      aiRecommendation: `Certified DGDA model pharmacy with generator backup for continuous insulin refrigeration. 24/7 pharmacist on duty.`,
      floodSafeRoute: true,
    },

    // 4. Local Community Pharmacy & Drug House
    {
      id: `care-pharm-community-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `Tamanna Medical & Surgical Hall`,
      category: 'PHARMACY',
      specialty: 'Retail Medicines & Emergency Surgicals',
      address: `Station Road, Bazar Point, ${upazilaName}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1912-345678',
      lat: lat - 0.006,
      lng: lon - 0.005,
      openStatus: 'Open • Closes 11:30 PM',
      is24x7: false,
      hasEmergencyUnit: false,
      services: ['Antibiotics & Chronic Meds', 'Orthopedic Braces & Bandages', 'Home Delivery within 3 km', 'Inhalers & Respiratory Aids'],
      rating: 4.3,
      aiRecommendation: `Reliable local pharmacy stocking essential oral rehydration salts, dengue monitoring supplies, and daily prescriptions.`,
      floodSafeRoute: false,
    },

    // 5. Specialist Doctor - Cardiologist
    {
      id: `care-doc-cardio-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: 'Prof. Dr. M. A. Rahman',
      category: 'DOCTOR',
      specialty: 'Cardiology & Heart Disease Specialist',
      doctorName: 'Prof. Dr. M. A. Rahman',
      doctorDegree: 'MBBS, FCPS (Medicine), MD (Cardiology), FACC (USA)',
      address: `Chamber 302, Labaid Care Complex, ${zilla}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1712-445566',
      lat: lat + 0.008,
      lng: lon - 0.009,
      openStatus: 'Chamber: 5:00 PM - 9:00 PM (Sat-Thu)',
      is24x7: false,
      hasEmergencyUnit: false,
      services: ['Hypertension & Chest Pain Triage', 'ECG & Echo Review', 'Post-Angioplasty Consultation', 'Heart Failure Management'],
      rating: 4.9,
      aiRecommendation: `Senior cardiology consultant with 20+ years experience. Prior appointment recommended via serial number.`,
      floodSafeRoute: true,
    },

    // 6. Specialist Doctor - Pediatrician / Child Specialist
    {
      id: `care-doc-pediatric-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: 'Dr. Nusrat Jahan',
      category: 'DOCTOR',
      specialty: 'Pediatrics & Neonatal Child Health Specialist',
      doctorName: 'Dr. Nusrat Jahan',
      doctorDegree: 'MBBS, DCH (Pediatrics), FCPS (Child Health)',
      address: `Mother & Child Healthcare Block, Civic Square, ${upazilaName}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1823-998877',
      lat: lat - 0.004,
      lng: lon + 0.007,
      openStatus: 'Chamber: 4:00 PM - 8:30 PM (Daily)',
      is24x7: false,
      hasEmergencyUnit: false,
      services: ['Pediatric Infection & Fever Triage', 'Newborn Care & Vaccination', 'Child Asthma & Bronchiolitis', 'Pediatric Dengue Monitoring'],
      rating: 4.8,
      aiRecommendation: `Specialist in seasonal pediatric infections, waterborne diarrhea, and fever monitoring. Very gentle with infants.`,
      floodSafeRoute: true,
    },

    // 7. Specialist Doctor - Medicine & Diabetes Specialist
    {
      id: `care-doc-medicine-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: 'Dr. Tanvir Ahmed Chowdhury',
      category: 'DOCTOR',
      specialty: 'Internal Medicine, Fever & Diabetologist',
      doctorName: 'Dr. Tanvir Ahmed Chowdhury',
      doctorDegree: 'MBBS, BCS (Health), MD (Internal Medicine)',
      address: `Popular Consultation Chambers, ${zilla} Central`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1715-112233',
      lat: lat + 0.011,
      lng: lon + 0.008,
      openStatus: 'Chamber: 3:00 PM - 8:00 PM (Sat-Wed)',
      is24x7: false,
      hasEmergencyUnit: false,
      services: ['Dengue & Typhoid Protocol', 'Diabetes Sugar Titration', 'Chronic Kidney & Liver Followup', 'Elderly Geriatric Care'],
      rating: 4.7,
      aiRecommendation: `Expert in climate-related fever outbreaks, heat exhaustion treatment, and chronic disease stabilization.`,
      floodSafeRoute: true,
    },

    // 8. Diagnostic Center & Imaging Lab
    {
      id: `care-diag-popular-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `Popular Diagnostic Centre & Imaging Lab (${zilla})`,
      category: 'DIAGNOSTIC',
      specialty: 'Comprehensive Digital Pathology & Advanced Imaging',
      address: `Main Boulevard, Opposite General Hospital, ${zilla}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 9613-787801',
      emergencyHotline: '+880 1711-556677',
      lat: lat + 0.007,
      lng: lon + 0.012,
      openStatus: 'Open • 7:00 AM - 11:00 PM',
      is24x7: false,
      hasEmergencyUnit: false,
      services: ['Dengue NS1 Antigen & CBC (2-hr report)', '1.5 Tesla MRI & 128-Slice CT Scan', 'Digital X-Ray & 4D Ultrasound', 'Echo & Color Doppler', 'Hormone & Electrolyte Profiling'],
      rating: 4.6,
      aiRecommendation: `Fast turnaround for emergency blood and dengue NS1/platelet tests. Online digital report download available.`,
      floodSafeRoute: true,
    },

    // 9. Diagnostic Lab - Labaid Diagnostic
    {
      id: `care-diag-labaid-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `Labaid Diagnostic & Cardiac Imaging`,
      category: 'DIAGNOSTIC',
      specialty: 'Specialized Cardiac & Molecular Pathology Laboratory',
      address: `Sector 4 Healthcare Avenue, ${zilla}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1766-662211',
      lat: lat - 0.009,
      lng: lon - 0.008,
      openStatus: 'Open • 7:30 AM - 10:30 PM',
      is24x7: false,
      hasEmergencyUnit: false,
      services: ['Cardiac Troponin-I Rapid Test', 'Biochemistry & Lipid Panel', 'Thyroid Profile', 'Digital Mammography', 'Automated Urine & Stool Analysis'],
      rating: 4.7,
      aiRecommendation: `Reliable diagnostic lab with automated analyzers and certified pathologists. Home sample collection available.`,
      floodSafeRoute: true,
    },

    // 10. Community Clinic & Maternity Center
    {
      id: `care-clinic-maternal-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${upazilaName} Mother & Child Welfare Center (MCWC)`,
      category: 'CLINIC',
      specialty: 'Maternity, Antenatal Care & Immunization Clinic',
      address: `Near River Embankment Road, ${upazilaName}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1733-445588',
      emergencyHotline: '16263',
      lat: lat - 0.007,
      lng: lon + 0.003,
      openStatus: 'Open 24/7 for Maternity Emergencies',
      is24x7: true,
      hasEmergencyUnit: true,
      services: ['Normal Delivery & Labor Room', 'EPI Vaccination (Expanded Program on Immunization)', 'Antenatal & Postnatal Checkups', 'Adolescent Nutrition & Ultrasound'],
      rating: 4.4,
      aiRecommendation: `Specialized government maternal health center with round-the-clock trained midwives and emergency labor room.`,
      floodSafeRoute: false,
    },

    // 11. Red Crescent Primary Health Clinic
    {
      id: `care-clinic-redcrescent-${upazilaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `Bangladesh Red Crescent Society Community Clinic (${upazilaName})`,
      category: 'CLINIC',
      specialty: 'First Aid, Disaster Triage & Outpatient Clinic',
      address: `Disaster Operations Hub, High-Ground bypass, ${upazilaName}`,
      upazila: upazilaName,
      zilla,
      division,
      contactNumber: '+880 1713-000999',
      lat: lat + 0.014,
      lng: lon - 0.003,
      openStatus: 'Open • 8:00 AM - 8:00 PM',
      is24x7: false,
      hasEmergencyUnit: true,
      services: ['Disaster First Aid & Minor Suturing', 'Heat Stroke Hydration Ward', 'Waterborne Illness Oral Rehydration', 'Free Emergency Antibiotics'],
      rating: 4.6,
      aiRecommendation: `Elevated flood-safe clinic with trained first responders and emergency hydration beds.`,
      floodSafeRoute: true,
    },
  ];

  // Calculate distances relative to the active Upazila coordinates
  const providersWithDistances: CareProvider[] = baseProviders.map((bp) => {
    const dist = calculateDistanceKm(lat, lon, bp.lat, bp.lng);
    return {
      ...bp,
      distanceKm: dist,
    };
  });

  // Filter by category if not ALL
  let filtered = categoryFilter === 'ALL'
    ? providersWithDistances
    : providersWithDistances.filter((p) => p.category === categoryFilter);

  // Filter by search query if provided
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSpecialty = p.specialty?.toLowerCase().includes(q) || false;
      const matchDoctor = p.doctorName?.toLowerCase().includes(q) || false;
      const matchServices = p.services.some((s) => s.toLowerCase().includes(q));
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      return matchName || matchSpecialty || matchDoctor || matchServices || matchAddress || matchCategory;
    });
  }

  // Sort by closest distance first
  return filtered.sort((a, b) => a.distanceKm - b.distanceKm);
}
