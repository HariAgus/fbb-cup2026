import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Users } from 'lucide-react';

export const AddMatchModal = ({ isOpen, onClose }) => {
  const { data, addCustomMatch } = useTournament();

  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [t1Player1, setT1Player1] = useState('');
  const [t1Player2, setT1Player2] = useState('');
  const [t2Player1, setT2Player1] = useState('');
  const [t2Player2, setT2Player2] = useState('');

  const [round, setRound] = useState('Matchday 1');
  const [date, setDate] = useState('2026-09-17');
  const [time, setTime] = useState('14:00 WIB');
  const [pitch, setPitch] = useState('Court 1 Badminton');

  if (!isOpen) return null;

  const teams = data.teams || [];
  const allPlayers = data.players || [];

  const team1 = teams.find((t) => t.id === team1Id);
  const team2 = teams.find((t) => t.id === team2Id);

  const team1Players = allPlayers.filter((p) => team1?.playerIds?.includes(p.id) || p.teamId === team1Id);
  const team2Players = allPlayers.filter((p) => team2?.playerIds?.includes(p.id) || p.teamId === team2Id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!team1Id || !team2Id) return;
    if (team1Id === team2Id) {
      alert('Tim 1 dan Tim 2 tidak boleh sama!');
      return;
    }

    const t1PIds = [t1Player1, t1Player2].filter(Boolean);
    const t2PIds = [t2Player1, t2Player2].filter(Boolean);

    addCustomMatch({
      stage: 'league',
      round,
      team1Id,
      team2Id,
      team1PlayerIds: t1PIds,
      team2PlayerIds: t2PIds,
      team1Score: null,
      team2Score: null,
      detailScores: '',
      status: 'scheduled',
      date,
      time,
      pitch
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          <div className="modal-header">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Tambah Jadwal Pertandingan Badminton</h3>
              <p className="text-2xs text-muted mt-0.5">Tentukan tim dan susunan pemain yang bertanding</p>
            </div>
            <button type="button" onClick={onClose} className="btn-icon-subtle text-muted">
              ✕
            </button>
          </div>

          <div className="modal-body flex-1 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-800">Tim 1 *</label>
                <select
                  required
                  value={team1Id}
                  onChange={(e) => {
                    setTeam1Id(e.target.value);
                    setT1Player1('');
                    setT1Player2('');
                  }}
                  className="form-control text-sm"
                >
                  <option value="">-- Pilih Tim 1 --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-800">Tim 2 *</label>
                <select
                  required
                  value={team2Id}
                  onChange={(e) => {
                    setTeam2Id(e.target.value);
                    setT2Player1('');
                    setT2Player2('');
                  }}
                  className="form-control text-sm"
                >
                  <option value="">-- Pilih Tim 2 --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lineup Pemain */}
            {(team1Id || team2Id) && (
              <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                  <Users size={14} className="text-primary" />
                  <span>Pemain yang Diturunkan (Lineup):</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Team 1 Lineup */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs space-y-2">
                    <label className="text-xs font-bold text-gray-800 block">
                      Pemain {team1?.name || 'Tim 1'}:
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
                        <option value="">-- Tidak ada (Tunggal) / Pilih --</option>
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

                  {/* Team 2 Lineup */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs space-y-2">
                    <label className="text-xs font-bold text-gray-800 block">
                      Pemain {team2?.name || 'Tim 2'}:
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
                        <option value="">-- Tidak ada (Tunggal) / Pilih --</option>
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
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-800">Babak / Matchday</label>
                <input
                  type="text"
                  placeholder="Matchday 1"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className="form-control text-sm"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-800">Lapangan</label>
                <input
                  type="text"
                  placeholder="Court 1 Badminton"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="form-control text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-800">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control text-sm"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-800">Waktu</label>
                <input
                  type="text"
                  placeholder="14:00 WIB"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-control text-sm"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary font-bold">
              Tambahkan Jadwal Laga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
