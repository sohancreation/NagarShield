/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { IncidentReport, IncidentStatus, IncidentType, IncidentSeverity } from '../types/incident';

// Realistic sample seed incidents tailored to Bangladesh urban zones
export const DEFAULT_BANGLADESH_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-mirpur-waterlogging-1',
    type: 'waterlogging',
    severity: 'critical',
    title: 'Severe Waterlogging at Mirpur 10 Circle towards Kazipara',
    description: 'Road inundated under 35-45 cm muddy water after afternoon downpour. Rickshaws and small CNG auto-rickshaws stalled near bus counter. WASA pump vehicle needed.',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Mirpur',
    landmark: 'Mirpur 10 Roundabout, East Corner (Metro Pillar 248)',
    lat: 23.8071,
    lon: 90.3686,
    waterDepthCm: 38,
    photoPreset: 'waterlogged_road',
    status: 'dispatched',
    upvotes: 42,
    upvotedUserIds: ['user-demo-1'],
    reportedBy: {
      name: 'Tanvir Hossain',
      role: 'Citizen Commuter',
    },
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-mirpur-wire-2',
    type: 'electrical_wire',
    severity: 'critical',
    title: 'Exposed Sparking Live Cable on Flooded Sidewalk',
    description: 'DESCO transformer low-voltage cable snapped and submerged in storm puddle near shop arcade. Heavy hazard for school children and pedestrians.',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Mirpur',
    landmark: 'Mirpur Section 11 Block C, Avenue 4',
    lat: 23.8223,
    lon: 90.3654,
    photoPreset: 'electrical_wire',
    status: 'investigating',
    upvotes: 29,
    upvotedUserIds: [],
    reportedBy: {
      name: 'Engr. Sohanur Rahman',
      role: 'Urban Planner',
    },
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-mirpur-tree-3',
    type: 'fallen_tree',
    severity: 'medium',
    title: 'Fallen Krishnachura Tree Branch Blocking One Lane',
    description: 'Large bough cracked under squall wind, blocking southward traffic towards Mirpur 2 stadium. DNCC clean-up team requested.',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Mirpur',
    landmark: 'Near Mirpur Zoo Road Entrance',
    lat: 23.8152,
    lon: 90.3541,
    photoPreset: 'fallen_tree',
    status: 'reported',
    upvotes: 14,
    upvotedUserIds: [],
    reportedBy: {
      name: 'Rashedul Karim',
      role: 'Traffic Warden',
    },
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-mirpur-manhole-4',
    type: 'open_manhole',
    severity: 'high',
    title: 'Uncovered Storm Sewer Slab near Mirpur 1',
    description: 'Heavy runoff dislodged concrete manhole cover on main commercial alley. Red bamboo marker placed by shopkeepers to avert accidents.',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Mirpur',
    landmark: 'Mirpur 1 Muktijoddha Market Gate',
    lat: 23.7955,
    lon: 90.3537,
    waterDepthCm: 15,
    photoPreset: 'open_manhole',
    status: 'dispatched',
    upvotes: 38,
    upvotedUserIds: [],
    reportedBy: {
      name: 'Sumon Mia',
      role: 'Community Volunteer',
    },
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-dhanmondi-drain-5',
    type: 'waterlogging',
    severity: 'high',
    title: 'Knee-deep Waterlogging on Road 27 (Mirpur Road intersect)',
    description: 'Runoff backup from Dhanmondi Lake culvert overflow. Vehicles taking roundabout diversions.',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Dhanmondi',
    landmark: 'Dhanmondi Road 27 Old, Opposite Rapa Plaza',
    lat: 23.7541,
    lon: 90.3752,
    waterDepthCm: 30,
    photoPreset: 'waterlogged_road',
    status: 'resolved',
    upvotes: 56,
    upvotedUserIds: [],
    reportedBy: {
      name: 'Farhana Ahmed',
      role: 'Citizen',
    },
    createdAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'nagarshield_crowdsourced_incidents';

// Load cached local incidents
export function getLocalCachedIncidents(): IncidentReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_BANGLADESH_INCIDENTS;
}

export function saveLocalCachedIncidents(incidents: IncidentReport[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
  } catch {
    // ignore
  }
}

// Subscribe to real-time incident reports from Firestore
export function subscribeToIncidents(
  onUpdate: (incidents: IncidentReport[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Prime with local cached data immediately
  const initial = getLocalCachedIncidents();
  onUpdate(initial);

  try {
    const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteIncidents: IncidentReport[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<IncidentReport, 'id'>),
          }));

          // Merge with default seeds so user always has rich data
          const merged = [...remoteIncidents];
          for (const seed of DEFAULT_BANGLADESH_INCIDENTS) {
            if (!merged.some((i) => i.id === seed.id)) {
              merged.push(seed);
            }
          }
          // Sort newest first
          merged.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          saveLocalCachedIncidents(merged);
          onUpdate(merged);
        } else {
          // If Firestore is empty, seed initial reports
          seedInitialIncidents().catch(() => {});
        }
      },
      (err) => {
        console.warn('Firestore incident subscription notice:', err.message);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Incident subscription offline/fallback mode active:', err);
    return () => {};
  }
}

// Seed initial reports to Firestore if empty
async function seedInitialIncidents(): Promise<void> {
  try {
    for (const inc of DEFAULT_BANGLADESH_INCIDENTS) {
      const { id, ...data } = inc;
      await setDoc(doc(db, 'incidents', id), data, { merge: true });
    }
  } catch (err) {
    console.warn('Incident seed note:', err);
  }
}

// Create and submit a new Incident Report
export async function createIncidentReport(report: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedUserIds' | 'status'> & {
  status?: IncidentStatus;
}): Promise<IncidentReport> {
  const id = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newReport: IncidentReport = {
    ...report,
    id,
    status: report.status || 'reported',
    upvotes: 1,
    upvotedUserIds: report.reportedBy?.uid ? [report.reportedBy.uid] : [],
    createdAt: now,
    updatedAt: now,
  };

  // Optimistic local update
  const current = getLocalCachedIncidents();
  const updated = [newReport, ...current];
  saveLocalCachedIncidents(updated);

  // Sync to Firestore
  try {
    const { id: _, ...payload } = newReport;
    await setDoc(doc(db, 'incidents', id), payload);
  } catch (err) {
    console.warn('Incident report saved locally, remote sync pending:', err);
  }

  return newReport;
}

// Toggle upvote / community verification
export async function toggleIncidentUpvote(
  incidentId: string,
  userId: string
): Promise<{ upvoted: boolean; newCount: number }> {
  const current = getLocalCachedIncidents();
  const item = current.find((i) => i.id === incidentId);

  const hasUpvoted = item?.upvotedUserIds?.includes(userId) ?? false;
  const delta = hasUpvoted ? -1 : 1;
  const newCount = Math.max(0, (item?.upvotes || 0) + delta);

  // Optimistic local update
  const updated = current.map((inc) => {
    if (inc.id === incidentId) {
      const userList = inc.upvotedUserIds || [];
      const updatedUsers = hasUpvoted
        ? userList.filter((u) => u !== userId)
        : [...userList, userId];
      return {
        ...inc,
        upvotes: newCount,
        upvotedUserIds: updatedUsers,
      };
    }
    return inc;
  });
  saveLocalCachedIncidents(updated);

  // Sync to Firestore
  try {
    const incRef = doc(db, 'incidents', incidentId);
    await updateDoc(incRef, {
      upvotes: increment(delta),
      upvotedUserIds: hasUpvoted ? arrayRemove(userId) : arrayUnion(userId),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Incident upvote note:', err);
  }

  return { upvoted: !hasUpvoted, newCount };
}

// Update incident resolution lifecycle status
export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus
): Promise<void> {
  const current = getLocalCachedIncidents();
  const updated = current.map((i) =>
    i.id === incidentId ? { ...i, status, updatedAt: new Date().toISOString() } : i
  );
  saveLocalCachedIncidents(updated);

  try {
    const incRef = doc(db, 'incidents', incidentId);
    await updateDoc(incRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Incident status update note:', err);
  }
}
