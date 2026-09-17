import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

export interface AuthError {
  code: string;
  message: string;
}

export const getReadableAuthErrorMessage = (error: unknown): string => {
  const err = error as { code?: string; message?: string } | null | undefined;
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/user-not-found':
      return 'No account was found with this email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to too many failed attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    default:
      return err?.message || 'An unexpected authentication error occurred. Please try again.';
  }
};

export const signUpUser = async (
  email: string,
  pass: string,
  fullName: string
): Promise<FirebaseUser> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please check your .env credentials.');
  }

  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (fullName.trim()) {
    await updateProfile(credential.user, {
      displayName: fullName.trim(),
    });
  }

  return credential.user;
};

export const signInUser = async (email: string, pass: string): Promise<FirebaseUser> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please check your .env credentials.');
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
};

export const signOutUser = async (): Promise<void> => {
  if (!isFirebaseConfigured || !auth) {
    return;
  }
  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please check your .env credentials.');
  }
  await sendPasswordResetEmail(auth, email.trim());
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
