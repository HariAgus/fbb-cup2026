import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'fbb_merdeka_cup_2026_v7_grading';
const SETTINGS_STORAGE_KEY = 'fbb_merdeka_cloud_settings_v7';

// Initial default seed data for FBB Badminton Merdeka Cup 2026
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
  // Master Pool Pemain Terdaftar (36 Pemain: 12 Level A, 12 Level B, 12 Level C)
  players: [
    // Level A (12 Pemain Unggulan)
    { id: 'p-1', name: 'Anthony Budi Santoso', gender: 'L', phone: '081234567890', level: 'A', teamId: 'team-1' },
    { id: 'p-2', name: 'Kevin Andi Wijaya', gender: 'L', phone: '081234567891', level: 'A', teamId: 'team-1' },
    { id: 'p-3', name: 'Eko Prasetyo', gender: 'L', phone: '081398765431', level: 'A', teamId: 'team-2' },
    { id: 'p-4', name: 'Fajar Nugraha', gender: 'L', phone: '081398765432', level: 'A', teamId: 'team-2' },
    { id: 'p-5', name: 'Dimas Setiawan', gender: 'L', phone: '081223344501', level: 'A', teamId: 'team-3' },
    { id: 'p-6', name: 'Gilang Ramadhan', gender: 'L', phone: '081223344502', level: 'A', teamId: 'team-3' },
    { id: 'p-7', name: 'Bambang Tri', gender: 'L', phone: '085712345001', level: 'A', teamId: 'team-4' },
    { id: 'p-8', name: 'Yoga Pratama', gender: 'L', phone: '085712345002', level: 'A', teamId: 'team-4' },
    { id: 'p-9', name: 'Taufik Hendra', gender: 'L', phone: '081198760001', level: 'A', teamId: 'team-5' },
    { id: 'p-10', name: 'Marcus Gideon Rian', gender: 'L', phone: '081198760002', level: 'A', teamId: 'team-5' },
    { id: 'p-11', name: 'Hendra Setiawan B.', gender: 'L', phone: '081198760003', level: 'A', teamId: 'team-6' },
    { id: 'p-12', name: 'Mohammad Ahsan D.', gender: 'L', phone: '081198760004', level: 'A', teamId: 'team-6' },

    // Level B (12 Pemain Menengah)
    { id: 'p-13', name: 'Marcus Rian Pratama', gender: 'L', phone: '081234567892', level: 'B', teamId: 'team-1' },
    { id: 'p-14', name: 'Greysia Dedi Saputra', gender: 'L', phone: '081234567893', level: 'B', teamId: 'team-1' },
    { id: 'p-15', name: 'Hendra Gunawan', gender: 'L', phone: '081398765433', level: 'B', teamId: 'team-2' },
    { id: 'p-16', name: 'Ilham Jaya', gender: 'L', phone: '081398765434', level: 'B', teamId: 'team-2' },
    { id: 'p-17', name: 'Reza Fauzi', gender: 'L', phone: '081223344503', level: 'B', teamId: 'team-3' },
    { id: 'p-18', name: 'Arif Hidayat', gender: 'L', phone: '081223344504', level: 'B', teamId: 'team-3' },
    { id: 'p-19', name: 'Doni Firmansyah', gender: 'L', phone: '085712345003', level: 'B', teamId: 'team-4' },
    { id: 'p-20', name: 'Agus Wibowo', gender: 'L', phone: '085712345004', level: 'B', teamId: 'team-4' },
    { id: 'p-21', name: 'Danang Suryo', gender: 'L', phone: '081198760005', level: 'B', teamId: 'team-5' },
    { id: 'p-22', name: 'Rian Ardianto M.', gender: 'L', phone: '081198760006', level: 'B', teamId: 'team-5' },
    { id: 'p-23', name: 'Shesar Hiren', gender: 'L', phone: '081198760007', level: 'B', teamId: 'team-6' },
    { id: 'p-24', name: 'Chico Aura Wardoyo', gender: 'L', phone: '081198760008', level: 'B', teamId: 'team-6' },

    // Level C (12 Pemain Pemula)
    { id: 'p-25', name: 'Apriyani Fikri Hidayat', gender: 'L', phone: '081234567894', level: 'C', teamId: 'team-1' },
    { id: 'p-26', name: 'Jonatan Bayu Nugroho', gender: 'L', phone: '081234567895', level: 'C', teamId: 'team-1' },
    { id: 'p-27', name: 'Satria Dewa', gender: 'L', phone: '081398765435', level: 'C', teamId: 'team-2' },
    { id: 'p-28', name: 'Rizal Fahmi', gender: 'L', phone: '081398765436', level: 'C', teamId: 'team-2' },
    { id: 'p-29', name: 'Doni Pratama', gender: 'L', phone: '081223344505', level: 'C', teamId: 'team-3' },
    { id: 'p-30', name: 'Wahyu Hidayat', gender: 'L', phone: '081223344506', level: 'C', teamId: 'team-3' },
    { id: 'p-31', name: 'Riki Subekti', gender: 'L', phone: '085712345005', level: 'C', teamId: 'team-4' },
    { id: 'p-32', name: 'Hadi Gunawan', gender: 'L', phone: '085712345006', level: 'C', teamId: 'team-4' },
    { id: 'p-33', name: 'Farhan Maulana', gender: 'L', phone: '081198760009', level: 'C', teamId: 'team-5' },
    { id: 'p-34', name: 'Rizky Alamsyah', gender: 'L', phone: '081198760010', level: 'C', teamId: 'team-5' },
    { id: 'p-35', name: 'Irfan Syahputra', gender: 'L', phone: '081198760011', level: 'C', teamId: 'team-6' },
    { id: 'p-36', name: 'Lukman Hakim', gender: 'L', phone: '081198760012', level: 'C', teamId: 'team-6' }
  ],
  // Teams Terdaftar (6 Tim PB Seimbang: Masing-masing 2 Level A, 2 Level B, 2 Level C)
  teams: [
    {
      id: 'team-1',
      name: 'PB Garuda FBB',
      shortName: 'GDA',
      captain: 'Anthony Budi Santoso',
      phone: '081234567890',
      color: '#E06020',
      logo: '🏸',
      playerIds: ['p-1', 'p-2', 'p-13', 'p-14', 'p-25', 'p-26']
    },
    {
      id: 'team-2',
      name: 'PB Thunder Smash',
      shortName: 'THW',
      captain: 'Eko Prasetyo',
      phone: '081398765432',
      color: '#3B82F6',
      logo: '⚡',
      playerIds: ['p-3', 'p-4', 'p-15', 'p-16', 'p-27', 'p-28']
    },
    {
      id: 'team-3',
      name: 'PB Phoenix Shuttle',
      shortName: 'PHX',
      captain: 'Dimas Setiawan',
      phone: '081223344556',
      color: '#EF4444',
      logo: '🔥',
      playerIds: ['p-5', 'p-6', 'p-17', 'p-18', 'p-29', 'p-30']
    },
    {
      id: 'team-4',
      name: 'PB Sparta Netters',
      shortName: 'SPT',
      captain: 'Bambang Tri',
      phone: '085712345678',
      color: '#10B981',
      logo: '🛡️',
      playerIds: ['p-7', 'p-8', 'p-19', 'p-20', 'p-31', 'p-32']
    },
    {
      id: 'team-5',
      name: 'PB Rajawali Smash',
      shortName: 'RJW',
      captain: 'Taufik Hendra',
      phone: '081198760001',
      color: '#8B5CF6',
      logo: '🦅',
      playerIds: ['p-9', 'p-10', 'p-21', 'p-22', 'p-33', 'p-34']
    },
    {
      id: 'team-6',
      name: 'PB Bintang Jaya',
      shortName: 'BTJ',
      captain: 'Hendra Setiawan B.',
      phone: '081198760003',
      color: '#EC4899',
      logo: '⭐',
      playerIds: ['p-11', 'p-12', 'p-23', 'p-24', 'p-35', 'p-36']
    }
  ],
  matches: [
    {
      id: 'match-1',
      stage: 'league',
      round: 'Matchday 1',
      team1Id: 'team-1',
      team2Id: 'team-2',
      team1PlayerIds: ['p-1'],
      team2PlayerIds: ['p-7'],
      team1Score: 2,
      team2Score: 1,
      detailScores: '21-18, 19-21, 21-15',
      status: 'finished',
      date: '2026-09-15',
      time: '09:00 WIB',
      pitch: 'Court 1 Badminton'
    },
    {
      id: 'match-2',
      stage: 'league',
      round: 'Matchday 1',
      team1Id: 'team-3',
      team2Id: 'team-4',
      team1PlayerIds: ['p-14', 'p-15'],
      team2PlayerIds: ['p-20', 'p-21'],
      team1Score: 2,
      team2Score: 0,
      detailScores: '21-14, 21-16',
      status: 'finished',
      date: '2026-09-15',
      time: '10:30 WIB',
      pitch: 'Court 2 Badminton'
    },
    {
      id: 'match-3',
      stage: 'league',
      round: 'Matchday 2',
      team1Id: 'team-1',
      team2Id: 'team-3',
      team1PlayerIds: ['p-2', 'p-4'],
      team2PlayerIds: ['p-13', 'p-16'],
      team1Score: 2,
      team2Score: 1,
      detailScores: '21-19, 18-21, 21-17',
      status: 'finished',
      date: '2026-09-16',
      time: '09:00 WIB',
      pitch: 'Court 1 Badminton'
    },
    {
      id: 'match-4',
      stage: 'league',
      round: 'Matchday 2',
      team1Id: 'team-2',
      team2Id: 'team-4',
      team1PlayerIds: ['p-7'],
      team2PlayerIds: ['p-19'],
      team1Score: 2,
      team2Score: 0,
      detailScores: '21-12, 21-15',
      status: 'finished',
      date: '2026-09-16',
      time: '10:30 WIB',
      pitch: 'Court 2 Badminton'
    },
    {
      id: 'match-5',
      stage: 'league',
      round: 'Matchday 3',
      team1Id: 'team-1',
      team2Id: 'team-4',
      team1PlayerIds: ['p-2', 'p-3'],
      team2PlayerIds: ['p-20', 'p-21'],
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date: '2026-09-17',
      time: '09:00 WIB',
      pitch: 'Court 1 Badminton'
    },
    {
      id: 'match-6',
      stage: 'league',
      round: 'Matchday 3',
      team1Id: 'team-2',
      team2Id: 'team-3',
      team1PlayerIds: ['p-7'],
      team2PlayerIds: ['p-13'],
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date: '2026-09-17',
      time: '10:30 WIB',
      pitch: 'Court 2 Badminton'
    }
  ],
  knockoutMatches: [
    {
      id: 'sf-1',
      stage: 'Semifinal 1',
      matchTitle: 'Peringkat 1 vs Peringkat 4',
      team1Placeholder: 'Peringkat 1 Klasemen (PB Garuda FBB)',
      team2Placeholder: 'Peringkat 4 Klasemen (PB Sparta Netters)',
      team1Id: 'team-1',
      team2Id: 'team-4',
      team1PlayerIds: ['p-1'],
      team2PlayerIds: ['p-19'],
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
      matchTitle: 'Peringkat 2 vs Peringkat 3',
      team1Placeholder: 'Peringkat 2 Klasemen (PB Thunder Smash)',
      team2Placeholder: 'Peringkat 3 Klasemen (PB Phoenix Shuttle)',
      team1Id: 'team-2',
      team2Id: 'team-3',
      team1PlayerIds: ['p-7'],
      team2PlayerIds: ['p-13'],
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
      team1Placeholder: 'Pemenang SF 1',
      team2Placeholder: 'Pemenang SF 2',
      team1Id: null,
      team2Id: null,
      team1PlayerIds: [],
      team2PlayerIds: [],
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date: '2026-09-20',
      time: '16:00 WIB'
    }
  ]
};

export const initialCloudSettings = {
  activeProvider: 'local',
  googleSheets: {
    webAppUrl: '',
    sheetName: 'FBB_BADMINTON_2026',
    autoSync: true,
    lastSync: null
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    collectionName: 'fbb_badminton_tournaments',
    documentId: 'cup2026',
    autoSync: false,
    lastSync: null
  }
};

export const loadTournamentData = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return initialTournamentData;
    const parsed = JSON.parse(raw);
    if (!parsed.players || !parsed.teams || parsed.players.length === 0) {
      return initialTournamentData;
    }
    // Normalize missing player levels
    const total = parsed.players.length;
    const normalizedPlayers = parsed.players.map((p, idx) => {
      if (p.level && ['A', 'B', 'C'].includes(p.level)) return p;
      // Default balanced assignment if level missing
      const oneThird = Math.ceil(total / 3);
      let assignedLevel = 'B';
      if (idx < oneThird) assignedLevel = 'A';
      else if (idx < oneThird * 2) assignedLevel = 'B';
      else assignedLevel = 'C';
      return { ...p, level: assignedLevel };
    });

    return { ...parsed, players: normalizedPlayers };
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
    return { ...initialCloudSettings, ...JSON.parse(raw) };
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
let firebaseAppInstance = null;
let firestoreDbInstance = null;

const getFirestoreInstance = (firebaseConfig) => {
  if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) {
    throw new Error('Konfigurasi Firebase belum lengkap (Project ID & API Key wajib diisi)');
  }
  if (!getApps().length) {
    firebaseAppInstance = initializeApp(firebaseConfig);
  } else {
    firebaseAppInstance = getApp();
  }
  firestoreDbInstance = getFirestore(firebaseAppInstance);
  return firestoreDbInstance;
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
  if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) {
    throw new Error('Project ID dan API Key Firebase wajib diisi terlebih dahulu di tab Firebase.');
  }

  const db = getFirestoreInstance(firebaseConfig);
  const colName = firebaseConfig.collectionName || 'tournaments';
  const docId = firebaseConfig.docId || firebaseConfig.documentId || 'fbb_merdeka_cup_2026';
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
