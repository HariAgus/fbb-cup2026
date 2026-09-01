import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import confetti from 'canvas-confetti';
import { Users } from 'lucide-react';

export const KnockoutScoreModal = ({ isOpen, onClose, knockoutMatch = null }) => {
  const { data, updateKnockoutScore } = useTournament();

  const [t1Player1, setT1Player1] = useState('');
  const [t2Player1, setT2Player1] = useState('');
  const [t1Score, setT1Score] = useState('');
  const [t2Score, setT2Score] = useState('');
  const [detailScores, setDetailScores] = useState('');
  const [winnerId, setWinnerId] = useState('');

  const allPlayers = data.players || [];
  const teamsMap = (data.teams || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  const team1 = teamsMap[knockoutMatch?.team1Id] || { name: knockoutMatch?.team1Placeholder || 'Tim 1', logo: '🏸', playerIds: [] };
  const team2 = teamsMap[knockoutMatch?.team2Id] || { name: knockoutMatch?.team2Placeholder || 'Tim 2', logo: '🏸', playerIds: [] };

  const team1Players = allPlayers.filter((p) => team1.playerIds?.includes(p.id) || p.teamId === team1.id);
  const team2Players = allPlayers.filter((p) => team2.playerIds?.includes(p.id) || p.teamId === team2.id);

  useEffect(() => {
    if (knockoutMatch) {
      setT1Player1(knockoutMatch.team1PlayerIds?.[0] || '');
      setT2Player1(knockoutMatch.team2PlayerIds?.[0] || '');
      setT1Score(knockoutMatch.team1Score !== null && knockoutMatch.team1Score !== undefined ? String(knockoutMatch.team1Score) : '');
      setT2Score(knockoutMatch.team2Score !== null && knockoutMatch.team2Score !== undefined ? String(knockoutMatch.team2Score) : '');
      setDetailScores(knockoutMatch.detailScores || '');
      setWinnerId(knockoutMatch.winnerId || '');
    }
  }, [knockoutMatch, isOpen]);

  if (!isOpen || !knockoutMatch) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const s1 = t1Score === '' ? null : Number(t1Score);
    const s2 = t2Score === '' ? null : Number(t2Score);

    let chosenWinner = winnerId;
    if (!chosenWinner && s1 !== null && s2 !== null) {
      if (s1 > s2) chosenWinner = knockoutMatch.team1Id;
      else if (s2 > s1) chosenWinner = knockoutMatch.team2Id;
    }

    const t1PIds = t1Player1 ? [t1Player1] : [];
    const t2PIds = t2Player1 ? [t2Player1] : [];

    updateKnockoutScore(knockoutMatch.id, s1, s2, detailScores, chosenWinner, t1PIds, t2PIds);

    // If final, trigger confetti
    if (knockoutMatch.id === 'final' && chosenWinner) {
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 }
        });
      } catch (e) {}
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          <div className="modal-header">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                Skor Playoff: {knockoutMatch.stage}
              </h3>
              <p className="text-2xs text-muted mt-0.5">Update skor dan pemain babak playoff</p>
            </div>
            <button type="button" onClick={onClose} className="btn-icon-subtle text-muted">
              ✕
            </button>
          </div>

          <div className="modal-body flex-1 overflow-y-auto space-y-4">
            <div className="scoreboard-modal-preview">
              <div className="text-center flex-1">
                <div className="text-3xl mb-1">{team1.logo || '🏸'}</div>
                <div className="font-bold text-sm text-gray-900">{team1.name}</div>
              </div>
              <div className="text-muted font-bold text-sm">VS</div>
              <div className="text-center flex-1">
                <div className="text-3xl mb-1">{team2.logo || '🏸'}</div>
                <div className="font-bold text-sm text-gray-900">{team2.name}</div>
              </div>
            </div>

            {/* Lineup Selection */}
            <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-200/80">
              <div className="text-2xs font-bold text-orange-950 mb-2 flex items-center gap-1">
                <Users size={13} className="text-primary" />
                <span>Pemain yang Bertanding:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-3xs text-muted block mb-0.5">{team1.name}:</label>
                  <select
                    value={t1Player1}
                    onChange={(e) => setT1Player1(e.target.value)}
                    className="form-control text-2xs py-1"
                  >
                    <option value="">-- Pilih Pemain --</option>
                    {team1Players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-3xs text-muted block mb-0.5">{team2.name}:</label>
                  <select
                    value={t2Player1}
                    onChange={(e) => setT2Player1(e.target.value)}
                    className="form-control text-2xs py-1"
                  >
                    <option value="">-- Pilih Pemain --</option>
                    {team2Players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group text-center bg-orange-50/50 p-3 rounded-xl border border-orange-200/60">
                <label className="form-label text-xs font-bold text-gray-800 block mb-1">
                  Skor {team1.name}
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  placeholder="0"
                  value={t1Score}
                  onChange={(e) => setT1Score(e.target.value)}
                  className="form-control text-center text-xl font-bold font-mono text-primary py-2"
                />
              </div>

              <div className="form-group text-center bg-blue-50/50 p-3 rounded-xl border border-blue-200/60">
                <label className="form-label text-xs font-bold text-gray-800 block mb-1">
                  Skor {team2.name}
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  placeholder="0"
                  value={t2Score}
                  onChange={(e) => setT2Score(e.target.value)}
                  className="form-control text-center text-xl font-bold font-mono text-blue-600 py-2"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-xs font-bold text-gray-800">
                Rincian Poin Tiap Set (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 21-19, 18-21, 21-15"
                value={detailScores}
                onChange={(e) => setDetailScores(e.target.value)}
                className="form-control text-sm font-mono"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs font-bold text-gray-800">
                Pemenang Laga (Lolos ke Babak Berikutnya)
              </label>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                className="form-control text-sm"
              >
                <option value="">-- Otomatis Berdasarkan Skor Terbesar --</option>
                {knockoutMatch.team1Id && (
                  <option value={knockoutMatch.team1Id}>
                    🏆 {team1.name} Lolos / Juara
                  </option>
                )}
                {knockoutMatch.team2Id && (
                  <option value={knockoutMatch.team2Id}>
                    🏆 {team2.name} Lolos / Juara
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary font-bold">
              Simpan Hasil Playoff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
