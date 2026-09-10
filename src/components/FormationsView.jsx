import React, { useState, useMemo, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { useTournament } from '../context/TournamentContext';
import {
  Layers,
  Printer,
  Download,
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
  ArrowRight,
  Swords,
  MapPin,
  Save,
  FileSpreadsheet,
  Key,
  RefreshCw,
  ClipboardCopy,
  Lock,
  Edit2,
  X,
  Clock,
  CalendarClock,
  Timer,
  AlertCircle
} from 'lucide-react';
import { formatDeadlineDisplay, getDeadlineTimeRemaining } from '../utils/dateUtils';

export const FormationsView = ({ initialTeamId = null, onSelectTeam = null }) => {
  const {
    data,
    isAdmin,
    getFormationCardsForTeam,
    updateTeamFormationSlots,
    updateTeamCaptainCode,
    updateTournamentFormationDeadline,
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

  // Captain Code Edit State
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCodeSuffix, setCustomCodeSuffix] = useState('');
  const [isSavingCode, setIsSavingCode] = useState(false);

  // Global Tournament Formation Deadline State
  const globalDeadline = data.formationDeadline || selectedTeam?.formationDeadline || null;
  const [deadlineInput, setDeadlineInput] = useState('');
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  useEffect(() => {
    setIsEditingCode(false);
    setCustomCodeSuffix('');
  }, [selectedTeamId]);

  useEffect(() => {
    if (globalDeadline) {
      try {
        const d = new Date(globalDeadline);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setDeadlineInput(localISO);
        } else {
          setDeadlineInput('');
        }
      } catch (e) {
        setDeadlineInput('');
      }
    } else {
      setDeadlineInput('');
    }
  }, [globalDeadline]);

  const handleStartEditCode = () => {
    const raw = selectedTeam?.captainCode || '';
    const suffix = raw.replace(/^FBB-?/i, '');
    setCustomCodeSuffix(suffix);
    setIsEditingCode(true);
  };

  const handleSaveCustomCode = async () => {
    const cleaned = customCodeSuffix.trim().toUpperCase();
    if (cleaned.length !== 4) {
      showToast('Kode harus terdiri dari 4 karakter huruf/angka setelah FBB-', 'error');
      return;
    }
    setIsSavingCode(true);
    try {
      const fullCode = `FBB-${cleaned}`;
      const result = await updateTeamCaptainCode(selectedTeam.id, fullCode);
      if (result) {
        setIsEditingCode(false);
      }
    } finally {
      setIsSavingCode(false);
    }
  };

  const handleSaveDeadline = async () => {
    setIsSavingDeadline(true);
    try {
      let isoDeadline = null;
      if (deadlineInput) {
        isoDeadline = new Date(deadlineInput).toISOString();
      }
      await updateTournamentFormationDeadline(isoDeadline);
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const handleClearDeadline = async () => {
    setIsSavingDeadline(true);
    try {
      setDeadlineInput('');
      await updateTournamentFormationDeadline(null);
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const handleSetQuickDeadline = (hoursToAdd) => {
    const target = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localISO = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
    setDeadlineInput(localISO);
  };

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
  // Local round labels state
  const [roundLabels, setRoundLabels] = useState({
    kartu1: 'Match 1',
    kartu2: 'Match 2',
    kartu3: 'Match 3',
    kartu4: 'Match 4',
    kartu5: 'Match 5',
    kartu6: 'Match 6'
  });

  // Detail pertandingan manual per Kartu (Babak, Lapangan, Lawan Tim)
  const [cardDetails, setCardDetails] = useState({
    1: { round: '', court: '', opponent: '' },
    2: { round: '', court: '', opponent: '' },
    3: { round: '', court: '', opponent: '' },
    4: { round: '', court: '', opponent: '' },
    5: { round: '', court: '', opponent: '' },
    6: { round: '', court: '', opponent: '' }
  });

  const handleUpdateCardDetail = (cardIndex, field, value) => {
    setCardDetails((prev) => ({
      ...prev,
      [cardIndex]: {
        ...(prev[cardIndex] || { round: '', court: '', opponent: '' }),
        [field]: value
      }
    }));
  };

  const [printMode, setPrintMode] = useState('all'); // 'all'

  // Synchronize local slots and manual card details whenever selected team changes
  useEffect(() => {
    if (selectedTeam) {
      const saved = selectedTeam.formationSlots || {};
      const savedRounds = selectedTeam.formationRounds || {};
      const savedCardDetails = selectedTeam.formationCardDetails || {};

      // Grade pools
      const poolA = teamPlayers.filter((p) => (p.level || 'B') === 'A');
      const poolBPlus = teamPlayers.filter((p) => (p.level || 'B') === 'B+');
      const poolB = teamPlayers.filter((p) => (p.level || 'B') === 'B');
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
        p3: resolveSlot('p3', poolBPlus.length > 0 ? poolBPlus : poolB),
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

      // Synchronize manual match details per card (no auto system fill, strictly empty by default)
      setCardDetails({
        1: { round: savedCardDetails[1]?.round || '', court: savedCardDetails[1]?.court || '', opponent: savedCardDetails[1]?.opponent || '' },
        2: { round: savedCardDetails[2]?.round || '', court: savedCardDetails[2]?.court || '', opponent: savedCardDetails[2]?.opponent || '' },
        3: { round: savedCardDetails[3]?.round || '', court: savedCardDetails[3]?.court || '', opponent: savedCardDetails[3]?.opponent || '' },
        4: { round: savedCardDetails[4]?.round || '', court: savedCardDetails[4]?.court || '', opponent: savedCardDetails[4]?.opponent || '' },
        5: { round: savedCardDetails[5]?.round || '', court: savedCardDetails[5]?.court || '', opponent: savedCardDetails[5]?.opponent || '' },
        6: { round: savedCardDetails[6]?.round || '', court: savedCardDetails[6]?.court || '', opponent: savedCardDetails[6]?.opponent || '' }
      });
    }
  }, [selectedTeam, teamPlayers, teams]);

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
      p3: pick(poolBPlus.length > 0 ? poolBPlus : poolB),
      p4: pick(poolB),
      p5: pick(poolB),
      p6: pick(poolC)
    };

    setSlotAssignments(newSlots);
    showToast('Slot pemain berhasil diisi otomatis: P1-P2 (Grade A), P3 (Grade B+), P4-P5 (Grade B), P6 (Grade C)!', 'success');
  };

  // Round options for Babak Penyisihan (1 - 6)
  const ROUND_OPTIONS = [
    'Babak Penyisihan 1',
    'Babak Penyisihan 2',
    'Babak Penyisihan 3',
    'Babak Penyisihan 4',
    'Babak Penyisihan 5',
    'Babak Semifinal'
  ];

  // Court options (Lapangan 1 - 6)
  const COURT_OPTIONS = [
    'Lapangan 1',
    'Lapangan 2',
    'Lapangan 3',
    'Lapangan 4',
    'Lapangan 5',
    'Lapangan 6'
  ];

  // Opponent teams: All teams in tournament except current selected team
  const opponentTeams = useMemo(() => {
    if (!selectedTeam) return [];
    return teams.filter((t) => t.id !== selectedTeam.id);
  }, [teams, selectedTeam]);

  // Helper to get already selected rounds in other cards (cannot be duplicated)
  const getUsedRounds = (currentCardIndex) => {
    const used = [];
    Object.entries(cardDetails).forEach(([idx, det]) => {
      if (Number(idx) !== Number(currentCardIndex) && det?.round) {
        used.push(det.round);
      }
    });
    return used;
  };

  // Helper to get already selected opponents in other cards (cannot be duplicated)
  const getUsedOpponents = (currentCardIndex) => {
    const used = [];
    Object.entries(cardDetails).forEach(([idx, det]) => {
      if (Number(idx) !== Number(currentCardIndex) && det?.opponent) {
        used.push(det.opponent);
      }
    });
    return used;
  };

  // Saving state for formation cards & database sync
  const [isSavingCards, setIsSavingCards] = useState(false);
  const [isSavedCards, setIsSavedCards] = useState(false);

  // Save all slots and manual card details to database
  const handleSaveAll = async () => {
    if (!selectedTeam) return;
    setIsSavingCards(true);
    try {
      await updateTeamFormationSlots(selectedTeam.id, slotAssignments, roundLabels, null, null, cardDetails);
      setIsSavedCards(true);
      setTimeout(() => setIsSavedCards(false), 3000);
    } finally {
      setIsSavingCards(false);
    }
  };
  const handleSaveSlots = handleSaveAll;

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

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Auto Download 6 Cards as PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('official-print-cards-container');
    if (!element) return;

    setIsExportingPDF(true);
    showToast('Memproses & mengunduh PDF 6 Kartu Formasi...', 'info');

    // Temporarily show official print container on screen so html2canvas captures full layout
    element.classList.add('pdf-export-active');

    const teamNameClean = (selectedTeam?.name || 'Tim').replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
    const filename = `Kartu_Formasi_${teamNameClean}.pdf`;

    const opt = {
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Short delay to allow layout reflow before canvas capture
      await new Promise((resolve) => setTimeout(resolve, 100));
      await html2pdf().set(opt).from(element).save();
      showToast(`File ${filename} berhasil diunduh!`, 'success');
    } catch (err) {
      console.error('PDF export error, falling back to print dialog:', err);
      window.print();
    } finally {
      element.classList.remove('pdf-export-active');
      setIsExportingPDF(false);
    }
  };
  const handlePrintAll = handleDownloadPDF;

  // Copy WhatsApp broadcast format for all 6 cards with each card's manual details
  const handleCopyWhatsApp = () => {
    if (!currentFormationData || !selectedTeam) return;

    const cards = currentFormationData.cards;
    let text = `🏸 *DAFTAR 6 KARTU FORMASI - FBB CUP 2026*\n`;
    text += `*Tim:* ${selectedTeam.name} (${selectedTeam.shortName || 'PB'})\n`;
    text += `*Kapten:* ${selectedTeam.captain || '-'}\n`;
    text += `*Format:* 3 Partai per Sesi (Grade AB, Grade AC, Grade B(+)B)\n`;
    text += `=====================================\n\n`;

    cards.forEach((card) => {
      const details = cardDetails[card.cardIndex] || {};
      const roundLabel = details.round ? ` • ${details.round}` : '';
      const courtLabel = details.court ? ` • Lap. ${details.court}` : '';
      const oppLabel = details.opponent ? ` • vs ${details.opponent}` : '';

      const p1_p1 = card.partai1.player1?.name || (card.partai1.p1Slot || 'P1');
      const p1_p2 = card.partai1.player2?.name || (card.partai1.p2Slot || 'P4');

      const p2_p1 = card.partai2.player1?.name || (card.partai2.p1Slot || 'P2');
      const p2_p2 = card.partai2.player2?.name || (card.partai2.p2Slot || 'P6');

      const p3_p1 = card.partai3.player1?.name || (card.partai3.p1Slot || 'P3');
      const p3_p2 = card.partai3.player2?.name || (card.partai3.p2Slot || 'P5');

      text += `📋 *${card.cardTitle.toUpperCase()}*${roundLabel}${courtLabel}${oppLabel}\n`;
      text += `1️⃣ Partai 1 (Grade AB): ${p1_p1} & ${p1_p2}\n`;
      text += `2️⃣ Partai 2 (Grade AC): ${p2_p1} & ${p2_p2}\n`;
      text += `3️⃣ Partai 3 (Grade B(+)B): ${p3_p1} & ${p3_p2}\n`;
      text += `-------------------------------------\n`;
    });

    text += `\n_Catatan: Susunan formasi 6 kartu disiapkan resmi untuk turnamen FBB Cup 2026._`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    showToast('Format 6 Kartu berhasil disalin ke WhatsApp!', 'success');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single card WhatsApp text with this card's manual inputs
  const handleCopySingleCard = (card) => {
    if (!selectedTeam) return;

    const details = cardDetails[card.cardIndex] || {};
    const roundLabel = details.round || '-';

    const p1_p1 = card.partai1.player1?.name || (card.partai1.p1Slot || 'P1');
    const p1_p2 = card.partai1.player2?.name || (card.partai1.p2Slot || 'P4');

    const p2_p1 = card.partai2.player1?.name || (card.partai2.p1Slot || 'P2');
    const p2_p2 = card.partai2.player2?.name || (card.partai2.p2Slot || 'P6');

    const p3_p1 = card.partai3.player1?.name || (card.partai3.p1Slot || 'P3');
    const p3_p2 = card.partai3.player2?.name || (card.partai3.p2Slot || 'P5');

    let text = `🏸 *${card.cardTitle.toUpperCase()} - ${selectedTeam.name}*\n`;
    text += `*Kapten:* ${selectedTeam.captain || '-'}\n`;
    text += `*Dimainkan Pada:* ${roundLabel}\n`;
    if (details.court) text += `*Nomor Lapangan:* ${details.court}\n`;
    if (details.opponent) text += `*Lawan Tim:* ${details.opponent}\n`;
    text += `=====================================\n`;
    text += `1️⃣ *Partai 1 (Grade AB):* ${p1_p1} & ${p1_p2}\n`;
    text += `2️⃣ *Partai 2 (Grade AC):* ${p2_p1} & ${p2_p2}\n`;
    text += `3️⃣ *Partai 3 (Grade B(+)B):* ${p3_p1} & ${p3_p2}\n`;
    text += `=====================================\n`;
    text += `_Disahkan resmi oleh Kapten Tim ${selectedTeam.name}._`;

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

  // Render clean, polished player tile without confusing individual grade badge.
  // The match format is explicitly represented by the 3 parties: Grade AB, Grade AC, and Grade B(+)B
  const renderPlayerTile = (player, slotCode) => {
    return (
      <div className="player-tile-card">
        <div className="player-tile-top">
          <span className="player-slot-tag" title={`Slot Pemain ${slotCode ? slotCode.replace('P', '') : ''}`}>
            Pemain {slotCode ? slotCode.replace('P', '') : ''}
          </span>
          <span className="player-tile-shuttle" title="Pemain Ganda">🏸</span>
        </div>
        <div className="player-name-main" title={player?.name}>
          {player?.name || <span className="player-unassigned">Belum diset</span>}
        </div>
      </div>
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
              Sistem pembuatan 6 kartu formasi unik non-duplikat untuk 5 babak penyisihan dan 1 babak semifinal sesuai urutan 3 partai resmi: Grade AB, Grade AC, dan Grade B(+)B.
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
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="btn btn-primary text-xs"
              title="Unduh 6 kartu formasi langsung sebagai file PDF"
            >
              {isExportingPDF ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Mengunduh PDF...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PDF 6 Kartu</span>
                </>
              )}
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
              <div className="partai-rule-desc">1 Pemain Grade A + 1 Pemain Grade B (B+ Tidak dengan A)</div>
            </div>

            <div className="partai-rule-box rule-ac">
              <div className="partai-rule-tag">PARTAI 2 • LANJUTAN</div>
              <div className="partai-rule-name">GRADE AC</div>
              <div className="partai-rule-desc">1 Pemain Grade A + 1 Pemain Grade C</div>
            </div>

            <div className="partai-rule-box rule-bb">
              <div className="partai-rule-tag">PARTAI 3 • PENENTU</div>
              <div className="partai-rule-name">GRADE B(+)B</div>
              <div className="partai-rule-desc">1 Pemain Grade B+ + 1 Pemain Grade B (B+ Khusus dengan B)</div>
            </div>
          </div>

          <div className="formation-rule-footer">
            💡 <b>Prinsip Rotasi:</b> Setiap tim menyiapkan 6 kartu formasi untuk <b>5 babak penyisihan</b> dan <b>1 babak semifinal</b>. Dalam 1 kartu, seluruh 6 pemain bermain tepat 1 kali. Pemain <b>Grade B+ hanya berpasangan dengan Grade B</b> di Partai 3.
          </div>
        </div>

        {/* ⏰ Global Tournament Formation Deadline Card (Admin Only) */}
        {isAdmin && (
          <div className="global-deadline-admin-card glass-card">
            <div className="global-deadline-header">
              <div className="global-deadline-title-wrap">
                <div className="global-deadline-icon-box">
                  <CalendarClock size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="global-deadline-title">
                      Batas Waktu Input Kartu Formasi Turnamen
                    </h3>
                    {globalDeadline ? (
                      (() => {
                        const info = getDeadlineTimeRemaining(globalDeadline);
                        return (
                          <span
                            className={`global-deadline-status-pill ${info.isExpired ? 'status-expired' : 'status-active'
                              }`}
                          >
                            {info.isExpired ? (
                              <>
                                <Lock size={12} />
                                <span>Terkunci (Batas Lewat)</span>
                              </>
                            ) : (
                              <>
                                <Clock size={12} />
                                <span>Aktif ({info.text})</span>
                              </>
                            )}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="global-deadline-status-pill status-open">
                        <span>⚪ Bebas Batas Waktu</span>
                      </span>
                    )}
                  </div>
                  <p className="global-deadline-desc">
                    Atur batas tanggal & jam maksimal pengisian formasi untuk <b>seluruh tim peserta ({teams.length} Tim)</b>. Setelah lewat dari batas waktu, portal kapten otomatis terkunci dan tidak dapat menginput atau mengedit urutan pertandingan lagi.
                  </p>
                </div>
              </div>
            </div>

            <div className="global-deadline-controls">
              {/* Active Deadline Info Alert */}
              {globalDeadline && (
                <div
                  className={`global-deadline-info-row ${getDeadlineTimeRemaining(globalDeadline).isExpired ? 'row-expired' : 'row-active'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="flex-shrink-0" />
                    <span>
                      Batas Pengisian Resmi: <b>{formatDeadlineDisplay(globalDeadline)}</b>
                    </span>
                  </div>
                  <span className="deadline-countdown-badge">
                    {getDeadlineTimeRemaining(globalDeadline).text}
                  </span>
                </div>
              )}

              {/* Input Form & Presets */}
              <div className="global-deadline-form-grid">
                <div className="form-group mb-0 deadline-input-col">
                  <label className="form-label text-xs mb-1.5 font-bold flex items-center gap-1.5 text-gray-800">
                    <Calendar size={13} className="text-primary" />
                    <span>Set Tanggal & Jam Batas Akhir:</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    className="form-control text-xs font-mono font-medium deadline-datetime-input"
                  />
                </div>

                <div className="deadline-presets-col">
                  <span className="text-3xs text-muted font-bold block mb-1.5 uppercase tracking-wider">
                    Pilihan Cepat (Quick Preset):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '+1 Jam', h: 1 },
                      { label: '+3 Jam', h: 3 },
                      { label: '+6 Jam', h: 6 },
                      { label: '+12 Jam', h: 12 },
                      { label: '+1 Hari', h: 24 },
                      { label: '+2 Hari', h: 48 },
                      { label: '+3 Hari', h: 72 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSetQuickDeadline(preset.h)}
                        className="btn btn-2xs btn-secondary preset-btn"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="deadline-actions-col">
                  <button
                    type="button"
                    onClick={handleSaveDeadline}
                    disabled={isSavingDeadline || !deadlineInput}
                    className="btn btn-primary text-xs font-bold w-full sm:w-auto justify-center shadow-xs"
                  >
                    {isSavingDeadline ? (
                      <>
                        <span className="animate-spin text-xs">⏳</span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Simpan Batas Turnamen</span>
                      </>
                    )}
                  </button>

                  {globalDeadline && (
                    <button
                      type="button"
                      onClick={handleClearDeadline}
                      disabled={isSavingDeadline}
                      className="btn btn-secondary text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200"
                      title="Hapus batas waktu (kapten bisa input kapan saja)"
                    >
                      <X size={14} />
                      <span>Hapus Batas (Bebaskan)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Captain Code Management - Admin Only */}
        {isAdmin && selectedTeam && (
          <div className="captain-code-admin-panel">
            <div className="captain-code-header">
              <div className="captain-code-title">
                <Key size={18} className="text-amber-500" />
                <span>Kode Akses Kapten Tim ({selectedTeam?.name})</span>
              </div>
              <span className="captain-code-subtitle">
                Bagikan kode ini ke kapten tim agar mereka bisa mengisi Babak / Match di tab "Kartu Tim". Format: <b>FBB-XXXX</b> (wajib 4 digit huruf/angka).
              </span>
            </div>
            <div className="captain-code-body">
              {isEditingCode ? (
                <div className="captain-code-edit-container">
                  <div className="captain-code-input-box">
                    <span className="captain-code-prefix-badge">FBB-</span>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="4DIGIT"
                      value={customCodeSuffix}
                      onChange={(e) => setCustomCodeSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      className="captain-code-suffix-input"
                      autoFocus
                    />
                  </div>
                  <div className="captain-code-edit-buttons">
                    <button
                      className="btn btn-primary text-xs font-bold"
                      onClick={handleSaveCustomCode}
                      disabled={customCodeSuffix.length !== 4 || isSavingCode}
                    >
                      <Check size={14} />
                      <span>{isSavingCode ? 'Menyimpan...' : 'Simpan Kode'}</span>
                    </button>
                    <button
                      className="btn btn-secondary text-xs font-bold"
                      onClick={() => setIsEditingCode(false)}
                      disabled={isSavingCode}
                    >
                      <X size={14} />
                      <span>Batal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="captain-code-display">
                    {selectedTeam.captainCode ? (
                      <span className="captain-code-value">{selectedTeam.captainCode}</span>
                    ) : (
                      <span className="captain-code-empty">Belum ada kode</span>
                    )}
                  </div>
                  <div className="captain-code-actions">
                    <button
                      className="btn btn-secondary text-xs font-bold"
                      title="Edit kode unik kapten manual"
                      onClick={handleStartEditCode}
                    >
                      <Edit2 size={14} />
                      <span>Edit Kode</span>
                    </button>
                    {selectedTeam.captainCode && (
                      <button
                        className="btn btn-secondary text-xs font-bold"
                        title="Salin kode ke clipboard"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTeam.captainCode);
                          showToast(`Kode ${selectedTeam.captainCode} disalin!`);
                        }}
                      >
                        <ClipboardCopy size={14} />
                        <span>Salin</span>
                      </button>
                    )}
                    <button
                      className="btn btn-primary text-xs font-bold"
                      title={selectedTeam.captainCode ? 'Generate kode acak baru otomatis' : 'Generate kode kapten baru'}
                      onClick={() => updateTeamCaptainCode(selectedTeam.id)}
                    >
                      <RefreshCw size={14} />
                      <span>{selectedTeam.captainCode ? 'Generate Ulang' : 'Generate Kode'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            {selectedTeam.captainCode && !isEditingCode && (
              <div className="captain-code-info">
                <Lock size={12} className="text-muted" />
                <span>Kapten membuka halaman <b>publik → tab "Kartu Tim"</b> dan memasukkan kode <b>{selectedTeam.captainCode}</b> untuk mengisi formasi.</span>
              </div>
            )}
          </div>
        )}

        {/* Slot Configurator (Pemain 1 s/d Pemain 6) */}
        <div className="slot-config-section">
          <div className="slot-config-header">
            <div>
              <h3 className="slot-section-title">
                <Users size={20} className="text-primary" />
                <span>Alokasi 6 Slot Pemain Tim ({selectedTeam?.name})</span>
              </h3>
              <p className="slot-section-desc">
                Tentukan alokasi 6 pemain: Slot 1 & 2 (Grade A), Slot 3 (Grade B+), Slot 4 & 5 (Grade B), dan Slot 6 (Grade C). Grade B+ terkunci khusus bermain di Partai 3 berpasangan dengan Grade B.
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
                  ⭐ Grade B+
                </span>
              </div>

              <select
                value={slotAssignments.p3}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p3: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 3 (Grade B+) --</option>
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
                <span className="badge-level badge-level-b">
                  ⚡ Grade B
                </span>
              </div>

              <select
                value={slotAssignments.p4}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p4: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 4 (Grade B) --</option>
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
                  ⚡ Grade B
                </span>
              </div>

              <select
                value={slotAssignments.p5}
                onChange={(e) => setSlotAssignments((prev) => ({ ...prev, p5: e.target.value }))}
                className="slot-select-input"
              >
                <option value="">-- Pilih Pemain 5 (Grade B) --</option>
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
                Setiap kartu memiliki input manual untuk babak pertandingan, nomor lapangan, dan lawan tim.
              </p>
            </div>

            <div className="cards-deck-actions">

              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="btn btn-secondary font-bold text-xs"
                title="Salin seluruh 6 kartu ke WhatsApp"
              >
                {copiedAll ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                <span>{copiedAll ? 'Tersalin!' : 'Salin Semua (WA)'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="btn btn-secondary font-bold text-xs"
                title="Unduh 6 kartu formasi langsung sebagai file PDF"
              >
                {isExportingPDF ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Mengunduh PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Cetak / Download 6 Kartu</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="formation-cards-grid">
            {(currentFormationData?.cards || []).map((card) => {
              const isCopied = copiedCardIndex === card.cardIndex;
              const isSemifinal = card.cardIndex === 6;
              const details = cardDetails[card.cardIndex] || {};
              const usedRounds = getUsedRounds(card.cardIndex);
              const usedOpponents = getUsedOpponents(card.cardIndex);

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
                        {details.round && (
                          <div className={`card-round-tag ${isSemifinal ? 'round-semifinal' : ''}`}>
                            {details.round}
                          </div>
                        )}
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

                  {/* 📝 Input Dropdown Detail Pertandingan untuk Setiap Kartu */}
                  <div className="card-manual-meta-inputs">
                    {/* 1. Babak Penyisihan 1 - 6 (Tidak Bisa Sama Datanya) */}
                    <div className="card-meta-input-group">
                      <label className="card-meta-label">1. Dimainkan babak penyisihan / match ke berapa:</label>
                      <div className="card-select-wrapper">
                        <select
                          value={details.round || ''}
                          onChange={(e) => handleUpdateCardDetail(card.cardIndex, 'round', e.target.value)}
                          className="card-meta-select-input"
                        >
                          <option value="">-- Pilih Babak Penyisihan (1 - 6) --</option>
                          {ROUND_OPTIONS.map((roundOpt) => {
                            const isUsed = usedRounds.includes(roundOpt);
                            return (
                              <option
                                key={roundOpt}
                                value={roundOpt}
                                disabled={isUsed && details.round !== roundOpt}
                              >
                                {roundOpt} {isUsed && details.round !== roundOpt ? '(Sudah Dipilih di Kartu Lain)' : ''}
                              </option>
                            );
                          })}
                          {details.round && !ROUND_OPTIONS.includes(details.round) && (
                            <option value={details.round}>{details.round}</option>
                          )}
                        </select>
                        <ChevronDown size={14} className="card-select-arrow" />
                      </div>
                    </div>

                    <div className="card-meta-input-row">
                      {/* 2. Lapangan 1 - 6 (Bisa Sama Datanya) */}
                      <div className="card-meta-input-group">
                        <label className="card-meta-label">2. Lapangan berapa:</label>
                        <div className="card-select-wrapper">
                          <select
                            value={details.court || ''}
                            onChange={(e) => handleUpdateCardDetail(card.cardIndex, 'court', e.target.value)}
                            className="card-meta-select-input"
                          >
                            <option value="">-- Pilih Lapangan (1 - 6) --</option>
                            {COURT_OPTIONS.map((courtOpt) => (
                              <option key={courtOpt} value={courtOpt}>
                                {courtOpt}
                              </option>
                            ))}
                            {details.court && !COURT_OPTIONS.includes(details.court) && (
                              <option value={details.court}>{details.court}</option>
                            )}
                          </select>
                          <ChevronDown size={14} className="card-select-arrow" />
                        </div>
                      </div>

                      {/* 3. Lawan Team Siapa (Dari Data Tim Lain, Tidak Bisa Sama Datanya) */}
                      <div className="card-meta-input-group">
                        <label className="card-meta-label">3. Lawan team siapa:</label>
                        <div className="card-select-wrapper">
                          <select
                            value={details.opponent || ''}
                            onChange={(e) => handleUpdateCardDetail(card.cardIndex, 'opponent', e.target.value)}
                            className="card-meta-select-input"
                          >
                            <option value="">-- Pilih Lawan Tim --</option>
                            {opponentTeams.length === 0 ? (
                              <option value="" disabled>(Belum ada tim lawan terdaftar)</option>
                            ) : (
                              opponentTeams.map((oppTeam) => {
                                const isUsed = usedOpponents.includes(oppTeam.name);
                                return (
                                  <option
                                    key={oppTeam.id}
                                    value={oppTeam.name}
                                    disabled={isUsed && details.opponent !== oppTeam.name}
                                  >
                                    {oppTeam.name} ({oppTeam.shortName || 'PB'}) {isUsed && details.opponent !== oppTeam.name ? '(Sudah Dipilih)' : ''}
                                  </option>
                                );
                              })
                            )}
                            {details.opponent && !opponentTeams.some((t) => t.name === details.opponent) && (
                              <option value={details.opponent}>{details.opponent}</option>
                            )}
                          </select>
                          <ChevronDown size={14} className="card-select-arrow" />
                        </div>
                      </div>
                    </div>
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
                          GRADE AB
                        </span>
                      </div>

                      <div className="partai-players-split">
                        {renderPlayerTile(card.partai1.player1, card.partai1.p1Slot || 'P1')}
                        <div className="pair-and-badge">&</div>
                        {renderPlayerTile(card.partai1.player2, card.partai1.p2Slot || 'P4')}
                      </div>
                    </div>

                    {/* Partai 2: Grade AC */}
                    <div className="partai-row-box partai-ac">
                      <div className="partai-header-row">
                        <span className="partai-order-label">
                          <span className="partai-num-pill">2</span> PARTAI 2
                        </span>
                        <span className="partai-grade-badge badge-partai-ac">
                          GRADE AC
                        </span>
                      </div>

                      <div className="partai-players-split">
                        {renderPlayerTile(card.partai2.player1, card.partai2.p1Slot || 'P2')}
                        <div className="pair-and-badge">&</div>
                        {renderPlayerTile(card.partai2.player2, card.partai2.p2Slot || 'P6')}
                      </div>
                    </div>

                    {/* Partai 3: Grade B(+)B */}
                    <div className="partai-row-box partai-bb">
                      <div className="partai-header-row">
                        <span className="partai-order-label">
                          <span className="partai-num-pill">3</span> PARTAI 3
                        </span>
                        <span className="partai-grade-badge badge-partai-bb">
                          GRADE B(+)B
                        </span>
                      </div>

                      <div className="partai-players-split">
                        {renderPlayerTile(card.partai3.player1, card.partai3.p1Slot || 'P3')}
                        <div className="pair-and-badge">&</div>
                        {renderPlayerTile(card.partai3.player2, card.partai3.p2Slot || 'P5')}
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

          {/* Bottom Action Bar for Admin convenience */}
          {isAdmin && (
            <div className="cards-deck-bottom-actions">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSavingCards}
                className="btn btn-primary font-bold text-sm py-2.5 px-6 shadow-md"
                title="Simpan seluruh susunan 6 kartu formasi dan detail pertandingan langsung ke database"
              >
                {isSavingCards ? (
                  <>
                    <span className="animate-spin text-base">⏳</span>
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : isSavedCards ? (
                  <>
                    <Check size={18} className="text-white" />
                    <span>Seluruh Kartu Berhasil Disimpan ke Database ✓</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Simpan Seluruh Kartu Formasi ke Database</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🖨️ OFFICIAL PRINT / PDF TECHNICAL MEETING SHEET (Rendered during Print)   */}
      {/* ========================================================================= */}
      <div id="official-print-cards-container" className="official-print-container print-only">
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
            <span>Aturan: <b>Partai 1 (Grade AB)</b> • <b>Partai 2 (Grade AC)</b> • <b>Partai 3 (Grade B(+)B)</b></span>
            <span>Alokasi: 5 Babak Penyisihan &amp; 1 Babak Semifinal</span>
          </div>
        </div>

        <div className="print-cards-grid">
          {(currentFormationData?.cards || []).map((card) => {
            const details = cardDetails[card.cardIndex] || {};
            return (
              <div key={card.cardIndex} className="print-card-box">
                <div className="print-card-box-header">
                  <div>
                    <span className="print-card-title">{card.cardTitle.toUpperCase()}</span>
                  </div>
                  {details.round && (
                    <div className="print-card-opp-badge">
                      <span className="print-card-round">{details.round}</span>
                    </div>
                  )}
                </div>

                {/* 📝 Header Detail Pertandingan per Kartu (Selalu Tampil di Hasil Cetak PDF / Print) */}
                <div className="print-card-manual-fields">
                  <div className="print-manual-field-row">
                    <span className="print-field-lbl">1. Babak / Match:</span>
                    <span className="print-field-val">
                      {details.round ? details.round : '....................................'}
                    </span>
                  </div>
                  <div className="print-manual-field-split">
                    <div className="print-manual-field-row">
                      <span className="print-field-lbl">2. Lapangan:</span>
                      <span className="print-field-val">
                        {details.court ? details.court : '....................................'}
                      </span>
                    </div>
                    <div className="print-manual-field-row">
                      <span className="print-field-lbl">3. Lawan:</span>
                      <span className="print-field-val">
                        {details.opponent ? details.opponent : '....................................'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="print-partai-list">
                  <div className="print-partai-item partai-ab-print">
                    <span className="print-partai-label">Partai 1 (Grade AB):</span>
                    <span className="print-partai-players">
                      {card.partai1.player1?.name || (card.partai1.p1Slot || 'P1')} &amp; {card.partai1.player2?.name || (card.partai1.p2Slot || 'P4')}
                    </span>
                  </div>

                  <div className="print-partai-item partai-ac-print">
                    <span className="print-partai-label">Partai 2 (Grade AC):</span>
                    <span className="print-partai-players">
                      {card.partai2.player1?.name || (card.partai2.p1Slot || 'P2')} &amp; {card.partai2.player2?.name || (card.partai2.p2Slot || 'P6')}
                    </span>
                  </div>

                  <div className="print-partai-item partai-bb-print">
                    <span className="print-partai-label">Partai 3 (Grade B(+)B):</span>
                    <span className="print-partai-players">
                      {card.partai3.player1?.name || (card.partai3.p1Slot || 'P3')} &amp; {card.partai3.player2?.name || (card.partai3.p2Slot || 'P5')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="print-signature-row">
          <div className="print-sig-col">
            <p className="print-sig-title">Disetujui oleh Kapten Tim:</p>
            <div className="print-sig-space">
              ( {selectedTeam?.captain || '...........................................'} )
            </div>
            <p className="print-sig-hint">{selectedTeam?.name}</p>
          </div>

          <div className="print-sig-col">
            <p className="print-sig-title">Panitia Pertandingan / Referee:</p>
            <div className="print-sig-space">
              ( ........................................... )
            </div>
            <p className="print-sig-hint">Tanda Tangan &amp; Nama Terang Panitia</p>
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
                  <li><b>Partai 1:</b> Grade AB (1 Pemain Grade A + 1 Pemain Grade B reguler)</li>
                  <li><b>Partai 2:</b> Grade AC (1 Pemain Grade A + 1 Pemain Grade C)</li>
                  <li><b>Partai 3:</b> Grade B(+)B (1 Pemain Grade B+ + 1 Pemain Grade B reguler)</li>
                </ul>
                <p className="rule-info-note text-orange-800">Pembagian partai tidak berdasarkan gender. Pemain Grade B+ hanya bisa bermain dengan Grade B (tidak boleh berpasangan dengan Grade A).</p>
              </div>

              <div className="rule-info-card rule-info-blue">
                <h4 className="rule-info-title text-blue-950">2. Alokasi 6 Kartu Formasi</h4>
                <p>Setiap tim harus menyiapkan 6 kartu formasi untuk digunakan pada <b>5 babak penyisihan</b> dan <b>1 babak semifinal</b>.</p>
                <p className="mt-2 font-semibold">Komposisi pemain per tim terdiri dari tepat 6 pemain:</p>
                <ul className="rule-info-list text-blue-900">
                  <li>Pemain 1 & Pemain 2: <b>Grade A</b></li>
                  <li>Pemain 3: <b>Grade B+</b></li>
                  <li>Pemain 4 & Pemain 5: <b>Grade B</b></li>
                  <li>Pemain 6: <b>Grade C</b></li>
                </ul>
              </div>

              <div className="rule-info-card rule-info-gray">
                <h4 className="rule-info-title text-gray-900">3. Rotasi Pasangan Tanpa Duplikat</h4>
                <p>Partai 1 (Grade AB) memasangkan salah satu pemain Grade A (P1/P2) dengan salah satu pemain Grade B (P4/P5). Partai 2 (Grade AC) memasangkan pemain Grade A lainnya dengan Grade C (P6). Partai 3 (Grade B(+)B) secara khusus memasangkan pemain Grade B+ (P3) dengan pemain Grade B yang tersisa (P5/P4). Hal ini menjamin seluruh 6 pemain bermain tepat satu kali di setiap babak dan Grade B+ hanya berpasangan dengan level B.</p>
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
