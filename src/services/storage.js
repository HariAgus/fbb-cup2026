import { defaultFirebaseConfig, getFirebaseDb } from './firebaseConfig';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'fbb_merdeka_cup_2026_v7_grading';
const SETTINGS_STORAGE_KEY = 'fbb_merdeka_cloud_settings_v7';

// Initial official data for FBB Badminton Merdeka Cup 2026
export const initialTournamentData = {
  tournamentInfo: {
    id: 'fbb-merdeka-cup-2026',
    title: 'MERDEKA CUP 2026',
    subTitle: 'FUN BADMINTON BEKASI',
    edition: 'Fun Badminton Bekasi - Merdeka Cup 2026',
    venue: 'GOR Arena 74, Bekasi',
    date: '13 & 20 September 2026',
    posterUrl: '/images/merdeka-cup-2026-poster.jpg',
    primaryColor: '#E06020',
    status: 'Sedang Berlangsung',
    rules: {
      winPoints: 3,
      lossPoints: 0,
      playoffTopCount: 4
    }
  },
  players: [
    // Level A
    { id: 'p-1', name: 'Anthony Budi Santoso', gender: 'L', phone: '081234567890', level: 'A', teamId: null },
    { id: 'p-2', name: 'Kevin Andi Wijaya', gender: 'L', phone: '081234567891', level: 'A', teamId: null },
    { id: 'p-3', name: 'Eko Prasetyo', gender: 'L', phone: '081398765431', level: 'A', teamId: null },
    { id: 'p-4', name: 'Fajar Nugraha', gender: 'L', phone: '081398765432', level: 'A', teamId: null },
    { id: 'p-5', name: 'Dimas Setiawan', gender: 'L', phone: '081223344501', level: 'A', teamId: null },
    { id: 'p-6', name: 'Gilang Ramadhan', gender: 'L', phone: '081223344502', level: 'A', teamId: null },
    { id: 'p-7', name: 'Bambang Tri', gender: 'L', phone: '085712345001', level: 'A', teamId: null },
    { id: 'p-8', name: 'Yoga Pratama', gender: 'L', phone: '085712345002', level: 'A', teamId: null },
    { id: 'p-9', name: 'Taufik Hendra', gender: 'L', phone: '081198760001', level: 'A', teamId: null },
    { id: 'p-10', name: 'Marcus Gideon Rian', gender: 'L', phone: '081198760002', level: 'A', teamId: null },
    { id: 'p-11', name: 'Hendra Setiawan B.', gender: 'L', phone: '081198760003', level: 'A', teamId: null },
    { id: 'p-12', name: 'Mohammad Ahsan D.', gender: 'L', phone: '081198760004', level: 'A', teamId: null },

    // Level B
    { id: 'p-13', name: 'Marcus Rian Pratama', gender: 'L', phone: '081234567892', level: 'B', teamId: null },
    { id: 'p-14', name: 'Greysia Dedi Saputra', gender: 'L', phone: '081234567893', level: 'B', teamId: null },
    { id: 'p-15', name: 'Hendra Gunawan', gender: 'L', phone: '081398765433', level: 'B', teamId: null },
    { id: 'p-16', name: 'Ilham Jaya', gender: 'L', phone: '081398765434', level: 'B', teamId: null },
    { id: 'p-17', name: 'Reza Fauzi', gender: 'L', phone: '081223344503', level: 'B', teamId: null },
    { id: 'p-18', name: 'Arif Hidayat', gender: 'L', phone: '081223344504', level: 'B', teamId: null },
    { id: 'p-19', name: 'Doni Firmansyah', gender: 'L', phone: '085712345003', level: 'B', teamId: null },
    { id: 'p-20', name: 'Agus Wibowo', gender: 'L', phone: '085712345004', level: 'B', teamId: null },
    { id: 'p-21', name: 'Danang Suryo', gender: 'L', phone: '081198760005', level: 'B', teamId: null },
    { id: 'p-22', name: 'Rian Ardianto M.', gender: 'L', phone: '081198760006', level: 'B', teamId: null },
    { id: 'p-23', name: 'Shesar Hiren', gender: 'L', phone: '081198760007', level: 'B', teamId: null },
    { id: 'p-24', name: 'Chico Aura Wardoyo', gender: 'L', phone: '081198760008', level: 'B', teamId: null },

    // Level C
    { id: 'p-25', name: 'Apriyani Fikri Hidayat', gender: 'L', phone: '081234567894', level: 'C', teamId: null },
    { id: 'p-26', name: 'Jonatan Bayu Nugroho', gender: 'L', phone: '081234567895', level: 'C', teamId: null },
    { id: 'p-27', name: 'Satria Dewa', gender: 'L', phone: '081398765435', level: 'C', teamId: null },
    { id: 'p-28', name: 'Rizal Fahmi', gender: 'L', phone: '081398765436', level: 'C', teamId: null },
    { id: 'p-29', name: 'Doni Pratama', gender: 'L', phone: '081223344505', level: 'C', teamId: null },
    { id: 'p-30', name: 'Wahyu Hidayat', gender: 'L', phone: '081223344506', level: 'C', teamId: null },
    { id: 'p-31', name: 'Riki Subekti', gender: 'L', phone: '085712345005', level: 'C', teamId: null },
    { id: 'p-32', name: 'Hadi Gunawan', gender: 'L', phone: '085712345006', level: 'C', teamId: null },
    { id: 'p-33', name: 'Farhan Maulana', gender: 'L', phone: '081198760009', level: 'C', teamId: null },
    { id: 'p-34', name: 'Rizky Alamsyah', gender: 'L', phone: '081198760010', level: 'C', teamId: null },
    { id: 'p-35', name: 'Irfan Syahputra', gender: 'L', phone: '081198760011', level: 'C', teamId: null },
    { id: 'p-36', name: 'Lukman Hakim', gender: 'L', phone: '081198760012', level: 'C', teamId: null }
  ],
  teams: [],
  matches: [],
  knockoutMatches: [
    {
      id: 'sf-1',
      stage: 'Semifinal 1',
      matchTitle: 'Juara 1 vs Juara 3 Klasemen',
      team1Placeholder: 'Juara 1 Klasemen',
      team2Placeholder: 'Juara 3 Klasemen',
      team1Id: null,
      team2Id: null,
      team1PlayerIds: [],
      team2PlayerIds: [],
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date: '2026-09-19',
      time: '14:00 WIB'
    },
    {
      id: 'sf-2',
      stage: 'Semifinal 2',
      matchTitle: 'Juara 2 vs Juara 4 Klasemen',
      team1Placeholder: 'Juara 2 Klasemen',
      team2Placeholder: 'Juara 4 Klasemen',
      team1Id: null,
      team2Id: null,
      team1PlayerIds: [],
      team2PlayerIds: [],
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date: '2026-09-19',
      time: '15:30 WIB'
    },
    {
      id: 'final',
      stage: 'Grand Final FBB Badminton 2026',
      matchTitle: 'Pemenang Semifinal 1 vs Pemenang Semifinal 2',
      team1Placeholder: 'Pemenang Semifinal 1 (Juara 1 vs 3)',
      team2Placeholder: 'Pemenang Semifinal 2 (Juara 2 vs 4)',
      team1Id: null,
      team2Id: null,
      team1PlayerIds: [],
      team2PlayerIds: [],
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date: '2026-09-20',
      time: '10:00 WIB'
    }
  ],
  doorprizes: []
};

export const initialCloudSettings = {
  activeProvider: 'firebase',
  googleSheets: {
    webAppUrl: '',
    sheetName: 'FBB_BADMINTON_2026',
    autoSync: true,
    lastSync: null
  },
  firebase: {
    ...defaultFirebaseConfig,
    autoSync: true,
    lastSync: null
  }
};

export const loadTournamentData = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return initialTournamentData;
    const parsed = JSON.parse(raw);
    if (!parsed.players || parsed.players.length === 0) {
      return initialTournamentData;
    }
    return parsed;
  } catch (err) {
    return initialTournamentData;
  }
};

export const saveTournamentData = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
};

export const loadCloudSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return initialCloudSettings;
    const parsed = JSON.parse(raw);
    return {
      ...initialCloudSettings,
      ...parsed,
      firebase: {
        ...defaultFirebaseConfig,
        ...(parsed.firebase || {}),
        apiKey: parsed.firebase?.apiKey || defaultFirebaseConfig.apiKey,
        projectId: parsed.firebase?.projectId || defaultFirebaseConfig.projectId,
        authDomain: parsed.firebase?.authDomain || defaultFirebaseConfig.authDomain,
        storageBucket: parsed.firebase?.storageBucket || defaultFirebaseConfig.storageBucket,
        messagingSenderId: parsed.firebase?.messagingSenderId || defaultFirebaseConfig.messagingSenderId,
        appId: parsed.firebase?.appId || defaultFirebaseConfig.appId,
        measurementId: parsed.firebase?.measurementId || defaultFirebaseConfig.measurementId,
        collectionName: parsed.firebase?.collectionName || defaultFirebaseConfig.collectionName,
        documentId: parsed.firebase?.documentId || defaultFirebaseConfig.documentId
      }
    };
  } catch (err) {
    return initialCloudSettings;
  }
};

export const saveCloudSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    return false;
  }
};

// Google Sheets integration
export const syncWithGoogleSheets = async (webAppUrl, dataToSend = null) => {
  if (!webAppUrl) throw new Error('Google Apps Script Web App URL belum diisi');

  if (dataToSend) {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'save',
        payload: dataToSend,
        timestamp: new Date().toISOString()
      })
    });
    return await response.json();
  } else {
    const response = await fetch(`${webAppUrl}?action=get&t=${Date.now()}`);
    const result = await response.json();
    return result.data;
  }
};

// Firebase Firestore integration
export const getFirestoreInstance = (firebaseConfig) => {
  return getFirebaseDb(firebaseConfig);
};

// Real-time listener for Firestore document
export const subscribeToTournamentData = (firebaseConfig, onDataReceived, onError) => {
  try {
    const db = getFirestoreInstance(firebaseConfig);
    const colName = firebaseConfig?.collectionName || defaultFirebaseConfig.collectionName;
    const docId = firebaseConfig?.documentId || firebaseConfig?.docId || defaultFirebaseConfig.documentId;
    const docRef = doc(db, colName, docId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          if (remoteData && remoteData.players) {
            onDataReceived(remoteData);
          }
        }
      },
      (err) => {
        console.warn('Firestore subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to Firestore:', err);
    return () => { };
  }
};

// Format Firestore error messages for users
const formatFirestoreError = (err) => {
  const msg = err?.message || '';
  const code = err?.code || '';

  if (code === 'permission-denied' || msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
    return 'Izin ditolak (Permission Denied). Pastikan Security Rules di Firebase Console mengizinkan akses tulis (Rules -> allow read, write: if true;).';
  }
  if (code === 'unavailable' || msg.includes('unavailable') || msg.includes('UNAVAILABLE') || msg.includes('timeout') || msg.includes('Timeout')) {
    return 'Koneksi Firestore timeout / tidak dapat terhubung. Periksa koneksi internet, Project ID, dan pastikan Firestore Database sudah dibuat di Firebase Console.';
  }
  if (code === 'not-found' || msg.includes('not-found') || msg.includes('NOT_FOUND')) {
    return 'Database Cloud Firestore belum dibuat. Buka Firebase Console -> Firestore Database -> Create database.';
  }
  if (code === 'invalid-argument' || msg.includes('invalid-argument')) {
    return 'Format data tidak valid untuk Firestore. Harap periksa kembali.';
  }
  return msg || 'Gagal terhubung ke Cloud Firestore.';
};

export const syncWithFirebase = async (firebaseConfig, dataToSend = null) => {
  const db = getFirestoreInstance(firebaseConfig);
  const colName = firebaseConfig?.collectionName || defaultFirebaseConfig.collectionName;
  const docId = firebaseConfig?.documentId || firebaseConfig?.docId || defaultFirebaseConfig.documentId;
  const docRef = doc(db, colName, docId);

  // 8-second Timeout Guard to prevent infinite hang
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Koneksi ke Firestore timeout (8 detik). Pastikan Firestore Database sudah diaktifkan di Firebase Console dan Security Rules mengizinkan write.'));
    }, 8000);
  });

  try {
    if (dataToSend) {
      // Sanitize data: remove undefined values and ensure clean plain objects
      const sanitizedData = JSON.parse(JSON.stringify(dataToSend));

      const writePromise = setDoc(
        docRef,
        {
          ...sanitizedData,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      await Promise.race([writePromise, timeoutPromise]);
      return { success: true, message: 'Data turnamen berhasil disimpan ke Firebase Firestore!' };
    } else {
      const readPromise = getDoc(docRef);
      const snapshot = await Promise.race([readPromise, timeoutPromise]);
      if (snapshot && snapshot.exists()) {
        return snapshot.data();
      } else {
        throw new Error(`Dokumen "${docId}" dalam koleksi "${colName}" belum ditemukan di Firebase Firestore.`);
      }
    }
  } catch (err) {
    throw new Error(formatFirestoreError(err));
  }
};


