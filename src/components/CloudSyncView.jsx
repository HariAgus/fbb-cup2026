import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptTemplate';
import { 
  Cloud, 
  FileSpreadsheet, 
  Flame, 
  Download, 
  Upload, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle,
  Database,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const CloudSyncView = () => {
  const { 
    cloudSettings, 
    setCloudSettings, 
    syncLoading, 
    syncToGoogleSheets, 
    loadFromGoogleSheets, 
    syncToFirebase, 
    loadFromFirebase,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    currentUser,
    logoutAdmin,
    showToast 
  } = useTournament();

  const [activeTab, setActiveTab] = useState('googlesheets'); // 'googlesheets' | 'firebase' | 'backup'
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    showToast('Kode Apps Script berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleCopyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopiedRules(true);
    showToast('Security Rules Firestore disalin ke clipboard!');
    setTimeout(() => setCopiedRules(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importDataJSON(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="cloud-sync-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Cloud className="text-primary" size={26} />
            Cloud Database & Sinkronisasi
          </h2>
          <p className="view-subtitle">
            Hubungkan data turnamen FBB Cup 2026 ke Google Sheets atau Firebase Firestore secara real-time.
          </p>
        </div>
      </div>

      {/* Cloud Provider Tabs */}
      <div className="cloud-tabs-row">
        <button
          onClick={() => setActiveTab('googlesheets')}
          className={`cloud-tab-btn ${activeTab === 'googlesheets' ? 'active' : ''}`}
        >
          <FileSpreadsheet size={18} className="text-emerald-400" />
          <span>Google Sheets Webhook</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`cloud-tab-btn ${activeTab === 'firebase' ? 'active' : ''}`}
        >
          <Flame size={18} className="text-primary" />
          <span>Firebase Firestore</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`cloud-tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
        >
          <Database size={18} className="text-cyan-400" />
          <span>Backup & Restore JSON</span>
        </button>
      </div>

      {/* TAB 1: GOOGLE SHEETS */}
      {activeTab === 'googlesheets' && (
        <div className="cloud-content-card glass-card">
          <div className="card-badge-header">
            <div className="flex items-center gap-2">
              <span className="badge badge-finished">Google Sheets API Sync</span>
              {cloudSettings.googleSheets?.lastSync && (
                <span className="text-xs text-muted">
                  Terakhir sync: {cloudSettings.googleSheets.lastSync}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowScriptModal(true)}
              className="btn btn-sm btn-outline-primary"
            >
              <HelpCircle size={15} />
              <span>Panduan & Kode Apps Script</span>
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            Sinkronkan seluruh tim, grup, pertandingan, dan tabel klasemen FBB Cup 2026 ke dalam spreadsheet Google Sheets Anda secara otomatis.
          </p>

          <div className="form-group">
            <label className="form-label">Google Apps Script Web App URL</label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={cloudSettings.googleSheets?.webAppUrl || ''}
              onChange={(e) =>
                setCloudSettings({
                  ...cloudSettings,
                  googleSheets: { ...cloudSettings.googleSheets, webAppUrl: e.target.value }
                })
              }
              className="form-control font-mono text-sm"
            />
            <span className="text-xs text-muted mt-1">
              Dapatkan URL ini dari Deploy Google Apps Script di Spreadsheet Anda (akses: 'Anyone').
            </span>
          </div>

          <div className="cloud-action-buttons">
            <button
              onClick={syncToGoogleSheets}
              disabled={syncLoading}
              className="btn btn-primary"
            >
              <RefreshCw size={17} className={syncLoading ? 'animate-spin' : ''} />
              <span>{syncLoading ? 'Menyimpan...' : 'Kirim Data ke Google Sheets'}</span>
            </button>

            <button
              onClick={loadFromGoogleSheets}
              disabled={syncLoading}
              className="btn btn-secondary"
            >
              <Download size={17} />
              <span>Tarik Data dari Google Sheets</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FIREBASE FIRESTORE */}
      {activeTab === 'firebase' && (
        <div className="cloud-content-card glass-card">
          <div className="card-badge-header">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary">Firebase Cloud Firestore</span>
              {cloudSettings.firebase?.lastSync && (
                <span className="text-xs text-muted">
                  Terakhir sync: {cloudSettings.firebase.lastSync}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRulesModal(!showRulesModal)}
                className="btn btn-sm btn-outline-primary"
                title="Lihat konfigurasi Security Rules Firestore"
              >
                <HelpCircle size={14} />
                <span>Panduan Security Rules</span>
              </button>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-secondary"
              >
                <span>Firebase Console</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Security Rules Helper Banner */}
          {showRulesModal && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl mb-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-amber-700" />
                  <span>Pengaturan Security Rules Firebase Firestore:</span>
                </div>
                <button
                  onClick={handleCopyRules}
                  className="btn btn-xs btn-primary py-1 px-2.5 text-3xs font-bold"
                >
                  {copiedRules ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedRules ? 'Tersalin!' : 'Salin Rules'}</span>
                </button>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Jika status terus-menerus menyimpan atau gagal izin, pastikan tab <b>Firestore Database ➔ Rules</b> di Firebase Console diatur agar mengizinkan akses baca & tulis:
              </p>
              <pre className="bg-amber-950 text-amber-100 p-2.5 rounded-lg text-2xs font-mono overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Mode publik turnamen
    }
  }
}`}
              </pre>
            </div>
          )}

          {/* Auth Status Strip */}
          {currentUser ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <span className="online-dot" />
                <span>Login sebagai: <b>{currentUser.email}</b> ({currentUser.displayName || 'Panitia'})</span>
              </div>
              <button
                onClick={logoutAdmin}
                className="text-xs font-bold text-red-600 hover:text-red-700 underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-900">
              ℹ️ Sesi lokal aktif. Anda dapat langsung menyimpan ke Firestore atau menghubungkan akun Firebase di menu Login Panitia.
            </div>
          )}

          <div className="firebase-grid-inputs">
            <div className="form-group">
              <label className="form-label">Project ID</label>
              <input
                type="text"
                placeholder="fbb-cup-2026"
                value={cloudSettings.firebase?.projectId || ''}
                onChange={(e) =>
                  setCloudSettings({
                    ...cloudSettings,
                    firebase: { ...cloudSettings.firebase, projectId: e.target.value }
                  })
                }
                className="form-control font-mono text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={cloudSettings.firebase?.apiKey || ''}
                onChange={(e) =>
                  setCloudSettings({
                    ...cloudSettings,
                    firebase: { ...cloudSettings.firebase, apiKey: e.target.value }
                  })
                }
                className="form-control font-mono text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama Koleksi (Collection)</label>
              <input
                type="text"
                placeholder="tournaments"
                value={cloudSettings.firebase?.collectionName || 'tournaments'}
                onChange={(e) =>
                  setCloudSettings({
                    ...cloudSettings,
                    firebase: { ...cloudSettings.firebase, collectionName: e.target.value }
                  })
                }
                className="form-control font-mono text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">ID Dokumen (Document ID)</label>
              <input
                type="text"
                placeholder="fbb_merdeka_cup_2026"
                value={cloudSettings.firebase?.docId || 'fbb_merdeka_cup_2026'}
                onChange={(e) =>
                  setCloudSettings({
                    ...cloudSettings,
                    firebase: { ...cloudSettings.firebase, docId: e.target.value }
                  })
                }
                className="form-control font-mono text-xs"
              />
            </div>
          </div>

          <div className="cloud-action-buttons mt-4">
            <button
              onClick={syncToFirebase}
              disabled={syncLoading}
              className="btn btn-primary"
            >
              <RefreshCw size={17} className={syncLoading ? 'animate-spin' : ''} />
              <span>{syncLoading ? 'Menghubungkan ke Firestore...' : 'Simpan Data ke Firestore'}</span>
            </button>

            <button
              onClick={loadFromFirebase}
              disabled={syncLoading}
              className="btn btn-secondary"
            >
              <Download size={17} />
              <span>{syncLoading ? 'Mengambil Data...' : 'Tarik Data dari Firestore'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="cloud-content-card glass-card">
          <div className="card-badge-header">
            <span className="badge badge-gold">Local Backup & JSON Data</span>
          </div>

          <div className="backup-actions-grid">
            {/* Export */}
            <div className="backup-box">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Download size={18} className="text-primary" /> Export Data Turnamen
              </h4>
              <p className="text-xs text-muted mb-4">
                Download seluruh konfigurasi tim, peserta, jadwal, dan skor ke file JSON sebagai cadangan offline.
              </p>
              <button onClick={exportDataJSON} className="btn btn-primary w-full">
                <Download size={16} /> Download File JSON
              </button>
            </div>

            {/* Import */}
            <div className="backup-box">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Upload size={18} className="text-cyan-600" /> Restore / Import File
              </h4>
              <p className="text-xs text-muted mb-4">
                Unggah file JSON cadangan untuk memulihkan seluruh data turnamen.
              </p>
              <label className="btn btn-secondary w-full cursor-pointer">
                <Upload size={16} /> Pilih File JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Reset */}
            <div className="backup-box">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <RefreshCw size={18} className="text-rose-600" /> Reset ke Data Awal
              </h4>
              <p className="text-xs text-muted mb-4">
                Kembalikan turnamen ke data bawaan lengkap FBB Cup 2026 (Daftar tim 6 peserta & sampel skor).
              </p>
              <button
                onClick={() => {
                  if (confirm('Yakin ingin mereset seluruh data turnamen ke contoh awal FBB Cup 2026?')) {
                    resetToSampleData();
                  }
                }}
                className="btn btn-danger w-full"
              >
                Reset Data Turnamen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCRIPT MODAL GUIDE FOR GOOGLE SHEETS */}
      {showScriptModal && (
        <div className="modal-overlay" onClick={() => setShowScriptModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-600" size={22} />
                <h3 className="font-bold text-lg text-gray-900">Panduan Google Apps Script</h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="btn-icon-subtle text-muted"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <span>Buka Google Sheets baru di <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-primary-light underline">sheets.new</a></span>
                </div>
                <div className="guide-step">
                  <span className="step-num">2</span>
                  <span>Klik menu <b>Extensions (Ekstensi) &gt; Apps Script</b></span>
                </div>
                <div className="guide-step">
                  <span className="step-num">3</span>
                  <span>Salin kode di bawah ini lalu tempel ke editor Apps Script</span>
                </div>
                <div className="guide-step">
                  <span className="step-num">4</span>
                  <span>Klik <b>Deploy (Terapkan) &gt; New deployment</b>, pilih tipe <b>Web app</b>, isi Who has access: <b>Anyone</b></span>
                </div>
                <div className="guide-step">
                  <span className="step-num">5</span>
                  <span>Salin URL Web App yang muncul ke kolom input di aplikasi ini!</span>
                </div>
              </div>

              <div className="script-code-box">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-muted">google-apps-script.js</span>
                  <button onClick={handleCopyScript} className="btn btn-sm btn-primary">
                    {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedScript ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="script-pre-code">{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowScriptModal(false)} className="btn btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
