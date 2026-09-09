import React, { useState, useMemo, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Key,
  LogIn,
  ChevronDown,
  ShieldCheck,
  Save,
  MapPin,
  Swords,
  Calendar,
  Users,
  Check,
  AlertTriangle,
  Info,
  LogOut,
  Clock,
  Lock,
  CalendarClock,
  Copy,
  Shield,
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';
import { formatDeadlineDisplay, getDeadlineTimeRemaining } from '../utils/dateUtils';

// --- Captain Authentication Panel ---
const CaptainLoginPanel = ({ teams, onLogin, globalDeadline = null }) => {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) || null,
    [teams, selectedTeamId]
  );

  const deadline = globalDeadline || selectedTeam?.formationDeadline || null;
  const deadlineInfo = useMemo(() => getDeadlineTimeRemaining(deadline), [deadline]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!selectedTeamId) {
      setError('Silakan pilih tim Anda terlebih dahulu.');
      return;
    }
    if (!code.trim()) {
      setError('Masukkan kode akses yang diberikan oleh admin/panitia.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const success = onLogin(selectedTeamId, code.trim());
      if (!success) {
        setError('Kode Kapten tidak valid. Periksa kembali kode dari admin panitia.');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="captain-login-wrapper">
      <div className="captain-login-card">
        <div className="captain-login-header">
          <div className="captain-login-icon">
            <Key size={32} className="text-amber-500" />
          </div>
          <h2 className="captain-login-title">Akses Kapten Tim</h2>
          <p className="captain-login-desc">
            Masukkan kode akses yang diberikan oleh <b>admin/panitia</b> untuk mengisi detail pertandingan kartu formasi tim Anda.
          </p>
        </div>

        {/* Global Deadline Info on Login Screen */}
        {deadline && (
          <div
            className={`captain-login-deadline-card ${
              deadlineInfo.isExpired ? 'deadline-locked' : 'deadline-active'
            }`}
          >
            <div className="captain-login-deadline-icon">
              {deadlineInfo.isExpired ? <Lock size={18} /> : <Clock size={18} />}
            </div>
            <div className="captain-login-deadline-body">
              <div className="captain-login-deadline-header">
                <span className="captain-login-deadline-title">
                  {deadlineInfo.isExpired ? 'Batas Waktu Pengisian Ditutup' : 'Batas Waktu Input Formasi'}
                </span>
                <span
                  className={`captain-login-deadline-badge ${
                    deadlineInfo.isExpired ? 'badge-locked' : 'badge-active'
                  }`}
                >
                  {deadlineInfo.isExpired ? '🔒 Terkunci' : '⏰ Aktif'}
                </span>
              </div>
              <div className="captain-login-deadline-time">
                <span>{formatDeadlineDisplay(deadline)}</span>
                <span className="deadline-dot">•</span>
                <span className="deadline-countdown-highlight">{deadlineInfo.text}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="captain-login-form">
          <div className="captain-form-group">
            <label className="captain-form-label">
              <Users size={14} />
              Pilih Tim Anda
            </label>
            <div className="captain-select-wrapper">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="captain-form-select"
                required
              >
                <option value="">-- Pilih Tim Anda --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo || '🏸'} {t.name} ({t.shortName || 'PB'})
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="captain-select-arrow" />
            </div>
          </div>

          <div className="captain-form-group">
            <label className="captain-form-label">
              <Key size={14} />
              Kode Akses Kapten
            </label>
            <input
              type="text"
              placeholder="Contoh: FBB-A3X9"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="captain-form-input"
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="captain-error-msg">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full justify-center captain-login-btn"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Masuk sebagai Kapten</span>
              </>
            )}
          </button>
        </form>

        <div className="captain-login-note">
          <Info size={13} className="flex-shrink-0 text-blue-500" />
          <span>
            Kode akses bersifat unik per tim dan hanya bisa didapatkan dari admin panitia turnamen.
            Hubungi panitia jika Anda belum memiliki kode.
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Grade badge helper ---
const renderGradeBadge = (level = 'B') => {
  const lvl = level || 'B';
  const map = { A: 'a', 'B+': 'b-plus', B: 'b', C: 'c' };
  const cls = map[lvl] || 'b';
  const icons = { A: '👑', 'B+': '⭐', B: '⚡', C: '🛡️' };
  return (
    <span className={`badge-level badge-level-${cls} inline-flex items-center gap-1 text-2xs py-0.5 px-1.5 font-extrabold rounded-md`}>
      <span>{icons[lvl] || '⚡'}</span>
      <span>Grade {lvl}</span>
    </span>
  );
};

// --- Player tile (matches admin style) ---
const renderPlayerTile = (player, slotCode) => (
  <div className="player-tile-card">
    <div className="player-tile-top">
      <span className="player-slot-tag">
        Pemain {slotCode ? slotCode.replace('P', '') : ''}
      </span>
      <span className="player-tile-shuttle" title="Pemain Ganda">🏸</span>
    </div>
    <div className="player-name-main" title={player?.name}>
      {player?.name || <span className="player-unassigned">Belum diset</span>}
    </div>
  </div>
);

// --- Card Detail Inputs (rich admin-style layout) ---
const CaptainCardInput = ({
  card,
  details,
  onChange,
  teamColor,
  teamName,
  captainName,
  isSemifinal,
  usedMatches = [],
  isExpired = false,
  onCopySingle = null,
  isCopied = false
}) => {
  const currentMatch = details.round || '';

  return (
    <div
      className={`captain-card-item ${isExpired ? 'card-readonly-mode' : ''}`}
      style={{ borderTop: `4px solid ${isSemifinal ? '#D97706' : (teamColor || '#E06020')}` }}
    >
      {/* Card Header */}
      <div className="captain-card-header">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`card-number-badge ${isSemifinal ? 'badge-semifinal' : ''}`}>
            {card.cardIndex}
          </div>
          <div className="min-w-0 flex-1">
            <div className="captain-card-title">{card.cardTitle}</div>
            {currentMatch ? (
              <div className="card-round-tag round-assigned" style={{ marginTop: '2px' }}>
                🎯 {currentMatch}
              </div>
            ) : (
              <div className="card-round-tag round-unassigned" style={{ marginTop: '2px' }}>
                ⏳ Belum Diset Match-nya
              </div>
            )}
          </div>
        </div>

        {onCopySingle && (
          <button
            type="button"
            onClick={() => onCopySingle(card)}
            className="btn-icon-subtle text-xs p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs"
            title="Salin rincian kartu ini ke WhatsApp"
          >
            {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>

      {/* Partai Player Details */}
      <div className="partai-rows-container">
        {/* Partai 1: Grade AB */}
        <div className="partai-row-box partai-ab">
          <div className="partai-header-row">
            <span className="partai-order-label">
              <span className="partai-num-pill">1</span> PARTAI 1
            </span>
            <span className="partai-grade-badge badge-partai-ab">GRADE AB</span>
          </div>
          <div className="partai-players-split">
            {renderPlayerTile(card.partai1?.player1, card.partai1?.p1Slot || 'P1')}
            <div className="pair-and-badge">&</div>
            {renderPlayerTile(card.partai1?.player2, card.partai1?.p2Slot || 'P4')}
          </div>
        </div>

        {/* Partai 2: Grade AC */}
        <div className="partai-row-box partai-ac">
          <div className="partai-header-row">
            <span className="partai-order-label">
              <span className="partai-num-pill">2</span> PARTAI 2
            </span>
            <span className="partai-grade-badge badge-partai-ac">GRADE AC</span>
          </div>
          <div className="partai-players-split">
            {renderPlayerTile(card.partai2?.player1, card.partai2?.p1Slot || 'P2')}
            <div className="pair-and-badge">&</div>
            {renderPlayerTile(card.partai2?.player2, card.partai2?.p2Slot || 'P6')}
          </div>
        </div>

        {/* Partai 3: Grade B(+)B */}
        <div className="partai-row-box partai-bb">
          <div className="partai-header-row">
            <span className="partai-order-label">
              <span className="partai-num-pill">3</span> PARTAI 3
            </span>
            <span className="partai-grade-badge badge-partai-bb">GRADE B(+)B</span>
          </div>
          <div className="partai-players-split">
            {renderPlayerTile(card.partai3?.player1, card.partai3?.p1Slot || 'P3')}
            <div className="pair-and-badge">&</div>
            {renderPlayerTile(card.partai3?.player2, card.partai3?.p5Slot || 'P5')}
          </div>
        </div>
      </div>

      {/* Match Detail Section */}
      <div className="captain-card-inputs">
        {isExpired ? (
          <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <Calendar size={13} className="text-gray-500" />
              <span>Jadwal Babak / Match:</span>
            </div>
            {currentMatch ? (
              <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                🎯 {currentMatch}
              </span>
            ) : (
              <span className="text-2xs text-gray-500 italic font-medium bg-gray-200/70 px-2 py-0.5 rounded">
                Belum Ditentukan
              </span>
            )}
          </div>
        ) : (
          <div className="captain-input-group">
            <label className="captain-input-label">
              <Calendar size={13} />
              Babak / Match ke berapa:
            </label>
            <select
              value={currentMatch}
              onChange={(e) => onChange(card.cardIndex, 'round', e.target.value)}
              className="captain-input-field captain-select-field"
            >
              <option value="">-- Pilih Babak / Match (1 - 6) --</option>
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const matchValue = `Match ${num}`;
                const isUsed = usedMatches.includes(matchValue);
                return (
                  <option
                    key={num}
                    value={matchValue}
                    disabled={isUsed}
                  >
                    {matchValue} {isUsed ? '(Sudah dipilih di kartu lain)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Captain Portal View ---
export const CaptainPortalView = () => {
  const {
    data,
    getFormationCardsForTeam,
    updateTeamCardDetailsByCode,
    showToast
  } = useTournament();

  const teams = useMemo(() => data.teams || [], [data.teams]);
  const allPlayers = useMemo(() => data.players || [], [data.players]);

  const [authenticatedTeamId, setAuthenticatedTeamId] = useState(null);
  const [captainCode, setCaptainCode] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCardIndex, setCopiedCardIndex] = useState(null);
  const [copiedAllCards, setCopiedAllCards] = useState(false);

  const [localCardDetails, setLocalCardDetails] = useState({
    1: { round: '', court: '', opponent: '' },
    2: { round: '', court: '', opponent: '' },
    3: { round: '', court: '', opponent: '' },
    4: { round: '', court: '', opponent: '' },
    5: { round: '', court: '', opponent: '' },
    6: { round: '', court: '', opponent: '' }
  });

  const authenticatedTeam = useMemo(
    () => teams.find((t) => t.id === authenticatedTeamId) || null,
    [teams, authenticatedTeamId]
  );

  const teamPlayers = useMemo(() => {
    if (!authenticatedTeam) return [];
    return (authenticatedTeam.playerIds || [])
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter(Boolean);
  }, [authenticatedTeam, allPlayers]);

  const formationData = useMemo(() => {
    if (!authenticatedTeam) return null;
    return getFormationCardsForTeam(authenticatedTeam);
  }, [authenticatedTeam, getFormationCardsForTeam]);

  useEffect(() => {
    if (authenticatedTeam) {
      const saved = authenticatedTeam.formationCardDetails || {};
      setLocalCardDetails({
        1: { round: saved[1]?.round || '', court: saved[1]?.court || '', opponent: saved[1]?.opponent || '' },
        2: { round: saved[2]?.round || '', court: saved[2]?.court || '', opponent: saved[2]?.opponent || '' },
        3: { round: saved[3]?.round || '', court: saved[3]?.court || '', opponent: saved[3]?.opponent || '' },
        4: { round: saved[4]?.round || '', court: saved[4]?.court || '', opponent: saved[4]?.opponent || '' },
        5: { round: saved[5]?.round || '', court: saved[5]?.court || '', opponent: saved[5]?.opponent || '' },
        6: { round: saved[6]?.round || '', court: saved[6]?.court || '', opponent: saved[6]?.opponent || '' }
      });
      setIsSaved(false);
    }
  }, [authenticatedTeam]);

  const handleLogin = (teamId, code) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team || !team.captainCode) return false;
    if (team.captainCode.toUpperCase() !== code.toUpperCase()) return false;
    setAuthenticatedTeamId(teamId);
    setCaptainCode(code);
    return true;
  };

  const handleLogout = () => {
    setAuthenticatedTeamId(null);
    setCaptainCode('');
    setIsSaved(false);
  };

  const handleCardDetailChange = (cardIndex, field, value) => {
    setIsSaved(false);
    setLocalCardDetails((prev) => ({
      ...prev,
      [cardIndex]: {
        ...(prev[cardIndex] || { round: '', court: '', opponent: '' }),
        [field]: value
      }
    }));
  };

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const deadline = data.formationDeadline || authenticatedTeam?.formationDeadline || null;
  const deadlineInfo = useMemo(() => {
    return getDeadlineTimeRemaining(deadline);
  }, [deadline, currentTime]);
  const isExpired = deadlineInfo.isExpired;

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (isExpired) {
      showToast('Batas waktu pengisian formasi telah berakhir. Perubahan tidak dapat disimpan.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const success = await updateTeamCardDetailsByCode(
        authenticatedTeamId,
        captainCode,
        localCardDetails
      );
      if (success) {
        setIsSaved(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp copy single card for captain
  const handleCopySingleCard = (card) => {
    if (!authenticatedTeam) return;
    const details = localCardDetails[card.cardIndex] || {};
    const roundLabel = details.round || '-';

    const p1_p1 = card.partai1?.player1?.name || (card.partai1?.p1Slot || 'P1');
    const p1_p2 = card.partai1?.player2?.name || (card.partai1?.p2Slot || 'P4');
    const p2_p1 = card.partai2?.player1?.name || (card.partai2?.p1Slot || 'P2');
    const p2_p2 = card.partai2?.player2?.name || (card.partai2?.p2Slot || 'P6');
    const p3_p1 = card.partai3?.player1?.name || (card.partai3?.p1Slot || 'P3');
    const p3_p2 = card.partai3?.player2?.name || (card.partai3?.p5Slot || 'P5');

    let text = `🏸 *${card.cardTitle.toUpperCase()} - ${authenticatedTeam.name}*\n`;
    text += `*Kapten:* ${authenticatedTeam.captain || '-'}\n`;
    text += `*Dimainkan Pada:* ${roundLabel}\n`;
    text += `=====================================\n`;
    text += `1️⃣ *Partai 1 (Grade AB):* ${p1_p1} & ${p1_p2}\n`;
    text += `2️⃣ *Partai 2 (Grade AC):* ${p2_p1} & ${p2_p2}\n`;
    text += `3️⃣ *Partai 3 (Grade B(+)B):* ${p3_p1} & ${p3_p2}\n`;
    text += `=====================================\n`;
    text += `_Disahkan resmi oleh Kapten Tim ${authenticatedTeam.name}._`;

    navigator.clipboard.writeText(text);
    setCopiedCardIndex(card.cardIndex);
    showToast(`Rincian ${card.cardTitle} berhasil disalin ke WhatsApp!`, 'success');
    setTimeout(() => setCopiedCardIndex(null), 2000);
  };

  // WhatsApp copy all 6 cards for captain
  const handleCopyAllCards = () => {
    if (!authenticatedTeam || !formationData) return;
    let text = `🏸 *DAFTAR 6 KARTU FORMASI - ${authenticatedTeam.name.toUpperCase()}*\n`;
    text += `*Kapten:* ${authenticatedTeam.captain || '-'}\n`;
    text += `*Turnamen:* FBB Cup Badminton 2026\n`;
    text += `-------------------------------------\n\n`;

    (formationData.cards || []).forEach((card) => {
      const details = localCardDetails[card.cardIndex] || {};
      const roundLabel = details.round || '-';
      const p1_p1 = card.partai1?.player1?.name || (card.partai1?.p1Slot || 'P1');
      const p1_p2 = card.partai1?.player2?.name || (card.partai1?.p2Slot || 'P4');
      const p2_p1 = card.partai2?.player1?.name || (card.partai2?.p1Slot || 'P2');
      const p2_p2 = card.partai2?.player2?.name || (card.partai2?.p2Slot || 'P6');
      const p3_p1 = card.partai3?.player1?.name || (card.partai3?.p1Slot || 'P3');
      const p3_p2 = card.partai3?.player2?.name || (card.partai3?.p5Slot || 'P5');

      text += `📋 *${card.cardTitle.toUpperCase()}* (${roundLabel})\n`;
      text += `1️⃣ *Partai 1 (AB):* ${p1_p1} & ${p1_p2}\n`;
      text += `2️⃣ *Partai 2 (AC):* ${p2_p1} & ${p2_p2}\n`;
      text += `3️⃣ *Partai 3 (B(+)B):* ${p3_p1} & ${p3_p2}\n\n`;
    });

    text += `_Disahkan resmi oleh Kapten Tim ${authenticatedTeam.name}._`;

    navigator.clipboard.writeText(text);
    setCopiedAllCards(true);
    showToast('Format 6 Kartu berhasil disalin ke WhatsApp!', 'success');
    setTimeout(() => setCopiedAllCards(false), 2500);
  };

  if (!authenticatedTeamId) {
    return (
      <div className="captain-portal-container">
        <div className="captain-portal-hero">
          <div className="captain-portal-hero-badge">
            <ShieldCheck size={16} />
            <span>MODE KAPTEN TIM</span>
          </div>
          <h2 className="captain-portal-hero-title">
            📋 Portal Kartu Formasi Kapten
          </h2>
          <p className="captain-portal-hero-desc">
            Kapten tim dapat melihat susunan 6 kartu formasi pemain dan menentukan urutan Match (Match 1 - 6) secara mandiri menggunakan kode akses resmi.
          </p>
        </div>
        <CaptainLoginPanel
          teams={teams}
          onLogin={handleLogin}
          globalDeadline={data.formationDeadline || null}
        />
      </div>
    );
  }

  return (
    <div className="captain-portal-container">
      {/* Captain Auth Banner with Team Info */}
      <div className="captain-auth-banner glass-card">
        <div className="captain-auth-info">
          <div
            className="captain-auth-team-logo"
            style={{
              backgroundColor: `${authenticatedTeam?.color || '#E06020'}18`,
              borderColor: authenticatedTeam?.color || '#E06020'
            }}
          >
            <span>{authenticatedTeam?.logo || '🏸'}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="captain-auth-team-name">{authenticatedTeam?.name}</span>
              <span className="team-code-tag">{authenticatedTeam?.shortName || 'PB'}</span>
              <span
                className={`text-3xs px-2 py-0.5 rounded-full font-bold uppercase ${
                  isExpired ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isExpired ? '🔒 Mode Lihat (Read-Only)' : '⏰ Mode Edit Terbuka'}
              </span>
            </div>
            <div className="captain-auth-team-meta mt-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>
                Kapten: <b>{authenticatedTeam?.captain || '-'}</b> • Kode: <b>{captainCode}</b>
              </span>
            </div>
          </div>
        </div>

        <div className="captain-auth-actions">
          <button
            onClick={handleCopyAllCards}
            className="btn btn-secondary text-xs font-bold"
            title="Salin seluruh 6 kartu ke WhatsApp"
          >
            {copiedAllCards ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedAllCards ? 'Tersalin!' : 'Salin 6 Kartu (WA)'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-secondary text-xs font-bold text-gray-600 hover:text-rose-600"
            title="Keluar dari sesi kapten"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* 🌟 Informative Status Card (Enhanced Display) */}
      {deadline && (
        <div className={`captain-info-status-card glass-card ${isExpired ? 'card-locked' : 'card-active'} mb-5`}>
          <div className="status-card-inner">
            <div className={`status-icon-badge ${isExpired ? 'locked' : 'active'}`}>
              {isExpired ? <Shield size={22} /> : <Clock size={22} />}
            </div>
            <div className="status-content flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`status-badge-tag ${isExpired ? 'locked' : 'active'}`}>
                  {isExpired ? '🔒 STATUS FORMASI FINAL & TERKUNCI' : '⏰ PENGISIAN BABAK / MATCH TERBUKA'}
                </span>
                <span
                  className={`text-2xs font-bold px-2 py-0.5 rounded ${
                    isExpired ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  {isExpired
                    ? `Batas Ditutup (${deadlineInfo.text})`
                    : `Sisa Waktu: ${deadlineInfo.text}`}
                </span>
              </div>
              <h4 className="status-card-heading">
                {isExpired
                  ? 'Akses Pengeditan Telah Berakhir — Anda Tetap Dapat Memeriksa & Menyalin Seluruh Kartu'
                  : 'Tentukan Urutan Match (Match 1 s/d 6) untuk Setiap Kartu Formasi'}
              </h4>
              <p className="status-card-text">
                {isExpired ? (
                  <span>
                    Batas waktu pengisian formasi turnamen telah resmi berakhir pada <b>{formatDeadlineDisplay(deadline)}</b>. Susunan pemain tiap partai telah dikunci oleh panitia. Anda dapat memeriksa susunan 6 kartu tim dan membagikannya ke WhatsApp.
                  </span>
                ) : (
                  <span>
                    Silakan tentukan nomor babak/match untuk masing-masing kartu di bawah ini sebelum batas akhir <b>{formatDeadlineDisplay(deadline)}</b>. Klik tombol <b>Simpan Detail Pertandingan</b> di bagian bawah setelah selesai.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {formationData ? (
        <div className="captain-cards-grid">
          {(formationData.cards || []).map((card) => {
            const isSemifinal = card.cardIndex === 6;
            const isCardCopied = copiedCardIndex === card.cardIndex;
            const usedMatches = Object.entries(localCardDetails)
              .filter(([idx, detail]) => String(idx) !== String(card.cardIndex) && Boolean(detail?.round))
              .map(([, detail]) => detail.round);

            return (
              <CaptainCardInput
                key={card.cardIndex}
                card={card}
                details={localCardDetails[card.cardIndex] || {}}
                onChange={handleCardDetailChange}
                teamColor={authenticatedTeam?.color}
                teamName={authenticatedTeam?.name}
                captainName={authenticatedTeam?.captain}
                isSemifinal={isSemifinal}
                usedMatches={usedMatches}
                isExpired={isExpired}
                onCopySingle={handleCopySingleCard}
                isCopied={isCardCopied}
              />
            );
          })}
        </div>
      ) : (
        <div className="captain-no-formation">
          <AlertTriangle size={40} className="text-amber-400 mb-3" />
          <p className="font-bold text-gray-700">Formasi belum disiapkan oleh admin.</p>
          <p className="text-sm text-muted mt-1">
            Admin perlu mengisi 6 slot pemain terlebih dahulu di panel admin.
          </p>
        </div>
      )}

      {formationData && (
        <div className="captain-save-bar">
          <div className="captain-save-status">
            {isExpired ? (
              <span className="text-rose-700 text-xs md:text-sm font-bold flex items-center gap-1.5">
                <Lock size={15} />
                <span>Mode Hanya Baca — Susunan kartu formasi telah terkunci secara permanen.</span>
              </span>
            ) : isSaved ? (
              <span className="captain-save-ok">
                <Check size={15} className="text-emerald-600" />
                <span>Detail pertandingan tersimpan ✓</span>
              </span>
            ) : (
              <span className="text-muted text-xs md:text-sm">
                Belum disimpan — klik tombol <b>Simpan Detail Pertandingan</b> setelah selesai mengisi.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAllCards}
              className="btn btn-secondary font-bold text-xs"
              title="Salin seluruh 6 kartu formasi ke WhatsApp"
            >
              {copiedAllCards ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedAllCards ? 'Tersalin!' : 'Salin Semua (WA)'}</span>
            </button>

            {!isExpired && (
              <button
                onClick={handleSave}
                className="btn btn-primary font-bold"
                disabled={isSaved || isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Menyimpan ke Firebase...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isSaved ? 'Tersimpan ✓' : 'Simpan Detail Pertandingan'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
