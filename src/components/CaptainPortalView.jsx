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
  Trophy
} from 'lucide-react';

// --- Captain Authentication Panel ---
const CaptainLoginPanel = ({ teams, onLogin }) => {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
};// --- Grade badge helper ---
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
  isSemifinal,
  usedMatches = []
}) => {
  const currentMatch = details.round || '';

  return (
    <div
      className="captain-card-item"
      style={{ borderTop: `4px solid ${isSemifinal ? '#D97706' : (teamColor || '#E06020')}` }}
    >
      {/* Card Header — no "Babak Penyisihan X" subtitle */}
      <div className="captain-card-header">
        <div className={`card-number-badge ${isSemifinal ? 'badge-semifinal' : ''}`}>
          {card.cardIndex}
        </div>
        <div>
          <div className="captain-card-title">{card.cardTitle}</div>
          {currentMatch && (
            <div className={`card-round-tag ${isSemifinal ? 'round-semifinal' : ''}`} style={{ marginTop: '2px' }}>
              {currentMatch}
            </div>
          )}
        </div>
        {isSemifinal && (
          <span className="ml-auto">
            <Trophy size={18} className="text-amber-500" />
          </span>
        )}
      </div>

      {/* Partai Player Details — matches admin FormationsView style */}
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

      {/* Manual Match Detail Input - Hanya Babak / Match ke berapa */}
      <div className="captain-card-inputs">
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

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
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
            Kapten tim dapat menentukan urutan Babak / Match (Match 1 - 6) untuk setiap kartu formasi secara mandiri menggunakan kode akses dari admin.
          </p>
        </div>
        <CaptainLoginPanel teams={teams} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="captain-portal-container">
      <div className="captain-auth-banner">
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
            <div className="captain-auth-team-name">{authenticatedTeam?.name}</div>
            <div className="captain-auth-team-meta">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Masuk sebagai Kapten • Kode: <b>{captainCode}</b></span>
            </div>
          </div>
        </div>
        <div className="captain-auth-actions">
          <span className="captain-auth-roster">
            <Users size={14} />
            {teamPlayers.length} Pemain
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-secondary text-xs font-bold"
            title="Keluar dari sesi kapten"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <div className="captain-edit-notice">
        <Info size={15} className="flex-shrink-0 text-blue-500" />
        <span>
          Pilih <b>Babak / Match (Match 1 s/d 6)</b> untuk setiap kartu formasi di bawah ini, lalu klik <b>Simpan Detail Pertandingan</b>. Setiap match hanya dapat dipilih pada 1 kartu formasi.
        </span>
      </div>

      {formationData ? (
        <div className="captain-cards-grid">
          {(formationData.cards || []).map((card) => {
            const isSemifinal = card.cardIndex === 6;
            // Get all used match values on OTHER cards
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
                isSemifinal={isSemifinal}
                usedMatches={usedMatches}
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
            {isSaved ? (
              <span className="captain-save-ok">
                <Check size={15} className="text-emerald-600" />
                Detail pertandingan tersimpan!
              </span>
            ) : (
              <span className="text-muted text-sm">
                Belum disimpan — klik tombol Simpan Detail setelah selesai mengisi.
              </span>
            )}
          </div>
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
        </div>
      )}
    </div>
  );
};
