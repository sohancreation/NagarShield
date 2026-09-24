/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Admin credentials as requested
export const ADMIN_CREDENTIALS = {
  email: 'sohanfardin546@gmail.com',
  password: '7642625274',
};
export const ADMIN_EMAIL = 'sohanfardin546@gmail.com';

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Error logging conforming to Firestore skill specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by Firebase skill
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection notice: Client appears offline or indexing.');
    }
  }
}
// Run connection test on boot
testFirebaseConnection();

// User Profile stored in Firestore: /users/{userId}
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  division: string;
  zilla: string;
  upazila: string;
  locationName: string;
  lat: number;
  lon: number;
  role: 'citizen' | 'urban_planner' | 'emergency_responder' | 'researcher' | 'planner' | 'emergency_officer' | 'super_admin';
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'suspended' | 'pending';
  authProvider?: 'email' | 'google' | 'admin_provisioned';
}

const LOCAL_USERS_STORAGE_KEY = 'nagarshield_registered_users_registry';

// Pre-seeded realistic mock users
const INITIAL_USERS_DATA: UserProfile[] = [
  {
    uid: 'admin_sohan_root',
    email: 'sohanfardin546@gmail.com',
    displayName: 'Sohanur Rahman (Super Admin)',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Mirpur',
    locationName: 'Mirpur (Dhaka, Dhaka)',
    lat: 23.8041,
    lon: 90.3687,
    role: 'super_admin',
    createdAt: '2026-09-24T08:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
    status: 'active',
    authProvider: 'email',
  },
  {
    uid: 'usr_planner_001',
    email: 'rafiq.planner@dhaka.gov.bd',
    displayName: 'Engr. Rafiqul Islam',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Mirpur',
    locationName: 'Mirpur (Dhaka, Dhaka)',
    lat: 23.8041,
    lon: 90.3687,
    role: 'urban_planner',
    createdAt: '2026-09-23T09:30:00.000Z',
    updatedAt: '2026-09-24T06:15:00.000Z',
    status: 'active',
    authProvider: 'email',
  },
  {
    uid: 'usr_researcher_002',
    email: 'nusrat.climate@buet.ac.bd',
    displayName: 'Dr. Nusrat Jahan',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Dhanmondi',
    locationName: 'Dhanmondi (Dhaka, Dhaka)',
    lat: 23.7465,
    lon: 90.3760,
    role: 'researcher',
    createdAt: '2026-09-22T14:20:00.000Z',
    updatedAt: '2026-09-24T07:45:00.000Z',
    status: 'active',
    authProvider: 'google',
  },
  {
    uid: 'usr_responder_003',
    email: 'tanvir.fire@fireservice.gov.bd',
    displayName: 'Capt. Tanvir Ahmed',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Kotwali',
    locationName: 'Kotwali (Dhaka, Dhaka)',
    lat: 23.7083,
    lon: 90.4075,
    role: 'emergency_responder',
    createdAt: '2026-09-21T11:10:00.000Z',
    updatedAt: '2026-09-23T18:00:00.000Z',
    status: 'active',
    authProvider: 'email',
  },
  {
    uid: 'usr_citizen_004',
    email: 'farzana.citizen@gmail.com',
    displayName: 'Farzana Akter',
    division: 'Dhaka',
    zilla: 'Dhaka',
    upazila: 'Uttara',
    locationName: 'Uttara (Dhaka, Dhaka)',
    lat: 23.8759,
    lon: 90.3795,
    role: 'citizen',
    createdAt: '2026-09-24T04:15:00.000Z',
    updatedAt: '2026-09-24T04:15:00.000Z',
    status: 'active',
    authProvider: 'google',
  },
  {
    uid: 'usr_planner_005',
    email: 'm.hasan@ctg-port.gov.bd',
    displayName: 'Mahmudul Hasan',
    division: 'Chattogram',
    zilla: 'Chattogram',
    upazila: 'Double Mooring',
    locationName: 'Double Mooring (Chattogram, Chattogram)',
    lat: 22.3384,
    lon: 91.8080,
    role: 'urban_planner',
    createdAt: '2026-09-20T16:40:00.000Z',
    updatedAt: '2026-09-22T09:00:00.000Z',
    status: 'active',
    authProvider: 'email',
  },
  {
    uid: 'usr_citizen_006',
    email: 'shaila.sylhet@gmail.com',
    displayName: 'Shaila Sharmin',
    division: 'Sylhet',
    zilla: 'Sylhet',
    upazila: 'Kotwali',
    locationName: 'Kotwali (Sylhet, Sylhet)',
    lat: 24.8949,
    lon: 91.8687,
    role: 'citizen',
    createdAt: '2026-09-24T09:50:00.000Z',
    updatedAt: '2026-09-24T09:50:00.000Z',
    status: 'active',
    authProvider: 'email',
  },
];

// Helper to get local user registry
export function getLocalUsersRegistry(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS_DATA));
      return INITIAL_USERS_DATA;
    }
    const parsed = JSON.parse(raw) as UserProfile[];
    // Ensure admin is always present
    if (!parsed.some((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())) {
      parsed.unshift(INITIAL_USERS_DATA[0]);
      localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.warn('Error reading local users registry', e);
    return INITIAL_USERS_DATA;
  }
}

// Helper to save local user registry
export function saveLocalUsersRegistry(users: UserProfile[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Error saving local users registry', e);
  }
}

// Fetch user profile from Firestore (with local fallback)
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const docPath = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore fetchUserProfile fallback to local store:', err);
  }

  // Fallback to local store
  const localList = getLocalUsersRegistry();
  return localList.find((u) => u.uid === uid) || null;
}

// Save or update user profile in Firestore and sync local store
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const payload: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
    createdAt: profile.createdAt || new Date().toISOString(),
    status: profile.status || 'active',
    authProvider: profile.authProvider || 'email',
  };

  // Sync with local registry
  try {
    const users = getLocalUsersRegistry();
    const existingIdx = users.findIndex((u) => u.uid === profile.uid || (profile.email && u.email.toLowerCase() === profile.email.toLowerCase()));
    if (existingIdx >= 0) {
      users[existingIdx] = { ...users[existingIdx], ...payload };
    } else {
      users.unshift(payload);
    }
    saveLocalUsersRegistry(users);
  } catch (e) {
    console.warn('Failed to sync to local users registry', e);
  }

  // Attempt Firestore write
  const docPath = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), payload, { merge: true });
  } catch (err) {
    console.warn('Firestore saveUserProfile offline/mock note:', err);
  }
}

// Fetch ALL users for the Admin Panel
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const localUsers = getLocalUsersRegistry();

  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    if (!querySnapshot.empty) {
      const remoteUsers: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        remoteUsers.push(docSnap.data() as UserProfile);
      });

      // Merge remote and local (avoiding duplicates)
      const mergedMap = new Map<string, UserProfile>();
      localUsers.forEach((u) => mergedMap.set(u.uid, u));
      remoteUsers.forEach((u) => mergedMap.set(u.uid, u));

      const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      saveLocalUsersRegistry(mergedList);
      return mergedList;
    }
  } catch (err) {
    console.warn('Firestore fetchAllUsers fallback to local registry:', err);
  }

  return localUsers;
}

// Delete user profile by UID (Admin Action)
export async function deleteUserProfile(uid: string): Promise<boolean> {
  // Prevent deleting root super admin
  const localUsers = getLocalUsersRegistry();
  const target = localUsers.find((u) => u.uid === uid);
  if (target && target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Root Super Administrator account cannot be deleted.');
  }

  // Remove from local store
  const updatedList = localUsers.filter((u) => u.uid !== uid);
  saveLocalUsersRegistry(updatedList);

  // Attempt to delete from Firestore
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Firestore deleteUserProfile note:', err);
  }

  return true;
}

// Google Sign-In with popup
export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

// Email/Password Sign-Up
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

// Email/Password Sign-In
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

// Sign Out
export async function logOut(): Promise<void> {
  await signOut(auth);
}
