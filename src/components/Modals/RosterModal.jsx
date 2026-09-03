import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Users, Plus, Trash2, UserPlus, Crown, Phone } from 'lucide-react';

export const RosterModal = ({ isOpen, onClose, team = null }) => {
  const { data, assignPlayerToTeam, removePlayerFromTeam, addPlayer, isAdmin } = useTournament();

  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLevel, setNewPlayerLevel] = useState('B');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');

  if (!isOpen || !team) return null;

  const allPlayers = data.players || [];
  const teamPlayerIds = team.playerIds || [];
  const teamPlayers = allPlayers.filter((p) => teamPlayerIds.includes(p.id));
  const availablePlayers = allPlayers.filter((p) => !teamPlayerIds.includes(p.id));

  const handleAddExistingPlayer = (e) => {
    e.preventDefault();
    if (!selectedPlayerToAdd) return;
    assignPlayerToTeam(selectedPlayerToAdd, team.id);
    setSelectedPlayerToAdd('');
  };

  const handleCreateAndAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    addPlayer({
      name: newPlayerName.trim(),
      gender: 'L',
      level: newPlayerLevel || 'B',
      phone: newPlayerPhone.trim(),
      teamId: team.id
    });

    setNewPlayerName('');
    setNewPlayerPhone('');
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div 
              className="team-logo-avatar shadow-sm"
              style={{ backgroundColor: `${team.color || '#E06020'}18`, borderColor: team.color || '#E06020' }}
            >
              <span>{team.logo || '🏸'}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900 leading-tight">Skuad Pemain: {team.name}</h3>
              <p className="text-xs text-muted mt-0.5">
                Kapten: <span className="font-bold text-gray-800">{team.captain || '-'}</span> • Terdaftar: <span className="text-primary font-bold">{teamPlayers.length} Pemain</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-subtle text-muted">
            ✕
          </button>
        </div>

        <div className="modal-body py-4 space-y-5">
          {/* Members List Section */}
          <div className="roster-list-box">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <span className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-primary" /> Daftar Pemain Skuad
              </span>
              <div className="flex items-center gap-1.5">
                <span className="badge-level badge-level-a text-2xs py-0.5 px-1.5 font-extrabold">
                  👑 {teamPlayers.filter((p) => (p.level || 'B') === 'A').length}A
                </span>
                <span className="badge-level badge-level-b-plus text-2xs py-0.5 px-1.5 font-extrabold">
                  ⭐ {teamPlayers.filter((p) => (p.level || 'B') === 'B+').length}B+
                </span>
                <span className="badge-level badge-level-b text-2xs py-0.5 px-1.5 font-extrabold">
                  ⚡ {teamPlayers.filter((p) => (p.level || 'B') === 'B').length}B
                </span>
                <span className="badge-level badge-level-c text-2xs py-0.5 px-1.5 font-extrabold">
                  🛡️ {teamPlayers.filter((p) => (p.level || 'B') === 'C').length}C
                </span>
              </div>
            </div>

            {teamPlayers.length === 0 ? (
              <div className="text-center text-muted text-sm py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="italic">Belum ada pemain di tim ini.</p>
                <p className="text-2xs text-gray-400 mt-1">Pilih dari database atau buat pemain baru di bawah.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {teamPlayers.map((p, idx) => {
                  const isCaptain = team.captain && p.name.toLowerCase().trim() === team.captain.toLowerCase().trim();
                  const lvl = p.level || 'B';

                  return (
                    <div 
                      key={p.id} 
                      className={`roster-player-card flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isCaptain 
                          ? 'bg-amber-50/60 border-amber-300 shadow-sm' 
                          : 'bg-white border-gray-200 shadow-2xs hover:border-orange-200 hover:bg-orange-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 shadow-2xs ${
                            isCaptain ? 'bg-amber-500 text-white' : 'bg-orange-100 text-orange-900'
                          }`}
                        >
                          {getInitials(p.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900 truncate flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className={`badge-level badge-level-${lvl.toLowerCase().replace('+', '-plus')} text-2xs py-0 px-1.5 font-extrabold`}>
                              Level {lvl}
                            </span>
                            {isCaptain && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-2xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                <Crown size={10} className="text-amber-600" /> Kapten
                              </span>
                            )}
                          </div>
                          <div className="text-2xs text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                            <span>No. Urut: #{idx + 1}</span>
                            {p.phone && (
                              <span className="text-primary font-semibold flex items-center gap-0.5">
                                <Phone size={10} /> {p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => removePlayerFromTeam(p.id, team.id)}
                          className="btn-icon-subtle text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg ml-2 flex-shrink-0 transition-colors"
                          title="Keluarkan pemain dari tim"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Management to Add Players */}
          {isAdmin && (
            <div className="border-t border-gray-100 pt-4 space-y-3.5">
              {/* Add from existing player pool */}
              {availablePlayers.length > 0 && (
                <form onSubmit={handleAddExistingPlayer} className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 block">
                    Pilih Pemain yang Sudah Terdaftar di Database:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPlayerToAdd}
                      onChange={(e) => setSelectedPlayerToAdd(e.target.value)}
                      className="form-control text-xs py-2 flex-1"
                    >
                      <option value="">-- Pilih dari Database Pemain ({availablePlayers.length} Tersedia) --</option>
                      {availablePlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Level {p.level || 'B'}) {p.teamId ? '- [Pindah Tim]' : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!selectedPlayerToAdd}
                      className="btn btn-sm btn-primary whitespace-nowrap py-2 px-3"
                    >
                      <UserPlus size={14} /> Masukkan ke Tim
                    </button>
                  </div>
                </form>
              )}

              {/* Quick create new player */}
              <form onSubmit={handleCreateAndAddPlayer} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold text-gray-800 block">
                  + Buat & Daftarkan Pemain Baru Langsung ke Tim Ini:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Pemain *"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="form-control text-xs py-2 sm:col-span-1"
                  />
                  <select
                    value={newPlayerLevel}
                    onChange={(e) => setNewPlayerLevel(e.target.value)}
                    className="form-control text-xs py-2 font-bold"
                  >
                    <option value="A">👑 Level A (Unggulan)</option>
                    <option value="B">⚡ Level B (Menengah)</option>
                    <option value="C">🛡️ Level C (Pemula)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="No. WhatsApp (Opsional)"
                    value={newPlayerPhone}
                    onChange={(e) => setNewPlayerPhone(e.target.value)}
                    className="form-control text-xs py-2"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" className="btn btn-sm btn-outline-primary whitespace-nowrap text-xs font-bold">
                    <Plus size={14} /> Daftarkan ke Tim
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="modal-footer pt-3 border-t border-gray-100">
          <button onClick={onClose} className="btn btn-secondary w-full justify-center font-bold">
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
