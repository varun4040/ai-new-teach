import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  if (!auth.currentUser) return;
  try {
    await getDocFromServer(doc(db, 'students', auth.currentUser.uid));
  } catch (error: any) {
    console.warn('Firebase Firestore running in offline/cached mode:', error?.message || 'connection pending');
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google sign-in popup notice:', error?.code || error?.message || error);
    if (
      error?.code === 'auth/network-request-failed' ||
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/popup-closed-by-user'
    ) {
      throw new Error(
        'Google Sign-In popup was blocked or restricted in this browser frame. You can export lesson reports directly from the State Drawer.'
      );
    }
    throw error;
  }
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function saveSessionToFirestore(userId: string, sessionData: any) {
  const sessionId = `session_${Date.now()}`;
  const path = `sessions/${sessionId}`;
  try {
    await setDoc(doc(db, 'sessions', sessionId), {
      sessionId,
      userId,
      studentName: sessionData.student?.name || 'Student',
      subject: sessionData.subject || 'Math',
      chapter: sessionData.chapter || 'Chapter',
      currentConcept: sessionData.currentConcept || '',
      understandingEstimate: sessionData.understandingEstimate || 70,
      conceptsMastered: sessionData.conceptsMastered || [],
      misconceptions: sessionData.misconceptions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserSessionsFromFirestore(userId: string) {
  const path = 'sessions';
  try {
    const q = query(collection(db, 'sessions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const sessions: any[] = [];
    querySnapshot.forEach((docSnap) => {
      sessions.push(docSnap.data());
    });
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
