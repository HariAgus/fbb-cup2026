import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

let firebaseAppInstance = null;
let authInstance = null;

export const getFirebaseAuth = (firebaseConfig) => {
  if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) {
    return null;
  }

  try {
    if (!getApps().length) {
      firebaseAppInstance = initializeApp(firebaseConfig);
    } else {
      firebaseAppInstance = getApp();
    }
    authInstance = getAuth(firebaseAppInstance);
    return authInstance;
  } catch (err) {
    console.error('Error initializing Firebase Auth:', err);
    return null;
  }
};

/**
 * Format Firebase Auth errors into friendly Indonesian messages
 */
export const formatAuthError = (errorCode, defaultMessage) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun pengguna ini telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan. Silakan periksa email Anda atau daftar baru.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return 'Alamat email ini sudah terdaftar. Silakan langsung login.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter kombinasi.';
    case 'auth/popup-closed-by-user':
      return 'Jendela login Google ditutup sebelum selesai.';
    case 'auth/cancelled-popup-request':
      return 'Permintaan login dibatalkan.';
    case 'auth/popup-blocked':
      return 'Jendela popup diblokir oleh browser. Harap izinkan popup.';
    case 'auth/operation-not-allowed':
      return 'Metode login ini belum diaktifkan di Firebase Console (Authentication -> Sign-in method).';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Harap tunggu beberapa saat sebelum mencoba lagi.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke jaringan internet. Periksa koneksi Anda.';
    case 'auth/invalid-api-key':
      return 'API Key Firebase tidak valid. Periksa konfigurasi di menu Database & Sync.';
    default:
      return defaultMessage || 'Terjadi kesalahan saat memproses autentikasi.';
  }
};

/**
 * Login with Email & Password
 */
export const loginWithEmail = async (firebaseConfig, email, password) => {
  const auth = getFirebaseAuth(firebaseConfig);
  if (!auth) {
    throw new Error('Konfigurasi Firebase belum diisi. Harap masukkan Project ID & API Key terlebih dahulu.');
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (err) {
    throw new Error(formatAuthError(err.code, err.message));
  }
};

/**
 * Register new Panitia/Admin with Email & Password
 */
export const registerWithEmail = async (firebaseConfig, email, password, displayName = '') => {
  const auth = getFirebaseAuth(firebaseConfig);
  if (!auth) {
    throw new Error('Konfigurasi Firebase belum diisi. Harap masukkan Project ID & API Key terlebih dahulu.');
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (err) {
    throw new Error(formatAuthError(err.code, err.message));
  }
};

/**
 * Login with Google OAuth Popup
 */
export const loginWithGoogle = async (firebaseConfig) => {
  const auth = getFirebaseAuth(firebaseConfig);
  if (!auth) {
    throw new Error('Konfigurasi Firebase belum diisi. Harap masukkan Project ID & API Key terlebih dahulu.');
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    throw new Error(formatAuthError(err.code, err.message));
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (firebaseConfig, email) => {
  const auth = getFirebaseAuth(firebaseConfig);
  if (!auth) {
    throw new Error('Konfigurasi Firebase belum diisi. Harap masukkan Project ID & API Key terlebih dahulu.');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  } catch (err) {
    throw new Error(formatAuthError(err.code, err.message));
  }
};

/**
 * Logout current user
 */
export const logoutFirebase = async (firebaseConfig) => {
  const auth = getFirebaseAuth(firebaseConfig);
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Error logging out from Firebase:', err);
    throw new Error('Gagal keluar dari akun.');
  }
};

/**
 * Subscribe to Auth State Changes
 */
export const subscribeToAuthState = (firebaseConfig, onUserChanged) => {
  const auth = getFirebaseAuth(firebaseConfig);
  if (!auth) {
    onUserChanged(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    onUserChanged(user);
  });
};
