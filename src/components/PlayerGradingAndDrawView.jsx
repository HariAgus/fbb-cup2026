import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import confetti from 'canvas-confetti';
import {
  Shuffle,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Users,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Plus,
  Search,
  Dice5,
  Award,
  Flame,
  Check,
  CalendarPlus,
  Sliders,
  Star
} from 'lucide-react';

export const PlayerGradingAndDrawView = ({ onOpenAddPlayer, onEditPlayer }) => {
  const {
    data,
    isAdmin,
    updatePlayerLevel,
    batchUpdatePlayerLevels,
    drawBalancedTeams,
    applyDrawResult,
    showToast
  } = useTournament();

  const [activeSection, setActiveSection] = useState('draw'); // 'draw' | 'grading'
  const [numTeams, setNumTeams] = useState(6);
  const [autoGenMatches, setAutoGenMatches] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStep, setDrawStep] = useState(0); // 0: Idle, 1: Pot A, 2: Pot B+, 3: Pot B, 4: Pot C, 5: Done
  const [drawProgressText, setDrawProgressText] = useState('');
  const [currentDrawnResult, setCurrentDrawnResult] = useState(null);

  // Search & Filter for Grading Section
  const [gradingSearch, setGradingSearch] = useState('');
  const [gradingLevelFilter, setGradingLevelFilter] = useState('all'); // 'all' | 'A' | 'B+' | 'B' | 'C'

  const players = data.players || [];
  const teams = data.teams || [];

  const teamsMap = useMemo(() => {
    return teams.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});
  }, [teams]);

  // Normalize and group players
  const potAPlayers = useMemo(() => players.filter((p) => (p.level || 'B') === 'A'), [players]);
  const potBPlusPlayers = useMemo(() => players.filter((p) => (p.level || 'B') === 'B+'), [players]);
  const potBPlayers = useMemo(() => players.filter((p) => (p.level || 'B') === 'B'), [players]);
  const potCPlayers = useMemo(() => players.filter((p) => (p.level || 'B') === 'C'), [players]);

  const totalPlayers = players.length;
  const pctA = totalPlayers > 0 ? Math.round((potAPlayers.length / totalPlayers) * 100) : 0;
  const pctBPlus = totalPlayers > 0 ? Math.round((potBPlusPlayers.length / totalPlayers) * 100) : 0;
  const pctB = totalPlayers > 0 ? Math.round((potBPlayers.length / totalPlayers) * 100) : 0;
  const pctC = totalPlayers > 0 ? Math.round((potCPlayers.length / totalPlayers) * 100) : 0;

  // Projected balance calculations
  const perTeamA = Math.floor(potAPlayers.length / numTeams);
  const remA = potAPlayers.length % numTeams;

  const perTeamBPlus = Math.floor(potBPlusPlayers.length / numTeams);
  const remBPlus = potBPlusPlayers.length % numTeams;

  const perTeamB = Math.floor(potBPlayers.length / numTeams);
  const remB = potBPlayers.length % numTeams;

  const perTeamC = Math.floor(potCPlayers.length / numTeams);
  const remC = potCPlayers.length % numTeams;

  const totalPerTeamMin = perTeamA + perTeamBPlus + perTeamB + perTeamC;

  // Filtered players in grading table
  const filteredGradingPlayers = useMemo(() => {
    return players.filter((p) => {
      const q = gradingSearch.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
      const playerLevel = p.level || 'B';
      const matchLevel = gradingLevelFilter === 'all' || playerLevel === gradingLevelFilter;
      return matchSearch && matchLevel;
    });
  }, [players, gradingSearch, gradingLevelFilter]);

  // Quick auto-grading helper (distribute players into equal quarters A, B+, B, C)
  const handleAutoGradeDemo = () => {
    if (players.length === 0) return;
    if (!confirm('Bagi rata otomatis grading seluruh pemain menjadi Level A, B+, B, dan C (masing-masing 1/4)?')) return;

    const updates = {};
    const quarter = Math.ceil(players.length / 4);

    players.forEach((p, idx) => {
      if (idx < quarter) updates[p.id] = 'A';
      else if (idx < quarter * 2) updates[p.id] = 'B+';
      else if (idx < quarter * 3) updates[p.id] = 'B';
      else updates[p.id] = 'C';
    });

    batchUpdatePlayerLevels(updates);
  };

  // Run Animated Live Draw
  const handleStartLiveDraw = () => {
    if (players.length < numTeams) {
      showToast(`Jumlah pemain (${players.length}) kurang dari jumlah tim (${numTeams})!`, 'error');
      return;
    }

    setIsDrawing(true);
    setDrawStep(1);
    setDrawProgressText('🌟 Mengocok POT A (Level A - Pemain Unggulan)...');

    // Step 1: Pot A
    setTimeout(() => {
      setDrawStep(2);
      setDrawProgressText('⭐ Mengocok POT B+ (Level B+ - Pemain Menengah Atas)...');

      // Step 2: Pot B+
      setTimeout(() => {
        setDrawStep(3);
        setDrawProgressText('⚡ Mengocok POT B (Level B - Pemain Menengah)...');

        // Step 3: Pot B
        setTimeout(() => {
          setDrawStep(4);
          setDrawProgressText('🛡️ Mengocok POT C (Level C - Pemain Pemula)...');

          // Step 4: Pot C & Finalize
          setTimeout(() => {
            const result = drawBalancedTeams({ numberOfTeams: numTeams });
            setCurrentDrawnResult(result);
            setIsDrawing(false);
            setDrawStep(5);
            setDrawProgressText('🎉 Pengocokan Selesai! Seluruh tim terbagi secara seimbang.');

            // Fire celebratory confetti
            try {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
              });
            } catch (e) { }
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // Instant Draw
  const handleInstantDraw = () => {
    if (players.length < numTeams) {
      showToast(`Jumlah pemain (${players.length}) kurang dari jumlah tim (${numTeams})!`, 'error');
      return;
    }
    const result = drawBalancedTeams({ numberOfTeams: numTeams });
    setCurrentDrawnResult(result);
    setDrawStep(5);
    showToast(`Pengocokan tim berhasil! ${numTeams} tim telah disusun seimbang.`, 'success');
  };

  // Apply Drawn Result to Database
  const handleApplyResult = () => {
    if (!currentDrawnResult || !currentDrawnResult.teams) return;
    if (confirm(`Terapkan hasil pembagian ${currentDrawnResult.teams.length} tim ke database turnamen? Ini akan memperbarui skuad seluruh tim.`)) {
      applyDrawResult(currentDrawnResult.teams, autoGenMatches);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'PB';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="players-container space-y-6">
      {/* Standard View Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Shuffle className="text-primary" size={26} />
            Grading & Undian Tim Seimbang
          </h2>
          <p className="view-subtitle">
            Sistem pengundian pot unggulan (Level A, B, C) untuk menghasilkan pembagian grup/tim yang adil dan berimbang.
          </p>
        </div>

        {/* Action Toggle Switchers */}
        <div className="header-actions-group">
          <div className="status-pill-filter">
            <button
              onClick={() => setActiveSection('draw')}
              className={`status-filter-btn ${activeSection === 'draw' ? 'active' : ''}`}
            >
              <Dice5 size={15} />
              <span>Pengocokan Tim (Pot Draw)</span>
            </button>
            <button
              onClick={() => setActiveSection('grading')}
              className={`status-filter-btn ${activeSection === 'grading' ? 'active' : ''}`}
            >
              <Award size={15} />
              <span>Master Grading (A, B, C)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Pulse Metrics Deck (Identical to Home/Hero styling) */}
      <div className="tournament-metrics-deck">
        {/* Total Metric Card */}
        <div className="metric-deck-card theme-orange">
          <div className="metric-icon-box">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-num-row">
              <span className="metric-number">{totalPlayers}</span>
              <span className="metric-tag">TOTAL POOL</span>
            </div>
            <div className="metric-title">Master Pemain</div>
            <div className="metric-desc">{teams.length} Tim Terdaftar</div>
          </div>
        </div>

        {/* Pot A Metric Card */}
        <div
          className="metric-deck-card theme-gold cursor-pointer"
          onClick={() => {
            setActiveSection('grading');
            setGradingLevelFilter('A');
          }}
          title="Klik untuk filter pemain Level A"
        >
          <div className="metric-icon-box">
            <Crown size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-num-row">
              <span className="metric-number">{potAPlayers.length}</span>
              <span className="metric-tag">POT A ({pctA}%)</span>
            </div>
            <div className="metric-title">Level A (Unggulan)</div>
            <div className="metric-desc">Pemain Inti / Unggulan</div>
          </div>
        </div>

        {/* Pot B+ Metric Card */}
        <div
          className="metric-deck-card theme-purple cursor-pointer"
          onClick={() => {
            setActiveSection('grading');
            setGradingLevelFilter('B+');
          }}
          title="Klik untuk filter pemain Level B+"
        >
          <div className="metric-icon-box">
            <Star size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-num-row">
              <span className="metric-number">{potBPlusPlayers.length}</span>
              <span className="metric-tag">POT B+ ({pctBPlus}%)</span>
            </div>
            <div className="metric-title">Level B+ (Menengah Atas)</div>
            <div className="metric-desc">Pemain Tangguh / Handal</div>
          </div>
        </div>

        {/* Pot B Metric Card */}
        <div
          className="metric-deck-card theme-blue cursor-pointer"
          onClick={() => {
            setActiveSection('grading');
            setGradingLevelFilter('B');
          }}
          title="Klik untuk filter pemain Level B"
        >
          <div className="metric-icon-box">
            <Zap size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-num-row">
              <span className="metric-number">{potBPlayers.length}</span>
              <span className="metric-tag">POT B ({pctB}%)</span>
            </div>
            <div className="metric-title">Level B (Menengah)</div>
            <div className="metric-desc">Pemain Reguler Menengah</div>
          </div>
        </div>

        {/* Pot C Metric Card */}
        <div
          className="metric-deck-card theme-green cursor-pointer"
          onClick={() => {
            setActiveSection('grading');
            setGradingLevelFilter('C');
          }}
          title="Klik untuk filter pemain Level C"
        >
          <div className="metric-icon-box">
            <Shield size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-num-row">
              <span className="metric-number">{potCPlayers.length}</span>
              <span className="metric-tag">POT C ({pctC}%)</span>
            </div>
            <div className="metric-title">Level C (Pemula)</div>
            <div className="metric-desc">Pemain Pemula / Fun</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: POT DRAW (PENGOCOKAN TIM SEIMBANG)                             */}
      {/* ========================================================================= */}
      {activeSection === 'draw' && (
        <div className="draw-content-wrapper">
          {/* Config Card */}
          <div className="draw-config-card">
            <div className="draw-config-top">
              <div>
                <h3 className="draw-config-title">
                  <Sliders size={20} className="text-primary" />
                  <span>Konfigurasi Pengundian Tim Badminton</span>
                </h3>
                <p className="draw-config-desc">
                  Tentukan jumlah tim yang akan dibentuk. Sistem akan mengundi Pot A, Pot B, dan Pot C secara merata.
                </p>
              </div>

              {/* Number of Teams Selector & Checkbox */}
              <div className="draw-config-options">
                <div className="draw-team-selector">
                  <span className="draw-team-label">Jumlah Tim:</span>
                  {[4, 6, 8, 10, 12].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumTeams(n)}
                      className={`draw-team-pill ${numTeams === n ? 'active' : ''}`}
                    >
                      {n} Tim
                    </button>
                  ))}
                </div>

                <label className="draw-checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoGenMatches}
                    onChange={(e) => setAutoGenMatches(e.target.checked)}
                  />
                  <span>Generate Jadwal Otomatis</span>
                </label>
              </div>
            </div>

            {/* Projection Formula Banner */}
            <div className="draw-projection-banner">
              <div className="draw-projection-info">
                <h4 className="draw-projection-title">
                  <Flame size={16} className="text-primary" />
                  <span>Proyeksi Komposisi per Tim ({numTeams} Tim):</span>
                </h4>
                <div className="draw-projection-formula">
                  <span className="badge-level badge-level-a">
                    👑 {perTeamA}x Level A {remA > 0 ? `(+${remA} sisa)` : ''}
                  </span>
                  <span className="text-muted font-bold">+</span>
                  <span className="badge-level badge-level-b-plus">
                    ⭐ {perTeamBPlus}x Level B+ {remBPlus > 0 ? `(+${remBPlus} sisa)` : ''}
                  </span>
                  <span className="text-muted font-bold">+</span>
                  <span className="badge-level badge-level-b">
                    ⚡ {perTeamB}x Level B {remB > 0 ? `(+${remB} sisa)` : ''}
                  </span>
                  <span className="text-muted font-bold">+</span>
                  <span className="badge-level badge-level-c">
                    🛡️ {perTeamC}x Level C {remC > 0 ? `(+${remC} sisa)` : ''}
                  </span>
                  <span className="text-muted font-bold">=</span>
                  <span className="badge badge-primary font-bold">
                    ±{totalPerTeamMin} Pemain/Tim
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="draw-actions-row">
                  <button
                    onClick={handleStartLiveDraw}
                    disabled={isDrawing}
                    className="btn btn-primary"
                  >
                    <Sparkles size={16} className="text-amber-300" />
                    <span>{isDrawing ? 'Mengocok Pot...' : '🎲 Mulai Live Draw (Animasi)'}</span>
                  </button>
                  <button
                    onClick={handleInstantDraw}
                    disabled={isDrawing}
                    className="btn btn-secondary"
                  >
                    <Zap size={15} />
                    <span>Kocok Instan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Drawing Progress Alert */}
          {isDrawing && (
            <div className="live-draw-alert glass-card glass-card-highlight text-center py-6">
              <div className="spinner-flame mx-auto mb-3" />
              <div>
                <h4 className="text-primary font-bold text-lg">PROSES UNDIAN POT SEDANG BERJALAN</h4>
                <p className="text-sm text-gray-600 mt-1">{drawProgressText}</p>
              </div>

              <div className="flex items-center justify-center gap-3 max-w-lg mx-auto pt-4 flex-wrap">
                <div className={`pot-ball-chip pot-a ${drawStep >= 1 ? 'active' : ''}`}>
                  👑 POT A
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className={`pot-ball-chip pot-b-plus ${drawStep >= 2 ? 'active' : ''}`}>
                  ⭐ POT B+
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className={`pot-ball-chip pot-b ${drawStep >= 3 ? 'active' : ''}`}>
                  ⚡ POT B
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className={`pot-ball-chip pot-c ${drawStep >= 4 ? 'active' : ''}`}>
                  🛡️ POT C
                </div>
              </div>
            </div>
          )}

          {/* Drawn Results View */}
          {currentDrawnResult && currentDrawnResult.teams && (
            <div className="draw-results-container">
              <div className="draw-result-header-card">
                <div className="draw-result-header-left">
                  <h3 className="draw-result-header-title">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <span>Hasil Pengocokan {currentDrawnResult.teams.length} Tim Seimbang</span>
                  </h3>
                  <p className="draw-result-header-desc">
                    Total <b>{currentDrawnResult.totalPlayersDrawn} pemain</b> telah didistribusikan secara proporsional berdasarkan Level A, B+, B, dan C.
                  </p>
                </div>

                {isAdmin && (
                  <div className="draw-result-actions">
                    <button
                      onClick={handleInstantDraw}
                      className="btn btn-secondary"
                      title="Kocok ulang pembagian tim"
                    >
                      <RefreshCw size={14} />
                      <span>Kocok Ulang</span>
                    </button>
                    <button
                      onClick={handleApplyResult}
                      className="btn btn-primary"
                    >
                      <Check size={16} />
                      <span>Terapkan Hasil ke Skuad Tim</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Grid of Balanced Teams */}
              <div className="teams-grid">
                {currentDrawnResult.teams.map((team, tIdx) => {
                  const teamPlayers = (team.playerIds || [])
                    .map((id) => players.find((p) => p.id === id))
                    .filter(Boolean);

                  const countA = teamPlayers.filter((p) => (p.level || 'B') === 'A').length;
                  const countBPlus = teamPlayers.filter((p) => (p.level || 'B') === 'B+').length;
                  const countB = teamPlayers.filter((p) => (p.level || 'B') === 'B').length;
                  const countC = teamPlayers.filter((p) => (p.level || 'B') === 'C').length;

                  return (
                    <div
                      key={team.id || tIdx}
                      className="team-card glass-card shadow-sm"
                      style={{ borderTop: `4px solid ${team.color || '#E06020'}` }}
                    >
                      {/* Team Card Header */}
                      <div className="team-card-header mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="team-logo-avatar shadow-sm"
                            style={{
                              backgroundColor: `${team.color || '#E06020'}18`,
                              borderColor: team.color || '#E06020'
                            }}
                          >
                            <span>{team.logo || '🏸'}</span>
                          </div>
                          <div>
                            <h3 className="team-card-name text-gray-900 font-extrabold text-sm">{team.name}</h3>
                            <div className="text-2xs text-muted mt-0.5">
                              Kapten: <span className="font-bold text-gray-800">{team.captain || '-'}</span>
                            </div>
                          </div>
                        </div>

                        <span className="badge badge-primary text-xs font-semibold px-2 py-0.5">
                          {teamPlayers.length} Pemain
                        </span>
                      </div>

                      {/* Level Balance Badges */}
                      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200/70 text-2xs font-extrabold">
                        <span className="text-gray-500">Komposisi:</span>
                        <div className="flex items-center gap-1">
                          <span className="badge-level badge-level-a text-2xs py-0 px-1.5">👑 {countA}A</span>
                          <span className="badge-level badge-level-b-plus text-2xs py-0 px-1.5">⭐ {countBPlus}B+</span>
                          <span className="badge-level badge-level-b text-2xs py-0 px-1.5">⚡ {countB}B</span>
                          <span className="badge-level badge-level-c text-2xs py-0 px-1.5">🛡️ {countC}C</span>
                        </div>
                      </div>

                      {/* Player List */}
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {teamPlayers.map((p, pIdx) => {
                          const lvl = p.level || 'B';
                          const isCaptain = team.captain && p.name.toLowerCase().trim() === team.captain.toLowerCase().trim();

                          return (
                            <div
                              key={p.id}
                              className="player-roster-badge flex items-center justify-between p-2 rounded-lg border bg-white border-gray-200/80 hover:bg-gray-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-3xs font-bold flex-shrink-0">
                                  {getInitials(p.name)}
                                </div>
                                <span className="text-xs font-bold text-gray-900 truncate">
                                  {p.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className={`badge-level badge-level-${lvl.toLowerCase().replace('+', '-plus')} text-2xs py-0 px-1.5 font-bold`}>
                                  {lvl}
                                </span>
                                {isCaptain && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-3xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                    <Crown size={8} className="text-amber-600" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: MASTER GRADING PEMAIN (A, B, C)                                */}
      {/* ========================================================================= */}
      {activeSection === 'grading' && (
        <div className="space-y-4">
          {/* Action and Search Bar */}
          <div className="matches-filter-bar glass-card flex-wrap gap-2.5">
            <div className="search-input-box flex-1 min-w-[200px]">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Cari pemain untuk grading (nama, no WA)..."
                value={gradingSearch}
                onChange={(e) => setGradingSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="status-pill-filter">
              <button
                onClick={() => setGradingLevelFilter('all')}
                className={`status-filter-btn ${gradingLevelFilter === 'all' ? 'active' : ''}`}
              >
                Semua ({players.length})
              </button>
              <button
                onClick={() => setGradingLevelFilter('A')}
                className={`status-filter-btn ${gradingLevelFilter === 'A' ? 'active' : ''}`}
              >
                👑 Level A ({potAPlayers.length})
              </button>
              <button
                onClick={() => setGradingLevelFilter('B+')}
                className={`status-filter-btn ${gradingLevelFilter === 'B+' ? 'active' : ''}`}
              >
                ⭐ Level B+ ({potBPlusPlayers.length})
              </button>
              <button
                onClick={() => setGradingLevelFilter('B')}
                className={`status-filter-btn ${gradingLevelFilter === 'B' ? 'active' : ''}`}
              >
                ⚡ Level B ({potBPlayers.length})
              </button>
              <button
                onClick={() => setGradingLevelFilter('C')}
                className={`status-filter-btn ${gradingLevelFilter === 'C' ? 'active' : ''}`}
              >
                🛡️ Level C ({potCPlayers.length})
              </button>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoGradeDemo}
                  className="btn btn-sm btn-secondary font-bold"
                  title="Bagi rata grading pemain 1/4 A, 1/4 B+, 1/4 B, 1/4 C"
                >
                  <RefreshCw size={13} />
                  <span>Auto-Grade 1/4</span>
                </button>
                <button
                  onClick={onOpenAddPlayer}
                  className="btn btn-sm btn-primary font-bold"
                >
                  <Plus size={14} />
                  <span>Tambah Pemain</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Grading Table */}
          <div className="group-table-card glass-card">
            <div className="table-responsive">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>NO</th>
                    <th>NAMA PEMAIN</th>
                    <th>GENDER</th>
                    <th>KONTAK WA</th>
                    <th>TIM SAAT INI</th>
                    <th style={{ textAlign: 'center', width: '260px' }}>UBAH LEVEL (1-KLIK)</th>
                    {isAdmin && <th style={{ textAlign: 'center', width: '80px' }}>AKSI</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredGradingPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-table-msg">
                        Tidak ada data pemain yang cocok dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredGradingPlayers.map((player, idx) => {
                      const assignedTeam = player.teamId ? teamsMap[player.teamId] : null;
                      const currentLevel = player.level || 'B';

                      return (
                        <tr key={player.id} className="standings-row hover:bg-orange-50/20">
                          <td className="font-semibold text-gray-500 text-center">{idx + 1}</td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary font-bold flex items-center justify-center text-xs">
                                {player.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-sm">{player.name}</div>
                                <div className="text-2xs text-muted">ID: {player.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${player.gender === 'L' ? 'badge-primary' : 'badge-gold'}`}>
                              {player.gender === 'L' ? 'Putra (L)' : 'Putri (P)'}
                            </span>
                          </td>
                          <td className="font-mono text-xs">
                            {player.phone ? (
                              <a
                                href={`https://wa.me/${player.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-semibold"
                              >
                                {player.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            {assignedTeam ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{assignedTeam.logo || '🏸'}</span>
                                <span className="font-bold text-xs text-gray-900">{assignedTeam.name}</span>
                              </div>
                            ) : (
                              <span className="badge badge-scheduled text-2xs">Belum Ada Tim</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {/* 1-Click Interactive Grading Switcher */}
                            <div className="grading-segmented-control">
                              <button
                                onClick={() => updatePlayerLevel(player.id, 'A')}
                                className={`grading-segment-btn ${currentLevel === 'A' ? 'active-a' : ''}`}
                                title="Set sebagai Level A (Unggulan)"
                              >
                                <Crown size={11} /> Level A
                              </button>
                              <button
                                onClick={() => updatePlayerLevel(player.id, 'B+')}
                                className={`grading-segment-btn ${currentLevel === 'B+' ? 'active-b-plus' : ''}`}
                                title="Set sebagai Level B+ (Menengah Atas)"
                              >
                                <Star size={11} /> Level B+
                              </button>
                              <button
                                onClick={() => updatePlayerLevel(player.id, 'B')}
                                className={`grading-segment-btn ${currentLevel === 'B' ? 'active-b' : ''}`}
                                title="Set sebagai Level B (Menengah)"
                              >
                                <Zap size={11} /> Level B
                              </button>
                              <button
                                onClick={() => updatePlayerLevel(player.id, 'C')}
                                className={`grading-segment-btn ${currentLevel === 'C' ? 'active-c' : ''}`}
                                title="Set sebagai Level C (Pemula)"
                              >
                                <Shield size={11} /> Level C
                              </button>
                            </div>
                          </td>
                          {isAdmin && (
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => onEditPlayer(player)}
                                className="btn-icon btn-secondary"
                                title="Edit Detail Pemain"
                              >
                                ✏️
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
