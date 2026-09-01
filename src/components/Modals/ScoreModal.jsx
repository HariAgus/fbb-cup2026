import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Users } from 'lucide-react';

export const ScoreModal = ({ isOpen, onClose, match = null }) => {
  const { updateMatchScore, data } = useTournament();

  const [t1Score, setT1Score] = useState('');
  const [t2Score, setT2Score] = useState('');
  const [detailScores, setDetailScores] = useState('');
  const [status, setStatus] = useState('finished');

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

  useEffect(() => {
    if (match) {
      setT1Score(match.team1Score !== null && match.team1Score !== undefined ? String(match.team1Score) : '');
      setT2Score(match.team2Score !== null && match.team2Score !== undefined ? String(match.team2Score) : '');
      setDetailScores(match.detailScores || '');
      setStatus(match.status || 'scheduled');

      // Populate players
      const t1P = match.team1PlayerIds || [];
      const t2P = match.team2PlayerIds || [];
      setT1Player1(t1P[0] || '');
      setT1Player2(t1P[1] || '');
      setT2Player1(t2P[0] || '');
      setT2Player2(t2P[1] || '');
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const t1PIds = [t1Player1, t1Player2].filter(Boolean);
    const t2PIds = [t2Player1, t2Player2].filter(Boolean);

    updateMatchScore(
      match.id,
      t1Score === '' ? null : Number(t1Score),
      t2Score === '' ? null : Number(t2Score),
      detailScores,
      status,
      t1PIds,
      t2PIds
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          <div className="modal-header">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Update Skor & Susunan Pemain</h3>
              <p className="text-2xs text-muted mt-0.5">Pilih pemain yang bertanding dan perbarui hasil skor laga</p>
            </div>
            <button type="button" onClick={onClose} className="btn-icon-subtle text-muted">
              ✕
            </button>
          </div>

          <div className="modal-body flex-1 overflow-y-auto space-y-4">
            {/* Match Versus Box */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <span>{team1.logo}</span>
                <span>{team1.name}</span>
              </div>
              <span className="badge badge-primary text-2xs">VS</span>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <span>{team2.name}</span>
                <span>{team2.logo}</span>
              </div>
            </div>

            {/* Score Inputs (Set Won / Games Won) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group text-center bg-orange-50/50 p-3 rounded-xl border border-orange-200/60">
                <label className="form-label text-xs font-bold text-gray-800 block mb-1">
                  Skor {team1.name} (Game Menang)
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
                  Skor {team2.name} (Game Menang)
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

            {/* PLAYER SELECTION / LINEUP PER MATCH */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Users size={14} className="text-primary" />
                  <span>Susunan Pemain Laga (Tunggal / Ganda)</span>
                </label>
                <span className="text-2xs text-muted">Bisa 1 atau 2 pemain per tim</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Team 1 Players */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Pemain {team1.name}:
                  </label>
                  <div>
                    <label className="text-2xs text-gray-500 block mb-0.5">Pemain 1</label>
                    <select
                      value={t1Player1}
                      onChange={(e) => setT1Player1(e.target.value)}
                      className="form-control text-xs py-1.5"
                    >
                      <option value="">-- Pilih Pemain 1 --</option>
                      {team1Players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-2xs text-gray-500 block mb-0.5">Pemain 2 (Opsional)</label>
                    <select
                      value={t1Player2}
                      onChange={(e) => setT1Player2(e.target.value)}
                      className="form-control text-xs py-1.5"
                    >
                      <option value="">-- Tidak ada (Tunggal) / Pilih Pemain 2 --</option>
                      {team1Players
                        .filter((p) => p.id !== t1Player1)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Team 2 Players */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Pemain {team2.name}:
                  </label>
                  <div>
                    <label className="text-2xs text-gray-500 block mb-0.5">Pemain 1</label>
                    <select
                      value={t2Player1}
                      onChange={(e) => setT2Player1(e.target.value)}
                      className="form-control text-xs py-1.5"
                    >
                      <option value="">-- Pilih Pemain 1 --</option>
                      {team2Players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-2xs text-gray-500 block mb-0.5">Pemain 2 (Opsional)</label>
                    <select
                      value={t2Player2}
                      onChange={(e) => setT2Player2(e.target.value)}
                      className="form-control text-xs py-1.5"
                    >
                      <option value="">-- Tidak ada (Tunggal) / Pilih Pemain 2 --</option>
                      {team2Players
                        .filter((p) => p.id !== t2Player1)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Scores Input */}
            <div className="form-group">
              <label className="form-label text-xs font-bold text-gray-800">
                Detail Skor Per Set (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 21-19, 18-21, 21-15"
                value={detailScores}
                onChange={(e) => setDetailScores(e.target.value)}
                className="form-control text-sm font-mono"
              />
            </div>

            {/* Match Status Selector */}
            <div className="form-group">
              <label className="form-label text-xs font-bold text-gray-800">Status Pertandingan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-control text-sm"
              >
                <option value="finished">🟢 Selesai (Klasemen terhitung)</option>
                <option value="live">🔴 Sedang Bertanding (Live)</option>
                <option value="scheduled">⚪ Terjadwal (Belum Main)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary font-bold">
              Simpan Skor & Lineup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
