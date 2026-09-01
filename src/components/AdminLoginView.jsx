import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  Flame,
  AlertCircle,
  CheckCircle2,
  Settings2,
  ExternalLink
} from 'lucide-react';

export const AdminLoginView = () => {
  const {
    loginAdmin,
    resetAdminPassword,
    authLoading,
    cloudSettings,
    setCloudSettings
  } = useTournament();

  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirebaseConfigured = !!(cloudSettings?.firebase?.projectId && cloudSettings?.firebase?.apiKey);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFirebaseConfigured) {
      setErrorMessage('Konfigurasi Firebase belum diisi. Masukkan Project ID dan API Key terlebih dahulu.');
      setShowConfigHelper(true);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Harap isi alamat email dan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginAdmin(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFirebaseConfigured) {
      setErrorMessage('Konfigurasi Firebase belum diisi.');
      setShowConfigHelper(true);
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email akun panitia Anda.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetAdminPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa inbox/spam.');
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Background Glow Decorations */}
      <div className="login-bg-glow login-glow-1" />
      <div className="login-bg-glow login-glow-2" />

      <div className="admin-login-container">
        {/* Navigation back to User Portal */}
        <div className="login-back-bar">
          <Link to="/fbb-cup2026" className="back-link">
            <ArrowLeft size={16} />
            <span>Kembali ke Portal Publik</span>
          </Link>
          <span className="badge badge-primary text-xs">
            <Flame size={12} /> FBB Merdeka Cup 2026
          </span>
        </div>

        {/* Main Card */}
        <div className="admin-login-card glass-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-badge-icon">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h2 className="login-title">
              Portal Panitia <span className="text-primary">& Admin</span>
            </h2>
            <p className="login-subtitle">
              Autentikasi akun panitia resmi yang dibuat pada <b>Firebase Authentication Console</b>.
            </p>
          </div>

          {/* Firebase Config Notice if Not Configured */}
          {!isFirebaseConfigured && (
            <div className="firebase-warning-box">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed flex-1">
                  <b>Konfigurasi Firebase belum diisi:</b> Masukkan Project ID dan API Key dari Firebase Console agar sistem autentikasi dapat bekerja.
                  <button
                    type="button"
                    onClick={() => setShowConfigHelper(!showConfigHelper)}
                    className="ml-2 font-bold text-amber-900 underline hover:text-amber-950 inline-flex items-center gap-1"
                  >
                    <Settings2 size={12} /> {showConfigHelper ? 'Sembunyikan' : 'Isi Sekarang'}
                  </button>
                </div>
              </div>

              {showConfigHelper && (
                <div className="mt-3 pt-3 border-t border-amber-200/80 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-3xs font-bold text-amber-950 uppercase">Project ID</label>
                    <input
                      type="text"
                      placeholder="contoh: fbb-cup-2026"
                      value={cloudSettings.firebase?.projectId || ''}
                      onChange={(e) =>
                        setCloudSettings({
                          ...cloudSettings,
                          firebase: { ...cloudSettings.firebase, projectId: e.target.value }
                        })
                      }
                      className="form-control text-xs py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-bold text-amber-950 uppercase">API Key</label>
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
                      className="form-control font-mono text-xs py-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-3xs font-bold text-amber-950 uppercase">Auth Domain</label>
                    <input
                      type="text"
                      placeholder="fbb-cup-2026.firebaseapp.com"
                      value={cloudSettings.firebase?.authDomain || ''}
                      onChange={(e) =>
                        setCloudSettings({
                          ...cloudSettings,
                          firebase: { ...cloudSettings.firebase, authDomain: e.target.value }
                        })
                      }
                      className="form-control text-xs py-1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="auth-alert alert-error">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert alert-success">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM (PURE FIREBASE AUTH EMAIL & PASSWORD) */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Panitia / Admin</label>
                <div className="input-with-icon">
                  <Mail size={17} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="panitia@fbb.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control with-icon"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <Lock size={17} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi Firebase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control with-icon with-right-btn"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-right-btn"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="btn btn-primary btn-block btn-lg mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-sm" />
                    <span>Memverifikasi Akun Firebase...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Masuk ke Dashboard Panitia</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Kembali ke Form Login
                </button>
              </div>

              <p className="text-xs text-muted mb-4 leading-relaxed">
                Masukkan alamat email panitia yang terdaftar di Firebase Console. Link reset kata sandi akan dikirimkan langsung ke inbox email Anda.
              </p>

              <div className="form-group">
                <label className="form-label">Alamat Email Panitia</label>
                <div className="input-with-icon">
                  <Mail size={17} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="nama@fbb.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control with-icon"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="btn btn-primary btn-block btn-lg mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-sm" />
                    <span>Mengirim Link Reset...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Kirim Email Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="login-card-footer">
            <div className="flex items-center justify-between text-2xs text-muted">
              <span>🛡️ Secured by Firebase Auth</span>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-primary-light hover:underline flex items-center gap-1"
              >
                Firebase Console <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
