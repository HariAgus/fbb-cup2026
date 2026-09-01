import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useTournament } from '../context/TournamentContext';
import { doorprizeAudio } from '../services/doorprizeAudio';
import {
  Gift,
  Sparkles,
  Shuffle,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Share2,
  Users,
  Play,
  Layers,
  Search,
  Check,
  Crown,
  History,
  Phone
} from 'lucide-react';

const PRIZE_SUGGESTIONS = [
  '🔪 1 Set pisau',
  '🎒 Tas Sepatu Ortuseight',
  '🥤 Thumbler LocknLock',
  '🎽 Jersey Eksklusif FBB 2026',
  '🌬️ Mini Fan Portable',
  '☁️ Cushion Wrap Badminton',
  '🌂 Payung',
  '🎧 Advan TWS Bluetooth',
  '🧦 Kaos Kaki Badminton',
  '🎧 Booming True Wireles Stereo',
  '🎒 Tas Ransel badminton',
  '🎧 Headphone NOVABOOM',
  '🧵 Senar Raket Hundred',
  '⚡️Power Bank 1000mAh'
];

const WHEEL_COLORS = [
  '#E06020', '#2563EB', '#059669', '#7C3AED', '#D97706',
  '#DC2626', '#0891B2', '#4F46E5', '#16A34A', '#DB2777'
];

export const AdminDoorprizeView = () => {
  const { data, addDoorprizeDraw, deleteDoorprizeDraw, resetDoorprizeHistory, showToast } = useTournament();

  // Settings & Input State
  const [prizeName, setPrizeName] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [excludePreviousWinners, setExcludePreviousWinners] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchPool, setSearchPool] = useState('');
  const [isMuted, setIsMuted] = useState(doorprizeAudio.isMuted());

  // Spin Engine State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinMode, setSpinMode] = useState('wheel'); // 'wheel' or 'slot'
  const [currentSlotName, setCurrentSlotName] = useState('Siap Diundi');
  const [winnerResults, setWinnerResults] = useState(null);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const canvasRef = useRef(null);
  const wheelAngleRef = useRef(0);
  const animationFrameRef = useRef(null);

  const allPlayers = useMemo(() => data.players || [], [data.players]);
  const allTeams = useMemo(() => data.teams || [], [data.teams]);
  const doorprizes = useMemo(() => data.doorprizes || [], [data.doorprizes]);

  // Create team map for player lookups
  const teamMap = useMemo(() => {
    const map = {};
    allTeams.forEach((t) => {
      (t.playerIds || []).forEach((pid) => {
        map[pid] = t.name;
      });
    });
    return map;
  }, [allTeams]);

  // List of all player IDs who have already won any doorprize
  const previousWinnerIds = useMemo(() => {
    const ids = new Set();
    doorprizes.forEach((dp) => {
      (dp.winners || []).forEach((w) => {
        if (w.playerId) ids.add(w.playerId);
      });
    });
    return ids;
  }, [doorprizes]);

  // Eligible pool of players based on current filters
  const eligiblePlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      if (excludePreviousWinners && previousWinnerIds.has(p.id)) return false;
      if (selectedLevel !== 'ALL' && p.level !== selectedLevel) return false;
      if (searchPool.trim()) {
        const query = searchPool.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesTeam = (teamMap[p.id] || '').toLowerCase().includes(query);
        return matchesName || matchesTeam;
      }
      return true;
    });
  }, [allPlayers, excludePreviousWinners, previousWinnerIds, selectedLevel, searchPool, teamMap]);

  const totalDrawnPrizes = doorprizes.length;

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = doorprizeAudio.toggleMute();
    setIsMuted(muted);
  };

  // Draw the Canvas Wheel
  const drawWheel = useCallback((angle = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    const items = eligiblePlayers.length > 0 ? eligiblePlayers : [{ id: 'empty', name: 'Belum Ada Peserta' }];
    const totalSegments = Math.min(items.length, 36); // Display up to 36 distinct sectors for clarity
    const sliceAngle = (2 * Math.PI) / totalSegments;

    // Draw outer glow shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F172A';
    ctx.shadowColor = 'rgba(224, 96, 32, 0.4)';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    // Draw segments
    for (let i = 0; i < totalSegments; i++) {
      const player = items[i % items.length];
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Border between segments
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;

      const displayName = player.name.length > 15 ? player.name.substring(0, 14) + '…' : player.name;
      ctx.fillText(displayName, radius - 20, 4);
      ctx.restore();
    }

    // Outer Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Inner Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.fill();

    // Inner badge
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#E06020';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('🏸', centerX, centerY - 1);
    ctx.restore();
  }, [eligiblePlayers]);

  useEffect(() => {
    drawWheel(wheelAngleRef.current);
  }, [drawWheel]);

  // Execute Spin
  const handleStartSpin = () => {
    if (!prizeName.trim()) {
      showToast('Harap masukkan nama doorprize terlebih dahulu!', 'error');
      return;
    }
    if (eligiblePlayers.length === 0) {
      showToast('Tidak ada peserta yang memenuhi syarat di pool!', 'error');
      return;
    }

    const count = Math.min(Math.max(1, Number(winnerCount) || 1), eligiblePlayers.length);
    setIsSpinning(true);
    setWinnerResults(null);

    // Shuffle & Pick Random Winners
    const shuffled = [...eligiblePlayers].sort(() => 0.5 - Math.random());
    const selectedWinners = shuffled.slice(0, count).map((p) => ({
      playerId: p.id,
      playerName: p.name,
      playerLevel: p.level || 'B',
      teamName: teamMap[p.id] || 'Belum Ada Tim',
      phone: p.phone || ''
    }));

    if (spinMode === 'slot') {
      // Rapid Slot Machine Roll
      let iterations = 0;
      const maxIterations = 30;
      const interval = setInterval(() => {
        iterations++;
        const randomPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
        setCurrentSlotName(randomPlayer.name);
        doorprizeAudio.playTick(1 + (iterations / maxIterations) * 0.5);

        if (iterations >= maxIterations) {
          clearInterval(interval);
          finishSpin(selectedWinners);
        }
      }, 70);
    } else {
      // Realistic Wheel Spin Animation
      let currentAngle = wheelAngleRef.current;
      const totalSpins = 6 + Math.random() * 4; // 6 - 10 full turns
      const spinAngleTarget = totalSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
      const duration = 4500; // 4.5 seconds
      const startTime = performance.now();
      let lastTickAngle = currentAngle;

      const animateWheel = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease Out Cubic for realistic deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentSpinAngle = currentAngle + spinAngleTarget * easeOut;
        wheelAngleRef.current = currentSpinAngle;
        drawWheel(currentSpinAngle);

        // Play tick sound whenever crossing segment peg
        const angleDiff = Math.abs(currentSpinAngle - lastTickAngle);
        if (angleDiff > (Math.PI / 18)) {
          doorprizeAudio.playTick(1 + (1 - progress) * 0.4);
          lastTickAngle = currentSpinAngle;
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateWheel);
        } else {
          finishSpin(selectedWinners);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animateWheel);
    }
  };

  const finishSpin = (winners) => {
    setIsSpinning(false);
    setWinnerResults(winners);
    setIsCelebrationModalOpen(true);

    // Audio victory fanfare
    doorprizeAudio.playFanfare();

    // Trigger full celebratory confetti burst
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.7 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.7 }
      });
    }, 350);
  };

  // Save Confirmed Winners
  const handleSaveWinners = () => {
    if (!winnerResults || winnerResults.length === 0) return;

    addDoorprizeDraw({
      prizeName,
      quantity: winnerResults.length,
      winners: winnerResults
    });

    setIsCelebrationModalOpen(false);
    setWinnerResults(null);
    // Clear prize name to allow next draw
    setPrizeName('');
  };

  // Copy winners text for WhatsApp/broadcast
  const handleCopyWinners = (dp) => {
    const winnerNames = dp.winners.map((w, idx) => `  ${idx + 1}. ${w.playerName} (${w.teamName ? `Tim: ${w.teamName}, ` : ''}Level ${w.playerLevel})`).join('\n');
    const text = `🎉 *PEMENANG DOORPRIZE FBB MERDEKA CUP 2026* 🎉\n\n🎁 *Hadiah:* ${dp.prizeName}\n👥 *Pemenang Beruntung:*\n${winnerNames}\n\n_Selamat kepada para pemenang!_ 🏸`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(dp.id);
      showToast('Daftar pemenang berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  return (
    <div className="doorprize-container">
      {/* 🌟 Top Page Header & Live Stats */}
      <div className="doorprize-header-card glass-card">
        <div className="doorprize-header-left">
          <div className="doorprize-icon-badge">
            <Gift size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900">Spin & Undian Doorprize Turnamen</h2>
              <span className="badge badge-primary font-bold">Khusus Admin</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Kocok dan undi doorprize resmi dari seluruh data pemain terdaftar FBB Merdeka Cup 2026.
            </p>
          </div>
        </div>

        <div className="doorprize-header-stats">
          <div className="doorprize-stat-pill">
            <Users size={15} className="text-primary" />
            <div>
              <span className="stat-label">Pemain Terdaftar</span>
              <span className="stat-value">{allPlayers.length}</span>
            </div>
          </div>

          <div className="doorprize-stat-pill">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <div>
              <span className="stat-label">Pool Tersedia</span>
              <span className="stat-value text-emerald-600 font-bold">{eligiblePlayers.length}</span>
            </div>
          </div>

          <div className="doorprize-stat-pill">
            <Trophy size={15} className="text-amber-500" />
            <div>
              <span className="stat-label">Hadiah Terundi</span>
              <span className="stat-value text-amber-600 font-bold">{totalDrawnPrizes} Sesi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎰 Main Spin Panel Grid */}
      <div className="doorprize-main-grid">
        {/* Left Column: Draw Controls & Prize Setup */}
        <div className="doorprize-form-panel glass-card">
          <div className="panel-title-row">
            <h3 className="panel-title flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span>Pengaturan Undian</span>
            </h3>
            <button
              onClick={handleToggleMute}
              className={`sound-toggle-btn ${isMuted ? 'muted' : 'active'}`}
              title={isMuted ? 'Nyalakan Suara Undian' : 'Matikan Suara Undian'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span className="text-xs font-semibold">{isMuted ? 'Mute' : 'Sound ON'}</span>
            </button>
          </div>

          {/* Input Nama Doorprize */}
          <div className="form-group mb-4">
            <label className="form-label font-bold flex items-center justify-between">
              <span>Nama Hadiah / Doorprize <span className="text-danger">*</span></span>
              <span className="text-xs text-muted">Contoh: Raket Yonex</span>
            </label>
            <input
              type="text"
              className="form-control font-semibold"
              placeholder="Ketik nama hadiah doorprize..."
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
              disabled={isSpinning}
            />

            {/* Quick Suggestion Chips */}
            <div className="prize-chips-container mt-2">
              <span className="text-xs text-muted block mb-1">Pilihan Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRIZE_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrizeName(sug.replace(/^[^\s]+\s/, ''))}
                    className={`prize-chip ${prizeName === sug.replace(/^[^\s]+\s/, '') ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row: Jumlah Pemenang & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="form-group">
              <label className="form-label font-bold">Jumlah Pemenang (Slot)</label>
              <div className="quantity-stepper">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => setWinnerCount((prev) => Math.max(1, prev - 1))}
                  disabled={isSpinning || winnerCount <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, eligiblePlayers.length)}
                  className="quantity-input"
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isSpinning}
                />
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => setWinnerCount((prev) => Math.min(eligiblePlayers.length || 1, prev + 1))}
                  disabled={isSpinning || winnerCount >= eligiblePlayers.length}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-bold">Animasi Undian</label>
              <div className="spin-mode-selector">
                <button
                  type="button"
                  onClick={() => setSpinMode('wheel')}
                  className={`mode-btn ${spinMode === 'wheel' ? 'active' : ''}`}
                  disabled={isSpinning}
                >
                  <RotateCcw size={14} /> Roda Putar
                </button>
                <button
                  type="button"
                  onClick={() => setSpinMode('slot')}
                  className={`mode-btn ${spinMode === 'slot' ? 'active' : ''}`}
                  disabled={isSpinning}
                >
                  <Shuffle size={14} /> Slot Cepat
                </button>
              </div>
            </div>
          </div>

          {/* Pool & Filter Options */}
          <div className="pool-filter-box mb-4">
            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={13} /> Filter & Kriteria Peserta
            </h4>

            {/* Checkbox: Exclude previous winners */}
            <label className="checkbox-label flex items-start gap-2 cursor-pointer mb-2.5">
              <input
                type="checkbox"
                checked={excludePreviousWinners}
                onChange={(e) => setExcludePreviousWinners(e.target.checked)}
                disabled={isSpinning}
                className="mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-800">Keluarkan pemenang sebelumnya</span>
                <p className="text-muted text-[11px] leading-tight">
                  Pemain yang sudah pernah menang doorprize tidak akan masuk undian lagi ({previousWinnerIds.size} orang).
                </p>
              </div>
            </label>

            {/* Level Filter */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600 font-semibold">Filter Level:</span>
              <div className="level-pills-group">
                {['ALL', 'A', 'B', 'C'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`level-pill-btn ${selectedLevel === lvl ? 'active' : ''}`}
                    disabled={isSpinning}
                  >
                    {lvl === 'ALL' ? 'Semua' : `Level ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Search within pool */}
            <div className="search-pool-input-wrapper">
              <Search size={13} className="search-pool-icon" />
              <input
                type="text"
                placeholder="Cari pemain di pool..."
                className="search-pool-input text-xs"
                value={searchPool}
                onChange={(e) => setSearchPool(e.target.value)}
                disabled={isSpinning}
              />
            </div>
          </div>

          {/* Big Start Spin Trigger Button */}
          <button
            onClick={handleStartSpin}
            disabled={isSpinning || !prizeName.trim() || eligiblePlayers.length === 0}
            className="btn btn-primary btn-lg w-full spin-trigger-btn shadow-lg"
          >
            {isSpinning ? (
              <>
                <Shuffle size={20} className="animate-spin" />
                <span>Sedang Mengundi Pemenang...</span>
              </>
            ) : (
              <>
                <Play size={20} className="fill-current" />
                <span>PUTAR UNDIAN SEKARANG ({winnerCount} Pemenang)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Spinning Wheel / Stage Canvas */}
        <div className="doorprize-stage-panel glass-card">
          <div className="stage-header">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="font-bold text-gray-900 text-sm">Arena Putaran Undian</h3>
            </div>
            <span className="badge badge-outline text-xs">
              {eligiblePlayers.length} Nama di Piringan
            </span>
          </div>

          <div className="stage-canvas-area">
            {spinMode === 'wheel' ? (
              <div className="wheel-wrapper">
                {/* Pointer Indicator */}
                <div className="wheel-pointer-arrow">
                  <div className="pointer-triangle" />
                </div>

                <canvas
                  ref={canvasRef}
                  width={380}
                  height={380}
                  className="wheel-canvas"
                />

                {/* Center Spin Quick Button */}
                <button
                  type="button"
                  onClick={handleStartSpin}
                  disabled={isSpinning || !prizeName.trim() || eligiblePlayers.length === 0}
                  className={`wheel-center-overlay-btn ${isSpinning ? 'spinning' : ''}`}
                  title="Klik untuk memutar undian"
                >
                  <span className="text-xs font-black">{isSpinning ? '...' : 'SPIN'}</span>
                </button>
              </div>
            ) : (
              /* Digital Rapid Slot Machine View */
              <div className="slot-machine-wrapper">
                <div className="slot-machine-box">
                  <div className="slot-reel">
                    <div className="slot-icon-header">🏸 LUCKY DRAW 🏸</div>
                    <div className={`slot-name-display ${isSpinning ? 'rolling' : ''}`}>
                      {currentSlotName}
                    </div>
                    <div className="text-xs text-muted mt-2">
                      {isSpinning ? 'Mengacak seluruh data pemain...' : 'Klik PUTAR untuk mengacak'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Prize Name Display Badge */}
          <div className="current-prize-banner">
            <span className="prize-label">Hadiah yang diundi:</span>
            <span className="prize-title">{prizeName || 'Belum Ditentukan'}</span>
          </div>
        </div>
      </div>

      {/* 📜 Doorprize History Table (Admin Management) */}
      <div className="doorprize-history-section glass-card mt-8">
        <div className="history-header flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className="text-primary" />
            <div>
              <h3 className="font-bold text-gray-900">Riwayat Pengundian Doorprize ({doorprizes.length})</h3>
              <p className="text-xs text-muted">Seluruh daftar pemenang ini otomatis tampil di halaman publik pengunjung.</p>
            </div>
          </div>

          {doorprizes.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Yakin ingin mereset seluruh riwayat pemenang doorprize?')) {
                  resetDoorprizeHistory();
                }
              }}
              className="btn btn-sm btn-outline-danger"
            >
              <Trash2 size={14} /> <span>Reset Semua Riwayat</span>
            </button>
          )}
        </div>

        {doorprizes.length === 0 ? (
          <div className="empty-history-box text-center py-10">
            <div className="empty-icon-circle mx-auto mb-3">
              <Gift size={32} className="text-gray-400" />
            </div>
            <h4 className="font-bold text-gray-700 text-sm">Belum Ada Undian Doorprize</h4>
            <p className="text-xs text-muted max-w-md mx-auto mt-1">
              Masukkan nama hadiah di atas dan tekan tombol <b>PUTAR UNDIAN SEKARANG</b> untuk mengundi pemenang beruntung.
            </p>
          </div>
        ) : (
          <div className="doorprize-history-list space-y-4">
            {doorprizes.map((dp) => (
              <div key={dp.id} className="doorprize-history-item">
                <div className="history-item-top">
                  <div className="history-prize-badge">
                    <Trophy size={16} className="text-amber-500" />
                    <span className="font-bold text-gray-900">{dp.prizeName}</span>
                    <span className="badge badge-primary text-[11px] font-bold">
                      {dp.winners?.length || 1} Pemenang
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {new Date(dp.drawnAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </span>

                    <button
                      onClick={() => handleCopyWinners(dp)}
                      className="btn btn-xs btn-outline-primary"
                      title="Salin Pemenang untuk WhatsApp"
                    >
                      {copiedId === dp.id ? <Check size={12} /> : <Share2 size={12} />}
                      <span className="text-[11px]">{copiedId === dp.id ? 'Tersalin' : 'Share WA'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus catatan undian "${dp.prizeName}"?`)) {
                          deleteDoorprizeDraw(dp.id);
                        }
                      }}
                      className="btn btn-xs btn-icon btn-outline-danger"
                      title="Hapus Undian Ini"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Winners Grid */}
                <div className="history-winners-grid">
                  {(dp.winners || []).map((w, wIdx) => (
                    <div key={wIdx} className="winner-pill-card">
                      <div className="winner-pill-avatar">
                        {(w.playerName || 'P')[0].toUpperCase()}
                      </div>
                      <div className="winner-pill-info min-w-0">
                        <div className="winner-pill-name font-bold text-xs text-gray-900 truncate">
                          {w.playerName}
                        </div>
                        <div className="winner-pill-meta text-[11px] text-muted flex items-center gap-1.5">
                          <span className={`level-badge level-${(w.playerLevel || 'b').toLowerCase()} text-[10px]`}>
                            Lvl {w.playerLevel || 'B'}
                          </span>
                          {w.teamName && (
                            <span className="team-tag text-[10px] truncate max-w-[110px]">
                              {w.teamName}
                            </span>
                          )}
                          {w.phone && (
                            <span className="phone-tag text-[10px] text-gray-500">
                              <Phone size={9} className="inline mr-0.5" />{w.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎉 Modal Celebration / Winner Announcement */}
      {isCelebrationModalOpen && winnerResults && (
        <div className="modal-overlay celebration-modal-overlay">
          <div className="modal-content celebration-modal-card">
            {/* Modal Confetti Crown Header */}
            <div className="celebration-header">
              <div className="celebration-crown">
                <Crown size={36} className="text-amber-400 animate-bounce" />
              </div>
              <h2 className="celebration-title">🎉 SELAMAT KEPADA PEMENANG! 🎉</h2>
              <p className="celebration-subtitle">
                Hadiah Doorprize: <b className="text-primary">{prizeName}</b>
              </p>
            </div>

            {/* List of Revealed Winners */}
            <div className="celebration-winners-list">
              {winnerResults.map((w, idx) => (
                <div key={idx} className="celebration-winner-card">
                  <div className="winner-card-rank">
                    <span className="rank-num">#{idx + 1}</span>
                  </div>

                  <div className="winner-card-avatar">
                    {(w.playerName || 'W')[0].toUpperCase()}
                  </div>

                  <div className="winner-card-details">
                    <h3 className="winner-card-name">{w.playerName}</h3>
                    <div className="winner-card-tags">
                      <span className={`badge level-badge level-${(w.playerLevel || 'b').toLowerCase()}`}>
                        Level {w.playerLevel}
                      </span>
                      {w.teamName && (
                        <span className="badge badge-secondary">
                          {w.teamName}
                        </span>
                      )}
                      {w.phone && (
                        <span className="badge badge-outline text-xs">
                          📞 {w.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="celebration-modal-actions">
              <button
                type="button"
                onClick={handleSaveWinners}
                className="btn btn-primary btn-lg flex-1 shadow-lg font-bold"
              >
                <CheckCircle2 size={18} />
                <span>Simpan & Publikasikan ke Publik</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCelebrationModalOpen(false);
                  handleStartSpin();
                }}
                className="btn btn-outline-primary"
                title="Undi ulang jika pemenang tidak hadir"
              >
                <RotateCcw size={16} />
                <span>Undi Ulang (Re-Spin)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCelebrationModalOpen(false);
                  setWinnerResults(null);
                }}
                className="btn btn-ghost text-xs text-muted"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
