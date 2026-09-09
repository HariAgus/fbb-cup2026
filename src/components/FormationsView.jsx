import React, { useState, useMemo, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Layers,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Users,
  Crown,
  Star,
  Zap,
  Shield,
  Shuffle,
  Info,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export const FormationsView = ({ initialTeamId = null, onSelectTeam = null }) => {
  const {
    data,
    isAdmin,
    getFormationCardsForTeam,
    updateTeamFormationSlots,
    showToast
  } = useTournament();

  const teams = useMemo(() => data.teams || [], [data.teams]);
  const allPlayers = useMemo(() => data.players || [], [data.players]);

  // Selected team state
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    if (initialTeamId && teams.some((t) => t.id === initialTeamId)) {
      return initialTeamId;
    }
    return teams[0]?.id || '';
  });

  // Keep synced if initialTeamId changes
  useEffect(() => {
    if (initialTeamId && teams.some((t) => t.id === initialTeamId)) {
      setSelectedTeamId(initialTeamId);
    }
  }, [initialTeamId, teams]);

  const selectedTeam = useMemo(() => {
    return teams.find((t) => t.id === selectedTeamId) || teams[0] || null;
  }, [teams, selectedTeamId]);

  // Skuad players for the selected team
  const teamPlayers = useMemo(() => {
    if (!selectedTeam) return [];
    return (selectedTeam.playerIds || [])
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter(Boolean);
  }, [selectedTeam, allPlayers]);

  // Local slot assignments state for easy editing
  const [slotAssignments, setSlotAssignments] = useState({
    p1: '',
    p2: '',
    p3: '',
    p4: '',
    p5: '',
    p6: ''
  });

  // Local round labels state
  const [roundLabels, setRoundLabels] = useState({
    kartu1: 'Babak Penyisihan 1',
    kartu2: 'Babak Penyisihan 2',
    kartu3: 'Babak Penyisihan 3',
    kartu4: 'Babak Penyisihan 4',
    kartu5: 'Babak Penyisihan 5',
    kartu6: 'Babak Semifinal'
  });

  // Synchronize local slots whenever selected team changes
  useEffect(() => {
    if (selectedTeam) {
      const saved = selectedTeam.formationSlots || {};
      const savedRounds = selectedTeam.formationRounds || {};

      // Grade pools
      const poolA = teamPlayers.filter((p) => (p.level || 'B') === 'A');
      const poolB = teamPlayers.filter((p) => (p.level || 'B') === 'B+' || (p.level || 'B') === 'B');
      const poolC = teamPlayers.filter((p) => (p.level || 'B') === 'C');

      const used = new Set();
      const resolveSlot = (key, pool) => {
        if (saved[key] && teamPlayers.some((p) => p.id === saved[key])) {
          used.add(saved[key]);
          return saved[key];
        }
        const candidate = pool.find((p) => !used.has(p.id)) || teamPlayers.find((p) => !used.has(p.id));
        if (candidate) {
          used.add(candidate.id);
          return candidate.id;
        }
        return '';
      };

      setSlotAssignments({
        p1: resolveSlot('p1', poolA),
        p2: resolveSlot('p2', poolA),
        p3: resolveSlot('p3', poolB),
        p4: resolveSlot('p4', poolB),
        p5: resolveSlot('p5', poolB),
        p6: resolveSlot('p6', poolC)
      });

      setRoundLabels({
        kartu1: savedRounds.kartu1 || 'Babak Penyisihan 1',
        kartu2: savedRounds.kartu2 || 'Babak Penyisihan 2',
        kartu3: savedRounds.kartu3 || 'Babak Penyisihan 3',
        kartu4: savedRounds.kartu4 || 'Babak Penyisihan 4',
        kartu5: savedRounds.kartu5 || 'Babak Penyisihan 5',
        kartu6: savedRounds.kartu6 || 'Babak Semifinal'
      });
    }
  }, [selectedTeam, teamPlayers]);

  // Derived formation cards object
  const currentFormationData = useMemo(() => {
    if (!selectedTeam) return null;
    const tempTeam = {
      ...selectedTeam,
      formationSlots: slotAssignments,
      formationRounds: roundLabels
    };
    return getFormationCardsForTeam(tempTeam, allPlayers);
  }, [selectedTeam, slotAssignments, roundLabels, allPlayers, getFormationCardsForTeam]);

  // Copy state feedback
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCardIndex, setCopiedCardIndex] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Auto detect slots from roster
  const handleAutoDetectSlots = () => {
    if (teamPlayers.length < 6) {
      showToast(`Skuad ${selectedTeam?.name} hanya memiliki ${teamPlayers.length} pemain (disarankan minimal 6 pemain)!`, 'warning');
    }

    const poolA = teamPlayers.filter((p) => (p.level || 'B') === 'A');
    const poolBPlus = teamPlayers.filter((p) => (p.level || 'B') === 'B+');
    const poolB = teamPlayers.filter((p) => (p.level || 'B') === 'B');
    const poolC = teamPlayers.filter((p) => (p.level || 'B') === 'C');

    // Combine B+ and B
    const combinedB = [...poolBPlus, ...poolB];

    const used = new Set();
    const pick = (pool) => {
      const candidate = pool.find((p) => !used.has(p.id)) || teamPlayers.find((p) => !used.has(p.id));
      if (candidate) {
        used.add(candidate.id);
        return candidate.id;
      }
      return '';
    };

    const newSlots = {
      p1: pick(poolA),
      p2: pick(poolA),
      p3: pick(combinedB),
      p4: pick(combinedB),
      p5: pick(combinedB),
      p6: pick(poolC)
    };

    setSlotAssignments(newSlots);
    showToast('Slot pemain berhasil diisi otomatis berdasarkan level A, B+, B, dan C!', 'success');
  };

  // Save slots to database
  const handleSaveSlots = () => {
    if (!selectedTeam) return;
    updateTeamFormationSlots(selectedTeam.id, slotAssignments, roundLabels);
  };

  // Check slot duplication
  const slotDuplicates = useMemo(() => {
    const counts = {};
    Object.values(slotAssignments).forEach((id) => {
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return Object.keys(counts).filter((id) => counts[id] > 1);
  }, [slotAssignments]);

  const hasDuplicatePlayers = slotDuplicates.length > 0;
  const isAllFilled = Object.values(slotAssignments).every(Boolean);

  // Print View Trigger
  const handlePrint = () => {
    window.print();
  };

  // Copy WhatsApp broadcast format
  const handleCopyWhatsApp = () => {
    if (!currentFormationData || !selectedTeam) return;

    const cards = currentFormationData.cards;
    let text = `🏸 *KARTU FORMASI TIM BADMINTON - FBB CUP 2026*\n`;
    text += `*Tim:* ${selectedTeam.name} (${selectedTeam.shortName || 'PB'})\n`;
    text += `*Kapten:* ${selectedTeam.captain || '-'}\n`;
    text += `*Format:* 3 Partai per Babak (Grade AB, Grade AC, Grade B+B)\n`;
    text += `=====================================\n\n`;

    cards.forEach((card) => {
      const p1_p1 = card.partai1.player1?.name || 'Pemain 1';
      const p1_p1_lvl = card.partai1.player1?.level || 'A';
      const p1_p2 = card.partai1.player2?.name || 'Pemain 3';
      const p1_p2_lvl = card.partai1.player2?.level || 'B';

      const p2_p1 = card.partai2.player1?.name || 'Pemain 2';
      const p2_p1_lvl = card.partai2.player1?.level || 'A';
      const p2_p2 = card.partai2.player2?.name || 'Pemain 6';
      const p2_p2_lvl = card.partai2.player2?.level || 'C';

      const p3_p1 = card.partai3.player1?.name || 'Pemain 4';
      const p3_p1_lvl = card.partai3.player1?.level || 'B';
      const p3_p2 = card.partai3.player2?.name || 'Pemain 5';
      const p3_p2_lvl = card.partai3.player2?.level || 'B';

      text += `📋 *${card.cardTitle.toUpperCase()}* (${card.defaultRound})\n`;
      text += `1️⃣ Partai 1 (Grade AB): ${p1_p1} (${p1_p1_lvl}) & ${p1_p2} (${p1_p2_lvl})\n`;
      text += `2️⃣ Partai 2 (Grade AC): ${p2_p1} (${p2_p1_lvl}) & ${p2_p2} (${p2_p2_lvl})\n`;
      text += `3️⃣ Partai 3 (Grade B+B): ${p3_p1} (${p3_p1_lvl}) & ${p3_p2} (${p3_p2_lvl})\n`;
      text += `-------------------------------------\n`;
    });

    text += `\n_Catatan: 6 kartu formasi ini digunakan secara unik untuk 5 Babak Penyisihan dan 1 Babak Semifinal._`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    showToast('Format 6 Kartu Formasi berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single card WhatsApp text
  const handleCopySingleCard = (card) => {
    if (!selectedTeam) return;

    const p1_p1 = card.partai1.player1?.name || 'Pemain 1';
    const p1_p1_lvl = card.partai1.player1?.level || 'A';
    const p1_p2 = card.partai1.player2?.name || 'Pemain 3';
    const p1_p2_lvl = card.partai1.player2?.level || 'B';

    const p2_p1 = card.partai2.player1?.name || 'Pemain 2';
    const p2_p1_lvl = card.partai2.player1?.level || 'A';
    const p2_p2 = card.partai2.player2?.name || 'Pemain 6';
    const p2_p2_lvl = card.partai2.player2?.level || 'C';

    const p3_p1 = card.partai3.player1?.name || 'Pemain 4';
    const p3_p1_lvl = card.partai3.player1?.level || 'B';
    const p3_p2 = card.partai3.player2?.name || 'Pemain 5';
    const p3_p2_lvl = card.partai3.player2?.level || 'B';

    let text = `🏸 *${card.cardTitle.toUpperCase()} (${card.defaultRound}) - ${selectedTeam.name}*\n`;
    text += `1️⃣ Partai 1 (Grade AB): ${p1_p1} (${p1_p1_lvl}) & ${p1_p2} (${p1_p2_lvl})\n`;
    text += `2️⃣ Partai 2 (Grade AC): ${p2_p1} (${p2_p1_lvl}) & ${p2_p2} (${p2_p2_lvl})\n`;
    text += `3️⃣ Partai 3 (Grade B+B): ${p3_p1} (${p3_p1_lvl}) & ${p3_p2} (${p3_p2_lvl})\n`;

    navigator.clipboard.writeText(text);
    setCopiedCardIndex(card.cardIndex);
    showToast(`Teks ${card.cardTitle} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedCardIndex(null), 2000);
  };

  // Helper for grade pill
  const renderGradeBadge = (level = 'B') => {
    const lvl = level || 'B';
    const cleanLvl = lvl.toLowerCase().replace('+', '-plus');
    let icon = <Zap size={10} />;
    if (lvl === 'A') icon = <Crown size={10} />;
    else if (lvl === 'B+') icon = <Star size={10} />;
    else if (lvl === 'C') icon = <Shield size={10} />;

    return (
      <span className={`badge-level badge-level-${cleanLvl} inline-flex items-center gap-1 text-2xs py-0.5 px-1.5 font-extrabold rounded-md shadow-2xs`}>
        {icon}
        <span>Grade {lvl}</span>
      </span>
    );
  };

  const getPlayerById = (id) => teamPlayers.find((p) => p.id === id) || null;

  return (
    <div className="formations-view-container">
      {/* 🌟 Screen View (Hidden when printing) */}
      <div className="formations-content-stack no-print">
        {/* Header Row */}
        <div className="formation-header-row">
          <div className="formation-title-group">
            <h2>
              <Layers className="text-primary" size={28} />
              <span>Kartu Formasi Tim (6 Babak)</span>
            </h2>
            <p>
              Sistem pembuatan 6 kartu formasi unik non-duplikat untuk 5 babak penyisihan dan 1 babak semifinal sesuai urutan Grade AB, Grade AC, dan Grade B+B.
            </p>
          </div>

          <div className="header-actions-group">
            <button
              onClick={() => setShowRulesModal(true)}
              className="btn btn-secondary text-xs"
              title="Lihat petunjuk dan format aturan pertandingan"
            >
              <Info size={15} />
              <span>Aturan Pertandingan</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="btn btn-secondary text-xs"
              title="Salin 6 kartu ke format teks WhatsApp"
            >
              {copiedAll ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              <span>{copiedAll ? 'Tersalin!' : 'Salin WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-primary text-xs"
              title="Cetak atau simpan kartu formasi sebagai PDF Technical Meeting"
            >
              <Printer size={15} />
              <span>Cetak / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Informative Rule & Formula Banner */}
        <div className="formation-rule-banner">
          <div className="formation-rule-top">
            <span className="badge badge-primary text-xs font-extrabold tracking-wider uppercase px-2.5 py-1">
              FORMAT RESMI FBB CUP 2026
            </span>
            <span className="text-xs text-muted font-bold">
              • 3 Partai Berurutan (Tanpa Batasan Gender)
            </span>
          </div>

          <div className="partai-rules-grid">
            <div className="partai-rule-box rule-ab">
              <div className="partai-rule-tag">PARTAI 1 • PEMBUKA</div>
              <div className="partai-rule-name">GRADE AB</div>
              <div className="partai-rule-desc">1 Pemain Grade A + 1 Pemain Grade B/B+</div>
            </div>

            <div className="partai-rule-box rule-ac">
              <div className="partai-rule-tag">PARTAI 2 • LANJUTAN</div>
              <div className="partai-rule-name">GRADE AC</div>
              <div className="partai-rule-desc">1 Pemain Grade A + 1 Pemain Grade C</div>
            </div>

            <div className="partai-rule-box rule-bb">
              <div className="partai-rule-tag">PARTAI 3 • PENENTU</div>
              <div className="partai-rule-name">GRADE B+B</div>
              <div className="partai-rule-desc">2 Pemain Grade B / B+ (Saling Berpasangan)</div>
            </div>
          </div>

          <div className="formation-rule-footer">
            💡 <b>Prinsip Rotasi:</b> Setiap tim menyiapkan 6 kartu formasi berbeda untuk <b>5 babak penyisihan</b> dan <b>1 babak semifinal</b>. Dalam 1 kartu, seluruh 6 pemain bermain tepat 1 kali tanpa pemain yang bermain ganda.
          </div>
        </div>

        {/* Team Selector & Readiness Deck */}
        <div className="team-formation-control-card">
          <div className="team-control-row">
            <div className="team-info-group">
              <div
                className="team-logo-avatar"
                style={{
                  backgroundColor: `${selectedTeam?.color || '#E06020'}18`,
                  borderColor: selectedTeam?.color || '#E06020'
                }}
              >
                <span>{selectedTeam?.logo || '🏸'}</span>
              </div>

              <div>
                <div className="team-select-label">
                  PILIH TIM BADMINTON
                </div>
                <div className="team-select-controls">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      if (onSelectTeam) onSelectTeam(e.target.value);
                    }}
                    className="formation-team-select"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortName || 'PB'})
                      </option>
                    ))}
                  </select>

                  <span className="badge badge-primary text-xs font-bold px-3 py-1.5">
                    {teamPlayers.length} Pemain di Skuad
                  </span>
                </div>
              </div>
            </div>

            {/* Skuad Level Balance Indicators & Buttons */}
            <div className="team-control-actions">
              <div className="team-roster-breakdown">
                <span className="text-2xs font-bold text-gray-500">Tersedia:</span>
                <span className="badge-level badge-level-a">
                  👑 {teamPlayers.filter((p) => (p.level || 'B') === 'A').length}A
                </span>
                <span className="badge-level badge-level-b-plus">
                  ⭐ {teamPlayers.filter((p) => (p.level || 'B') === 'B+').length}B+
                </span>
                <span className="badge-level badge-level-b">
                  ⚡ {teamPlayers.filter((p) => (p.level || 'B') === 'B').length}B
                </span>
                <span className="badge-level badge-level-c">
                  🛡️ {teamPlayers.filter((p) => (p.level || 'B') === 'C').length}C
                </span>
              </div>

              {isAdmin && (
                <div className="team-action-buttons">
                  <button
                    onClick={handleAutoDetectSlots}
                    className="btn btn-secondary font-bold text-xs"
                    title="Isi otomatis 6 slot berdasarkan grading pemain di skuad"
                  >
                    <Sparkles size={15} className="text-amber-500" />
                    <span>Auto-Detect Skuad</span>
                  </button>

                  <button
                    onClick={handleSaveSlots}
                    className="btn btn-primary font-bold text-xs"
                    title="Simpan susunan slot formasi ke database turnamen"
                  >
                    <Check size={15} />
                    <span>Simpan Formasi</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Validation Status Notice */}
          <div className="team-status-alert-bar">
            {hasDuplicatePlayers ? (
              <div className="formation-status-msg msg-danger">
                <AlertTriangle size={16} className="flex-shrink-0 text-amber-600" />
                <span>Peringatan: Terdapat pemain yang terdaftar lebih dari 1 slot. Harap pastikan setiap slot menggunakan pemain berbeda!</span>
              </div>
            ) : isAllFilled ? (
              <div className="formation-status-msg msg-success">
                <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-600" />
                <span>Formasi Sempurna: 6 slot terisi dengan 6 pemain unik. Ke-6 kartu siap digunakan untuk 6 babak!</span>
              </div>
            ) : (
              <div className="formation-status-msg msg-info">
                <Info size={16} className="flex-shrink-0 text-blue-600" />
                <span>Silakan lengkapi pemilihan pemain pada ke-6 slot di bawah untuk menghasilkan susunan kartu yang lengkap.</span>
              </div>
            )}

            <div className="team-captain-meta">
              Kapten: <b>{selectedTeam?.captain || '-'}</b> • Kontak: <b>{selectedTeam?.phone || '-'}</b>
            </div>
          </div>
        </div>

        {/* Slot Configurator (Pemain 1 s/d Pemain 6) */}
        <div className="slot-config-section">
          <div className="slot-config-header">
            <div>
              <h3 className="slot-section-title">
                <Users size={20} className="text-primary" />
                <span>Alokasi 6 Slot Pemain Tim ({selectedTeam?.name})</span>
              </h3>
              <p className="slot-section-desc">
                Tentukan alokasi tetap pemain untuk Slot 1 & 2 (Grade A), Slot 3, 4, 5 (Grade B/B+), dan Slot 6 (Grade C).
              </p>
            </div>

            <button
              onClick={handleAutoDetectSlots}
              className="slot-reset-btn"
            >
              <Shuffle size={14} />
              <span>Reset & Auto-Detect</span>
            </button>
          </div>

          <div className="slots-grid">
            {/* Slot 1 */}
            <div className="slot-item-card slot-a">
              <div className="slot-card-top">
                <span className="slot-num-badge">
                  <span className="slot-num-pill">1</span>
                  <span>Pemain 1</span>
                </span>
                <span className="badge-level badge-level-a">
                  👑 Grade A
                </span>
              </div>

              <select
                value={slotAssignments.p1}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p1: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 1 (Grade A) --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level || 'B'})
                  </option>
                ))}
              </select>

              {slotAssignments.p1 ? (
                <div className="slot-preview-box">
                  <span className="font-bold text-gray-900 truncate">
                    {getPlayerById(slotAssignments.p1)?.name}
                  </span>
                  {renderGradeBadge(getPlayerById(slotAssignments.p1)?.level)}
                </div>
              ) : (
                <div className="slot-preview-box slot-placeholder">
                  <span className="text-muted italic">Slot belum dipilih</span>
                </div>
              )}
            </div>

            {/* Slot 2 */}
            <div className="slot-item-card slot-a">
              <div className="slot-card-top">
                <span className="slot-num-badge">
                  <span className="slot-num-pill">2</span>
                  <span>Pemain 2</span>
                </span>
                <span className="badge-level badge-level-a">
                  👑 Grade A
                </span>
              </div>

              <select
                value={slotAssignments.p2}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p2: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 2 (Grade A) --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level || 'B'})
                  </option>
                ))}
              </select>

              {slotAssignments.p2 ? (
                <div className="slot-preview-box">
                  <span className="font-bold text-gray-900 truncate">
                    {getPlayerById(slotAssignments.p2)?.name}
                  </span>
                  {renderGradeBadge(getPlayerById(slotAssignments.p2)?.level)}
                </div>
              ) : (
                <div className="slot-preview-box slot-placeholder">
                  <span className="text-muted italic">Slot belum dipilih</span>
                </div>
              )}
            </div>

            {/* Slot 3 */}
            <div className="slot-item-card slot-b">
              <div className="slot-card-top">
                <span className="slot-num-badge">
                  <span className="slot-num-pill">3</span>
                  <span>Pemain 3</span>
                </span>
                <span className="badge-level badge-level-b-plus">
                  ⭐ Grade B / B+
                </span>
              </div>

              <select
                value={slotAssignments.p3}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p3: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 3 (Grade B/B+) --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level || 'B'})
                  </option>
                ))}
              </select>

              {slotAssignments.p3 ? (
                <div className="slot-preview-box">
                  <span className="font-bold text-gray-900 truncate">
                    {getPlayerById(slotAssignments.p3)?.name}
                  </span>
                  {renderGradeBadge(getPlayerById(slotAssignments.p3)?.level)}
                </div>
              ) : (
                <div className="slot-preview-box slot-placeholder">
                  <span className="text-muted italic">Slot belum dipilih</span>
                </div>
              )}
            </div>

            {/* Slot 4 */}
            <div className="slot-item-card slot-b">
              <div className="slot-card-top">
                <span className="slot-num-badge">
                  <span className="slot-num-pill">4</span>
                  <span>Pemain 4</span>
                </span>
                <span className="badge-level badge-level-b-plus">
                  ⭐ Grade B / B+
                </span>
              </div>

              <select
                value={slotAssignments.p4}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p4: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 4 (Grade B/B+) --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level || 'B'})
                  </option>
                ))}
              </select>

              {slotAssignments.p4 ? (
                <div className="slot-preview-box">
                  <span className="font-bold text-gray-900 truncate">
                    {getPlayerById(slotAssignments.p4)?.name}
                  </span>
                  {renderGradeBadge(getPlayerById(slotAssignments.p4)?.level)}
                </div>
              ) : (
                <div className="slot-preview-box slot-placeholder">
                  <span className="text-muted italic">Slot belum dipilih</span>
                </div>
              )}
            </div>

            {/* Slot 5 */}
            <div className="slot-item-card slot-b">
              <div className="slot-card-top">
                <span className="slot-num-badge">
                  <span className="slot-num-pill">5</span>
                  <span>Pemain 5</span>
                </span>
                <span className="badge-level badge-level-b">
                  ⚡ Grade B / B+
                </span>
              </div>

              <select
                value={slotAssignments.p5}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p5: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 5 (Grade B/B+) --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level || 'B'})
                  </option>
                ))}
              </select>

              {slotAssignments.p5 ? (
                <div className="slot-preview-box">
                  <span className="font-bold text-gray-900 truncate">
                    {getPlayerById(slotAssignments.p5)?.name}
                  </span>
                  {renderGradeBadge(getPlayerById(slotAssignments.p5)?.level)}
                </div>
              ) : (
                <div className="slot-preview-box slot-placeholder">
                  <span className="text-muted italic">Slot belum dipilih</span>
                </div>
              )}
            </div>

            {/* Slot 6 */}
            <div className="slot-item-card slot-c">
              <div className="slot-card-top">
                <span className="slot-num-badge">
                  <span className="slot-num-pill">6</span>
                  <span>Pemain 6</span>
                </span>
                <span className="badge-level badge-level-c">
                  🛡️ Grade C
                </span>
              </div>

              <select
                value={slotAssignments.p6}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p6: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 6 (Grade C) --</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level || 'B'})
                  </option>
                ))}
              </select>

              {slotAssignments.p6 ? (
                <div className="slot-preview-box">
                  <span className="font-bold text-gray-900 truncate">
                    {getPlayerById(slotAssignments.p6)?.name}
                  </span>
                  {renderGradeBadge(getPlayerById(slotAssignments.p6)?.level)}
                </div>
              ) : (
                <div className="slot-preview-box slot-placeholder">
                  <span className="text-muted italic">Slot belum dipilih</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6 Formation Cards Deck */}
        <div className="formation-cards-deck">
          <div className="cards-deck-header">
            <div>
              <div className="cards-deck-badge-label">
                <Sparkles size={14} className="text-primary" />
                <span>SUSUNAN RESMI 6 BABAK</span>
              </div>
              <h3 className="cards-deck-title">
                Daftar 6 Kartu Formasi ({selectedTeam?.name})
              </h3>
              <p className="cards-deck-desc">
                Kombinasi pasangan partai yang berbeda untuk setiap babak pertandingan tanpa pemain bermain ganda.
              </p>
            </div>

            <div className="cards-deck-actions">
              <button
                onClick={handleCopyWhatsApp}
                className="btn btn-secondary font-bold text-xs"
              >
                <Copy size={14} />
                <span>Salin Semua (WA)</span>
              </button>
              <button
                onClick={handlePrint}
                className="btn btn-primary font-bold text-xs"
              >
                <Printer size={14} />
                <span>Cetak 6 Kartu</span>
              </button>
            </div>
          </div>

          <div className="formation-cards-grid">
            {(currentFormationData?.cards || []).map((card) => {
              const isCopied = copiedCardIndex === card.cardIndex;
              const isSemifinal = card.cardIndex === 6;

              return (
                <div
                  key={card.cardIndex}
                  className={`formation-sheet-card ${isSemifinal ? 'card-semifinal-highlight' : ''}`}
                  style={{ borderTop: `4px solid ${isSemifinal ? '#D97706' : (selectedTeam?.color || '#E06020')}` }}
                >
                  {/* Card Top Header */}
                  <div className="formation-sheet-header">
                    <div className="card-title-group">
                      <div className={`card-number-badge ${isSemifinal ? 'badge-semifinal' : ''}`}>
                        {card.cardIndex}
                      </div>
                      <div>
                        <div className="card-title-text">
                          {card.cardTitle}
                        </div>
                        <div className={`card-round-tag ${isSemifinal ? 'round-semifinal' : ''}`}>
                          {isSemifinal ? '🏆 Babak Semifinal' : card.defaultRound}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopySingleCard(card)}
                      className="btn-icon-copy"
                      title="Salin kartu ini ke WhatsApp"
                    >
                      {isCopied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* 3 Matches (Partai) in the Card */}
                  <div className="partai-rows-container">
                    {/* Partai 1: Grade AB */}
                    <div className="partai-row-box partai-ab">
                      <div className="partai-header-row">
                        <span className="partai-order-label">
                          <span className="partai-num-pill">1</span> PARTAI 1
                        </span>
                        <span className="partai-grade-badge badge-partai-ab">
                          Grade AB
                        </span>
                      </div>

                      <div className="partai-players-split">
                        <div className="player-tile-card">
                          <div className="player-tile-top">
                            <span className="player-slot-ref">Pemain 1 (A)</span>
                            {renderGradeBadge(card.partai1.player1?.level || 'A')}
                          </div>
                          <div className="player-name-main" title={card.partai1.player1?.name}>
                            {card.partai1.player1?.name || <span className="player-unassigned">Belum diset</span>}
                          </div>
                        </div>

                        <div className="pair-and-badge">&</div>

                        <div className="player-tile-card">
                          <div className="player-tile-top">
                            <span className="player-slot-ref">Pemain B/B+</span>
                            {renderGradeBadge(card.partai1.player2?.level || 'B')}
                          </div>
                          <div className="player-name-main" title={card.partai1.player2?.name}>
                            {card.partai1.player2?.name || <span className="player-unassigned">Belum diset</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Partai 2: Grade AC */}
                    <div className="partai-row-box partai-ac">
                      <div className="partai-header-row">
                        <span className="partai-order-label">
                          <span className="partai-num-pill">2</span> PARTAI 2
                        </span>
                        <span className="partai-grade-badge badge-partai-ac">
                          Grade AC
                        </span>
                      </div>

                      <div className="partai-players-split">
                        <div className="player-tile-card">
                          <div className="player-tile-top">
                            <span className="player-slot-ref">Pemain 2 (A)</span>
                            {renderGradeBadge(card.partai2.player1?.level || 'A')}
                          </div>
                          <div className="player-name-main" title={card.partai2.player1?.name}>
                            {card.partai2.player1?.name || <span className="player-unassigned">Belum diset</span>}
                          </div>
                        </div>

                        <div className="pair-and-badge">&</div>

                        <div className="player-tile-card">
                          <div className="player-tile-top">
                            <span className="player-slot-ref">Pemain 6 (C)</span>
                            {renderGradeBadge(card.partai2.player2?.level || 'C')}
                          </div>
                          <div className="player-name-main" title={card.partai2.player2?.name}>
                            {card.partai2.player2?.name || <span className="player-unassigned">Belum diset</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Partai 3: Grade B+B */}
                    <div className="partai-row-box partai-bb">
                      <div className="partai-header-row">
                        <span className="partai-order-label">
                          <span className="partai-num-pill">3</span> PARTAI 3
                        </span>
                        <span className="partai-grade-badge badge-partai-bb">
                          Grade B+B
                        </span>
                      </div>

                      <div className="partai-players-split">
                        <div className="player-tile-card">
                          <div className="player-tile-top">
                            <span className="player-slot-ref">Pemain B/B+</span>
                            {renderGradeBadge(card.partai3.player1?.level || 'B')}
                          </div>
                          <div className="player-name-main" title={card.partai3.player1?.name}>
                            {card.partai3.player1?.name || <span className="player-unassigned">Belum diset</span>}
                          </div>
                        </div>

                        <div className="pair-and-badge">&</div>

                        <div className="player-tile-card">
                          <div className="player-tile-top">
                            <span className="player-slot-ref">Pemain B/B+</span>
                            {renderGradeBadge(card.partai3.player2?.level || 'B')}
                          </div>
                          <div className="player-name-main" title={card.partai3.player2?.name}>
                            {card.partai3.player2?.name || <span className="player-unassigned">Belum diset</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="formation-card-footer">
                    <span className="card-footer-guarantee">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>6 Pemain Bermain 1x (Tanpa Duplikat)</span>
                    </span>
                    <span className="card-footer-id">
                      ID: {selectedTeam?.shortName || 'PB'}-{card.cardIndex}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🖨️ OFFICIAL PRINT / PDF TECHNICAL MEETING SHEET (Rendered during Print)   */}
      {/* ========================================================================= */}
      <div className="official-print-container print-only">
        {/* Printable Header */}
        <div className="print-header-block">
          <div className="print-header-top">
            <div className="print-header-title-box">
              <div className="print-logo">🏸</div>
              <div>
                <h1 className="print-main-title">
                  FBB BADMINTON MERDEKA CUP 2026
                </h1>
                <p className="print-subtitle">
                  LEMBAR RESMI KARTU FORMASI TIM (TECHNICAL MEETING)
                </p>
              </div>
            </div>

            <div className="print-team-info-box">
              <div className="print-team-name">
                {selectedTeam?.name} ({selectedTeam?.shortName || 'PB'})
              </div>
              <div className="print-team-meta">
                Kapten: {selectedTeam?.captain || '-'} • Kontak: {selectedTeam?.phone || '-'}
              </div>
            </div>
          </div>

          <div className="print-rules-strip">
            <span>Aturan: <b>Partai 1 (Grade AB)</b> • <b>Partai 2 (Grade AC)</b> • <b>Partai 3 (Grade B+B)</b></span>
            <span>Alokasi: 5 Babak Penyisihan & 1 Babak Semifinal</span>
          </div>
        </div>

        {/* Printable 6 Cards Grid (Optimized for A4) */}
        <div className="print-cards-grid">
          {(currentFormationData?.cards || []).map((card) => (
            <div key={card.cardIndex} className="print-card-box">
              <div className="print-card-box-header">
                <span className="print-card-title">{card.cardTitle.toUpperCase()}</span>
                <span className="print-card-round">{card.cardIndex === 6 ? 'BABAK SEMIFINAL' : card.defaultRound}</span>
              </div>

              <div className="print-partai-list">
                <div className="print-partai-item partai-ab-print">
                  <span className="print-partai-label">Partai 1 (AB):</span>
                  <span className="print-partai-players">
                    {card.partai1.player1?.name || 'P1'} ({card.partai1.player1?.level || 'A'}) & {card.partai1.player2?.name || 'P3'} ({card.partai1.player2?.level || 'B'})
                  </span>
                </div>

                <div className="print-partai-item partai-ac-print">
                  <span className="print-partai-label">Partai 2 (AC):</span>
                  <span className="print-partai-players">
                    {card.partai2.player1?.name || 'P2'} ({card.partai2.player1?.level || 'A'}) & {card.partai2.player2?.name || 'P6'} ({card.partai2.player2?.level || 'C'})
                  </span>
                </div>

                <div className="print-partai-item partai-bb-print">
                  <span className="print-partai-label">Partai 3 (B+B):</span>
                  <span className="print-partai-players">
                    {card.partai3.player1?.name || 'P4'} ({card.partai3.player1?.level || 'B'}) & {card.partai3.player2?.name || 'P5'} ({card.partai3.player2?.level || 'B'})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Meeting Signature Row */}
        <div className="print-signature-row">
          <div className="print-sig-col">
            <p className="print-sig-title">Disetujui oleh Kapten Tim:</p>
            <div className="print-sig-space">
              ( {selectedTeam?.captain || '...........................................'} )
            </div>
            <p className="print-sig-hint">Tanda Tangan & Nama Terang</p>
          </div>

          <div className="print-sig-col">
            <p className="print-sig-title">Panitia Pertandingan / Referee:</p>
            <div className="print-sig-space">
              ( ........................................... )
            </div>
            <p className="print-sig-hint">Tanda Tangan & Nama Terang Panitia</p>
          </div>
        </div>
      </div>

      {/* Rules Modal (Informational) */}
      {showRulesModal && (
        <div className="modal-overlay" onClick={() => setShowRulesModal(false)}>
          <div className="modal-content modal-rules-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="font-extrabold text-lg text-gray-900">Aturan Format Pertandingan & 6 Kartu</h3>
              </div>
              <button onClick={() => setShowRulesModal(false)} className="btn-icon-subtle">✕</button>
            </div>

            <div className="modal-body formation-rules-modal-body">
              <div className="rule-info-card rule-info-orange">
                <h4 className="rule-info-title text-orange-950">1. Urutan Partai per Sesi</h4>
                <p>Setiap sesi pertandingan turnamen akan menggunakan 3 macam partai yang dibagi berdasarkan grading dan urutan berikut:</p>
                <ul className="rule-info-list text-orange-900">
                  <li><b>Partai 1:</b> Grade AB (1 Pemain Grade A + 1 Pemain Grade B/B+)</li>
                  <li><b>Partai 2:</b> Grade AC (1 Pemain Grade A + 1 Pemain Grade C)</li>
                  <li><b>Partai 3:</b> Grade B+B (2 Pemain Grade B / B+ Saling Berpasangan)</li>
                </ul>
                <p className="rule-info-note text-orange-800">Pembagian partai tidak berdasarkan gender.</p>
              </div>

              <div className="rule-info-card rule-info-blue">
                <h4 className="rule-info-title text-blue-950">2. Alokasi 6 Kartu Formasi</h4>
                <p>Setiap tim harus menyiapkan 6 kartu formasi berbeda untuk digunakan pada <b>5 babak penyisihan</b> dan <b>1 babak semifinal</b> secara berbeda-beda.</p>
                <p className="mt-2 font-semibold">Komposisi pemain per tim terdiri dari tepat 6 pemain:</p>
                <ul className="rule-info-list text-blue-900">
                  <li>Pemain 1 & Pemain 2: <b>Grade A</b></li>
                  <li>Pemain 3, Pemain 4, & Pemain 5: <b>Grade B / B+</b></li>
                  <li>Pemain 6: <b>Grade C</b></li>
                </ul>
              </div>

              <div className="rule-info-card rule-info-gray">
                <h4 className="rule-info-title text-gray-900">3. Rotasi Pasangan Tanpa Duplikat</h4>
                <p>Rotasi ini bekerja dengan menukar pemain Grade A (Pemain 1 dan 2) antara Partai 1 dan 2, serta merotasi tiga pemain Grade B (Pemain 3, 4, 5) di Partai 1 dan 3. Hal ini memastikan keenam kartu memiliki susunan pasangan yang unik dan adil di setiap babak tanpa ada pemain yang bermain ganda dalam satu babak.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowRulesModal(false)} className="btn btn-primary text-xs">
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
