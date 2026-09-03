import React, { useState, useEffect, useMemo } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Users, MapPin, Clock, Calendar, Trophy, AlertCircle } from 'lucide-react';

export const ScoreModal = ({ isOpen, onClose, match = null }) => {
  const { updateMatchScore, data } = useTournament();

  const [t1Score, setT1Score] = useState('');
  const [t2Score, setT2Score] = useState('');
  const [detailScores, setDetailScores] = useState('');
  const [status, setStatus] = useState('finished');
  const [pitch, setPitch] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  // 2 Score Input Modes: 'manual_total' (Default - Opsi 2) or 'sets' (Opsi 1)
  const [scoreInputMode, setScoreInputMode] = useState('manual_total');

  // Manual total score states (Opsi 2)
  const [manualT1Total, setManualT1Total] = useState('');
  const [manualT2Total, setManualT2Total] = useState('');

  // Per-set score states (Opsi 1)
  const [s1T1, setS1T1] = useState('');
  const [s1T2, setS1T2] = useState('');
  const [s2T1, setS2T1] = useState('');
  const [s2T2, setS2T2] = useState('');
  const [s3T1, setS3T1] = useState('');
  const [s3T2, setS3T2] = useState('');
  const [scoreError, setScoreError] = useState('');

  // Player Selection per Match
  const [t1Player1, setT1Player1] = useState('');
  const [t1Player2, setT1Player2] = useState('');
  const [t2Player1, setT2Player1] = useState('');
  const [t2Player2, setT2Player2] = useState('');

  const teams = data.teams || [];
  const allPlayers = data.players || [];

  const team1 = teams.find((t) => t.id === match?.team1Id) || { name: 'Tim 1', logo: '🏸' };
  const team2 = teams.find((t) => t.id === match?.team2Id) || { name: 'Tim 2', logo: '🏸' };

  // Filter players belonging to Team 1 and Team 2
  const team1Players = allPlayers.filter((p) => team1.playerIds?.includes(p.id) || p.teamId === team1.id);
  const team2Players = allPlayers.filter((p) => team2.playerIds?.includes(p.id) || p.teamId === team2.id);

  // Parse existing detailScores into set states
  const parseSetsFromString = (str) => {
    if (!str) return { s1: ['', ''], s2: ['', ''], s3: ['', ''] };
    const matches = str.match(/\b(\d+)\s*[-:]\s*(\d+)\b/g) || [];
    const getParts = (idx) => {
      if (!matches[idx]) return ['', ''];
      const p = matches[idx].split(/[-:]/);
      return [p[0].trim(), p[1].trim()];
    };
    return {
      s1: getParts(0),
      s2: getParts(1),
      s3: getParts(2)
    };
  };

  useEffect(() => {
    if (match) {
      setT1Score(match.team1Score !== null && match.team1Score !== undefined ? String(match.team1Score) : '');
      setT2Score(match.team2Score !== null && match.team2Score !== undefined ? String(match.team2Score) : '');
      const ds = match.detailScores || '';
      setDetailScores(ds);

      const parsed = parseSetsFromString(ds);
      setS1T1(parsed.s1[0]);
      setS1T2(parsed.s1[1]);
      setS2T1(parsed.s2[0]);
      setS2T2(parsed.s2[1]);
      setS3T1(parsed.s3[0]);
      setS3T2(parsed.s3[1]);

      // Set manual total points if present
      const m1 = match.team1TotalPoints !== undefined && match.team1TotalPoints !== null ? String(match.team1TotalPoints) : '';
      const m2 = match.team2TotalPoints !== undefined && match.team2TotalPoints !== null ? String(match.team2TotalPoints) : '';
      setManualT1Total(m1);
      setManualT2Total(m2);

      // Determine initial scoreInputMode - default is Opsi 2 (manual_total)
      if (parsed.s1[0] && m1 === '' && m2 === '' && !ds.toLowerCase().includes('total:')) {
        setScoreInputMode('sets');
      } else {
        setScoreInputMode('manual_total');
      }

      setScoreError('');
      setStatus(match.status || 'scheduled');
      setPitch(match.pitch || '');
      setTime(match.time || '');
      setDate(match.date || '');

      // Populate players
      const t1P = match.team1PlayerIds || [];
      const t2P = match.team2PlayerIds || [];
      setT1Player1(t1P[0] || '');
      setT1Player2(t1P[1] || '');
      setT2Player1(t2P[0] || '');
      setT2Player2(t2P[1] || '');
    }
  }, [match, isOpen]);

  // Live total points calculated from sets
  const liveTotals = useMemo(() => {
    let t1Total = 0;
    let t2Total = 0;
    let validSetsCount = 0;
    if (s1T1 !== '' && s1T2 !== '') {
      t1Total += Number(s1T1) || 0;
      t2Total += Number(s1T2) || 0;
      validSetsCount++;
    }
    if (s2T1 !== '' && s2T2 !== '') {
      t1Total += Number(s2T1) || 0;
      t2Total += Number(s2T2) || 0;
      validSetsCount++;
    }
    if (s3T1 !== '' && s3T2 !== '') {
      t1Total += Number(s3T1) || 0;
      t2Total += Number(s3T2) || 0;
      validSetsCount++;
    }
    return { t1Total, t2Total, diff: t1Total - t2Total, validSetsCount };
  }, [s1T1, s1T2, s2T1, s2T2, s3T1, s3T2]);

  // Handle switching modes: sync calculated values between modes
  const handleModeSwitch = (newMode) => {
    setScoreError('');
    setScoreInputMode(newMode);
    if (newMode === 'manual_total') {
      if (liveTotals.validSetsCount > 0 && (manualT1Total === '' || manualT2Total === '')) {
        setManualT1Total(String(liveTotals.t1Total));
        setManualT2Total(String(liveTotals.t2Total));
      }
    }
  };

  const handleSetChange = (setIndex, teamIndex, val) => {
    setScoreError('');
    let nS1T1 = s1T1, nS1T2 = s1T2;
    let nS2T1 = s2T1, nS2T2 = s2T2;
    let nS3T1 = s3T1, nS3T2 = s3T2;

    if (setIndex === 1) {
      if (teamIndex === 1) { nS1T1 = val; setS1T1(val); }
      else { nS1T2 = val; setS1T2(val); }
    } else if (setIndex === 2) {
      if (teamIndex === 1) { nS2T1 = val; setS2T1(val); }
      else { nS2T2 = val; setS2T2(val); }
    } else if (setIndex === 3) {
      if (teamIndex === 1) { nS3T1 = val; setS3T1(val); }
      else { nS3T2 = val; setS3T2(val); }
    }

    // Reconstruct detailScores string
    const setStrings = [];
    if (nS1T1 !== '' && nS1T2 !== '') setStrings.push(`${nS1T1}-${nS1T2}`);
    if (nS2T1 !== '' && nS2T2 !== '') setStrings.push(`${nS2T1}-${nS2T2}`);
    if (nS3T1 !== '' && nS3T2 !== '') setStrings.push(`${nS3T1}-${nS3T2}`);
    const newDs = setStrings.join(', ');
    setDetailScores(newDs);

    // Calculate games won
    let gw1 = 0;
    let gw2 = 0;
    if (nS1T1 !== '' && nS1T2 !== '') {
      if (Number(nS1T1) > Number(nS1T2)) gw1++;
      else if (Number(nS1T2) > Number(nS1T1)) gw2++;
    }
    if (nS2T1 !== '' && nS2T2 !== '') {
      if (Number(nS2T1) > Number(nS2T2)) gw1++;
      else if (Number(nS2T2) > Number(nS2T1)) gw2++;
    }
    if (nS3T1 !== '' && nS3T2 !== '') {
      if (Number(nS3T1) > Number(nS3T2)) gw1++;
      else if (Number(nS3T2) > Number(nS3T1)) gw2++;
    }

    if (setStrings.length > 0) {
      setT1Score(String(gw1));
      setT2Score(String(gw2));
      if (gw1 >= 2 || gw2 >= 2) {
        setStatus('finished');
      }
    }
  };

  const handleRawDetailScoresChange = (rawStr) => {
    setScoreError('');
    setDetailScores(rawStr);
    const parsed = parseSetsFromString(rawStr);
    setS1T1(parsed.s1[0]);
    setS1T2(parsed.s1[1]);
    setS2T1(parsed.s2[0]);
    setS2T2(parsed.s2[1]);
    setS3T1(parsed.s3[0]);
    setS3T2(parsed.s3[1]);
  };

  if (!isOpen || !match) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalT1TotalPts = null;
    let finalT2TotalPts = null;
    let finalDetailScores = detailScores;

    // Validation when match is finished
    if (status === 'finished') {
      if (scoreInputMode === 'manual_total') {
        if (manualT1Total === '' || manualT2Total === '') {
          setScoreError('Total skor Tim 1 dan Tim 2 wajib diisi agar terhitung di klasemen!');
          return;
        }
        finalT1TotalPts = Number(manualT1Total);
        finalT2TotalPts = Number(manualT2Total);
        if (!finalDetailScores || finalDetailScores.toLowerCase().startsWith('total:')) {
          finalDetailScores = `Total: ${manualT1Total}-${manualT2Total}`;
        }
      } else {
        if (!detailScores.trim() || liveTotals.validSetsCount === 0) {
          setScoreError('Skor per set wajib diisi untuk pertandingan selesai agar terhitung di klasemen! (Minimal Set 1 & Set 2)');
          return;
        }
        finalT1TotalPts = liveTotals.t1Total;
        finalT2TotalPts = liveTotals.t2Total;
      }

      if (t1Score === '' || t2Score === '') {
        setScoreError('Skor game menang wajib diisi untuk status pertandingan selesai!');
        return;
      }
    } else {
      if (scoreInputMode === 'manual_total' && manualT1Total !== '' && manualT2Total !== '') {
        finalT1TotalPts = Number(manualT1Total);
        finalT2TotalPts = Number(manualT2Total);
      } else if (liveTotals.validSetsCount > 0) {
        finalT1TotalPts = liveTotals.t1Total;
        finalT2TotalPts = liveTotals.t2Total;
      }
    }

    const t1PIds = [t1Player1, t1Player2].filter(Boolean);
    const t2PIds = [t2Player1, t2Player2].filter(Boolean);

    updateMatchScore(
      match.id,
      t1Score === '' ? null : Number(t1Score),
      t2Score === '' ? null : Number(t2Score),
      finalDetailScores,
      status,
      t1PIds,
      t2PIds,
      pitch,
      time,
      date,
      finalT1TotalPts,
      finalT2TotalPts
    );
    onClose();
  };

  const manualDiff = (Number(manualT1Total) || 0) - (Number(manualT2Total) || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          {/* Modal Header */}
          <div className="modal-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Update Skor & Susunan Pemain
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', margin: 0 }}>
                Pilih pemain, jadwal laga, dan masukkan hasil skor pertandingan
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn-icon-subtle text-muted">
              ✕
            </button>
          </div>

          {/* Modal Body with Generous Margins & Clear Card Separation */}
          <div className="modal-body">
            {/* 1. Match Versus Box */}
            <div className="modal-section" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ fontSize: '1.4rem' }}>{team1.logo}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>{team1.name}</span>
                </div>
                <span className="badge badge-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>VS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, justifyContent: 'flex-end' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>{team2.name}</span>
                  <span style={{ fontSize: '1.4rem' }}>{team2.logo}</span>
                </div>
              </div>
            </div>

            {/* 2. Lokasi & Jadwal Pertandingan */}
            <div className="modal-section">
              <div className="field-label" style={{ fontSize: '0.85rem' }}>
                <MapPin size={15} className="text-primary" />
                <span>Lokasi & Waktu Laga</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="field-group">
                  <label className="field-label">Lapangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Court 1"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="form-control text-xs"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-control text-xs"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Waktu</label>
                  <input
                    type="text"
                    placeholder="Contoh: 09:00 WIB"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-control text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Skor Game Menang (Game Won) */}
            <div className="modal-section">
              <div className="field-label" style={{ fontSize: '0.85rem' }}>
                <Trophy size={15} className="text-primary" />
                <span>Skor Game / Set Menang</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="score-box-t1">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9A3412', textAlign: 'center' }}>
                    Skor Game {team1.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    placeholder="0"
                    value={t1Score}
                    onChange={(e) => setT1Score(e.target.value)}
                    className="form-control text-center"
                    style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E06020', width: '85px', height: '46px' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#C2410C' }}>Jumlah Set Menang</span>
                </div>

                <div className="score-box-t2">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E40AF', textAlign: 'center' }}>
                    Skor Game {team2.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    placeholder="0"
                    value={t2Score}
                    onChange={(e) => setT2Score(e.target.value)}
                    className="form-control text-center"
                    style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563EB', width: '85px', height: '46px' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#1D4ED8' }}>Jumlah Set Menang</span>
                </div>
              </div>
            </div>

            {/* 4. PERHITUNGAN SKOR KLASEMEN (HIGHLIGHT CARD DENGAN MARGIN LUAS) */}
            <div className="modal-section-highlight">
              {/* Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div className="field-label" style={{ fontSize: '0.9rem', color: '#7C2D12' }}>
                    <Trophy size={16} className="text-primary" />
                    <span>Perhitungan Skor Klasemen</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Wajib</span>
                  </div>
                  <p className="field-label-sub" style={{ margin: '4px 0 0 0' }}>
                    Poin total digunakan sebagai tie-breaker penentu peringkat saat poin & GD sama
                  </p>
                </div>

                {/* Status Badge */}
                {scoreInputMode === 'manual_total' && manualT1Total !== '' && manualT2Total !== '' && (
                  <span className="badge bg-emerald-100 text-emerald-800" style={{ border: '1px solid #6EE7B7', fontWeight: 800, fontSize: '0.75rem', padding: '4px 10px' }}>
                    Total: {manualT1Total} - {manualT2Total}
                  </span>
                )}
                {scoreInputMode === 'sets' && liveTotals.validSetsCount > 0 && (
                  <span className="badge bg-emerald-100 text-emerald-800" style={{ border: '1px solid #6EE7B7', fontWeight: 800, fontSize: '0.75rem', padding: '4px 10px' }}>
                    Total: {liveTotals.t1Total} - {liveTotals.t2Total}
                  </span>
                )}
              </div>

              {/* Dropdown Selector */}
              <div className="field-group" style={{ marginTop: '2px' }}>
                <label className="field-label">Pilih Metode Input Skor:</label>
                <select
                  value={scoreInputMode}
                  onChange={(e) => handleModeSwitch(e.target.value)}
                  className="form-control"
                  style={{ fontWeight: 600, fontSize: '0.88rem', height: '42px', borderColor: '#FDBA74' }}
                >
                  <option value="manual_total"># Opsi 2: Langsung Total Skor Antar Tim (Default)</option>
                  <option value="sets"># Opsi 1: Rincian Skor Per Set (Set 1, 2, 3)</option>
                </select>
              </div>

              {/* OPSI 2 (DEFAULT) */}
              {scoreInputMode === 'manual_total' && (
                <div className="modal-inner-card" style={{ marginTop: '4px' }}>
                  <div className="modal-inner-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9A3412' }}>
                      # Opsi 2: Input Manual Total Skor
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      Masukkan akumulasi skor total poin yang didapat masing-masing tim
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4" style={{ marginTop: '4px' }}>
                    {/* Team 1 */}
                    <div className="score-box-t1" style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#9A3412', width: '100%' }}>
                        <span>{team1.logo}</span>
                        <span className="truncate">Total Skor {team1.name}</span>
                        <span style={{ color: '#E06020' }}>*</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Contoh: 42"
                        value={manualT1Total}
                        onChange={(e) => {
                          setScoreError('');
                          setManualT1Total(e.target.value);
                        }}
                        className="form-control text-center"
                        style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E06020', width: '100%', height: '46px' }}
                      />
                    </div>

                    {/* Team 2 */}
                    <div className="score-box-t2" style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1E40AF', width: '100%' }}>
                        <span>{team2.logo}</span>
                        <span className="truncate">Total Skor {team2.name}</span>
                        <span style={{ color: '#2563EB' }}>*</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Contoh: 30"
                        value={manualT2Total}
                        onChange={(e) => {
                          setScoreError('');
                          setManualT2Total(e.target.value);
                        }}
                        className="form-control text-center"
                        style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB', width: '100%', height: '46px' }}
                      />
                    </div>
                  </div>

                  {/* Summary row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                    <span style={{ color: '#64748B' }}>
                      Total Poin: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{manualT1Total || '0'} - {manualT2Total || '0'}</strong>
                    </span>
                    {manualT1Total !== '' && manualT2Total !== '' && (
                      <span style={{ fontWeight: 700, color: manualDiff > 0 ? '#059669' : manualDiff < 0 ? '#DC2626' : '#64748B' }}>
                        Selisih Poin (PD): {manualDiff > 0 ? `+${manualDiff}` : manualDiff}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* OPSI 1 (PER SET) */}
              {scoreInputMode === 'sets' && (
                <div className="modal-inner-card" style={{ marginTop: '4px' }}>
                  <div className="modal-inner-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9A3412' }}>
                      # Opsi 1: Rincian Skor Per Set
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      Set 1 & 2 wajib diisi, Set 3 jika terjadi rubber game
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginTop: '4px' }}>
                    {/* Set 1 */}
                    <div className="set-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        <span>Set 1</span>
                        <span style={{ color: '#E06020' }}>*Wajib</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          placeholder="21"
                          value={s1T1}
                          onChange={(e) => handleSetChange(1, 1, e.target.value)}
                          className="form-control text-center"
                          style={{ width: '58px', height: '40px', fontWeight: 700, padding: '4px' }}
                        />
                        <span style={{ fontWeight: 800, color: '#94A3B8' }}>-</span>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          placeholder="19"
                          value={s1T2}
                          onChange={(e) => handleSetChange(1, 2, e.target.value)}
                          className="form-control text-center"
                          style={{ width: '58px', height: '40px', fontWeight: 700, padding: '4px' }}
                        />
                      </div>
                    </div>

                    {/* Set 2 */}
                    <div className="set-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        <span>Set 2</span>
                        <span style={{ color: '#E06020' }}>*Wajib</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          placeholder="21"
                          value={s2T1}
                          onChange={(e) => handleSetChange(2, 1, e.target.value)}
                          className="form-control text-center"
                          style={{ width: '58px', height: '40px', fontWeight: 700, padding: '4px' }}
                        />
                        <span style={{ fontWeight: 800, color: '#94A3B8' }}>-</span>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          placeholder="18"
                          value={s2T2}
                          onChange={(e) => handleSetChange(2, 2, e.target.value)}
                          className="form-control text-center"
                          style={{ width: '58px', height: '40px', fontWeight: 700, padding: '4px' }}
                        />
                      </div>
                    </div>

                    {/* Set 3 */}
                    <div className="set-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        <span>Set 3</span>
                        <span style={{ color: '#64748B', fontWeight: 400 }}>(Rubber)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          placeholder="-"
                          value={s3T1}
                          onChange={(e) => handleSetChange(3, 1, e.target.value)}
                          className="form-control text-center"
                          style={{ width: '58px', height: '40px', fontWeight: 700, padding: '4px' }}
                        />
                        <span style={{ fontWeight: 800, color: '#94A3B8' }}>-</span>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          placeholder="-"
                          value={s3T2}
                          onChange={(e) => handleSetChange(3, 2, e.target.value)}
                          className="form-control text-center"
                          style={{ width: '58px', height: '40px', fontWeight: 700, padding: '4px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* String format */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span style={{ color: '#64748B', whiteSpace: 'nowrap' }}>Format teks:</span>
                      <input
                        type="text"
                        placeholder="Contoh: 21-19, 18-21, 21-15"
                        value={detailScores}
                        onChange={(e) => handleRawDetailScoresChange(e.target.value)}
                        className="form-control"
                        style={{ height: '36px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                      />
                    </div>
                    {liveTotals.validSetsCount > 0 && (
                      <span style={{ fontWeight: 700, color: liveTotals.diff > 0 ? '#059669' : liveTotals.diff < 0 ? '#DC2626' : '#64748B', whiteSpace: 'nowrap' }}>
                        Selisih: {liveTotals.diff > 0 ? `+${liveTotals.diff}` : liveTotals.diff}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Error alert */}
              {scoreError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '10px', color: '#B91C1C', fontSize: '0.82rem', fontWeight: 600, marginTop: '8px' }}>
                  <AlertCircle size={17} style={{ color: '#DC2626', flexShrink: 0 }} />
                  <span>{scoreError}</span>
                </div>
              )}
            </div>

            {/* 5. Susunan Pemain Laga (Tunggal / Ganda) */}
            <div className="modal-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="field-label" style={{ fontSize: '0.85rem' }}>
                  <Users size={15} className="text-primary" />
                  <span>Susunan Pemain Laga</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Tunggal atau Ganda (1 atau 2 pemain)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Team 1 */}
                <div className="player-select-card">
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{team1.logo}</span>
                    <span>Pemain {team1.name}</span>
                  </span>
                  <div className="field-group">
                    <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Pemain 1</label>
                    <select
                      value={t1Player1}
                      onChange={(e) => setT1Player1(e.target.value)}
                      className="form-control"
                      style={{ height: '38px', fontSize: '0.82rem' }}
                    >
                      <option value="">-- Pilih Pemain 1 --</option>
                      {team1Players.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Pemain 2 (Opsional / Ganda)</label>
                    <select
                      value={t1Player2}
                      onChange={(e) => setT1Player2(e.target.value)}
                      className="form-control"
                      style={{ height: '38px', fontSize: '0.82rem' }}
                    >
                      <option value="">-- Tidak ada (Tunggal) / Pilih --</option>
                      {team1Players.filter((p) => p.id !== t1Player1).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="player-select-card">
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{team2.logo}</span>
                    <span>Pemain {team2.name}</span>
                  </span>
                  <div className="field-group">
                    <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Pemain 1</label>
                    <select
                      value={t2Player1}
                      onChange={(e) => setT2Player1(e.target.value)}
                      className="form-control"
                      style={{ height: '38px', fontSize: '0.82rem' }}
                    >
                      <option value="">-- Pilih Pemain 1 --</option>
                      {team2Players.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Pemain 2 (Opsional / Ganda)</label>
                    <select
                      value={t2Player2}
                      onChange={(e) => setT2Player2(e.target.value)}
                      className="form-control"
                      style={{ height: '38px', fontSize: '0.82rem' }}
                    >
                      <option value="">-- Tidak ada (Tunggal) / Pilih --</option>
                      {team2Players.filter((p) => p.id !== t2Player1).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Status Pertandingan */}
            <div className="modal-section">
              <div className="field-group">
                <label className="field-label" style={{ fontSize: '0.85rem' }}>
                  Status Pertandingan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control"
                  style={{ height: '42px', fontSize: '0.88rem' }}
                >
                  <option value="finished">🟢 Selesai (Klasemen terhitung)</option>
                  <option value="live">🔴 Sedang Bertanding (Live)</option>
                  <option value="scheduled">⚪ Terjadwal (Belum Main)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
              Simpan Data Pertandingan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
