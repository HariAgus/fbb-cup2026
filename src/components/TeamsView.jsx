import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Users, 
  Plus, 
  Phone, 
  UserCheck, 
  Edit3, 
  Trash2, 
  Search, 
  ListOrdered,
  CalendarPlus,
  Crown,
  Shield
} from 'lucide-react';

export const TeamsView = ({ onOpenAddTeam, onEditTeam, onViewRoster }) => {
  const { data, isAdmin, deleteTeam, generateAllMatches } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');

  const teams = data.teams || [];
  const allPlayers = data.players || [];

  const filteredTeams = teams.filter((t) => {
    const q = searchTerm.toLowerCase();
    const teamPlayerNames = (t.playerIds || [])
      .map((id) => allPlayers.find((p) => p.id === id)?.name || '')
      .join(' ')
      .toLowerCase();

    return (
      t.name.toLowerCase().includes(q) ||
      (t.shortName && t.shortName.toLowerCase().includes(q)) ||
      (t.captain && t.captain.toLowerCase().includes(q)) ||
      teamPlayerNames.includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return 'PB';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="teams-container">
      {/* Header */}
      <div className="view-header-row mb-6">
        <div>
          <h2 className="view-title flex items-center gap-2 text-2xl">
            <Users className="text-primary" size={28} />
            Tim & Skuad Badminton FBB Cup 2026
          </h2>
          <p className="view-subtitle text-sm mt-1">
            Daftar tim persatuan bulutangkis (PB) dan susunan pemain yang terdaftar dalam turnamen.
          </p>
        </div>

        <div className="header-actions-group mt-3 md:mt-0">
          {/* Search box */}
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari tim, kapten, pemain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {isAdmin && (
            <div className="header-actions-group">
              {teams.length >= 2 && (
                <button
                  onClick={() => {
                    if (confirm('Buat jadwal pertandingan round-robin otomatis untuk seluruh tim badminton?')) {
                      generateAllMatches();
                    }
                  }}
                  className="btn btn-secondary"
                  title="Generate jadwal otomatis antar seluruh tim"
                >
                  <CalendarPlus size={16} />
                  <span>Generate Jadwal</span>
                </button>
              )}

              <button className="btn btn-primary" onClick={onOpenAddTeam}>
                <Plus size={18} />
                <span>Tambah Tim Badminton</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="teams-grid">
        {filteredTeams.length === 0 ? (
          <div className="glass-card empty-state-card col-span-full py-12 text-center">
            <Users size={52} className="text-muted mx-auto mb-3 opacity-60" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Belum Ada Tim Badminton</h3>
            <p className="text-muted text-sm mb-5">
              Tambahkan tim baru dan masukkan pemain dari database untuk turnamen FBB Cup 2026.
            </p>
            {isAdmin && (
              <button onClick={onOpenAddTeam} className="btn btn-primary mx-auto">
                <Plus size={18} /> Tambah Tim Sekarang
              </button>
            )}
          </div>
        ) : (
          filteredTeams.map((team) => {
            const teamPlayers = (team.playerIds || [])
              .map((id) => allPlayers.find((p) => p.id === id))
              .filter(Boolean);

            return (
              <div 
                key={team.id} 
                className="team-card glass-card shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  borderTop: `4px solid ${team.color || '#E06020'}`
                }}
              >
                {/* Team Card Header */}
                <div className="team-card-header mb-4">
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
                      <h3 className="team-card-name text-gray-900 font-extrabold">{team.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="team-short-badge font-bold">{team.shortName || 'PB'}</span>
                        <span className="badge badge-primary text-xs font-semibold px-2 py-0.5">
                          {teamPlayers.length} Pemain
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => onEditTeam(team)}
                        className="btn-icon btn-secondary"
                        title="Edit Tim & Pemain"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus tim ${team.name}? Seluruh jadwal terkait akan dihapus.`)) {
                            deleteTeam(team.id);
                          }
                        }}
                        className="btn-icon btn-danger"
                        title="Hapus Tim"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Info Tiles */}
                <div className="grid grid-cols-2 gap-2.5 mb-4 p-2.5 bg-gray-50/80 rounded-xl border border-gray-200/70">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-primary flex items-center justify-center flex-shrink-0">
                      <UserCheck size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-2xs text-gray-500 font-medium">Kapten Tim</div>
                      <div className="text-xs text-gray-900 font-bold truncate" title={team.captain}>
                        {team.captain || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-2xs text-gray-500 font-medium">WhatsApp</div>
                      <div className="text-xs font-mono font-bold truncate">
                        {team.phone ? (
                          <a 
                            href={`https://wa.me/${team.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {team.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400 font-normal">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skuad Pemain - Attractive Visual Cards */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2.5 px-0.5">
                      <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                        <Users size={14} className="text-primary" /> Susunan Skuad Pemain
                      </span>
                      {teamPlayers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="badge-level badge-level-a text-2xs py-0 px-1">
                            {teamPlayers.filter((p) => (p.level || 'B') === 'A').length}A
                          </span>
                          <span className="badge-level badge-level-b text-2xs py-0 px-1">
                            {teamPlayers.filter((p) => (p.level || 'B') === 'B').length}B
                          </span>
                          <span className="badge-level badge-level-c text-2xs py-0 px-1">
                            {teamPlayers.filter((p) => (p.level || 'B') === 'C').length}C
                          </span>
                        </div>
                      )}
                    </div>

                    {teamPlayers.length === 0 ? (
                      <div className="text-center py-6 px-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-3">
                        <p className="text-xs text-gray-500 italic mb-2">Belum ada pemain di skuad ini</p>
                        <button
                          onClick={() => onViewRoster(team)}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          + Tambahkan Pemain Sekarang
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 mb-4">
                        {teamPlayers.map((p, idx) => {
                          const isCaptain = team.captain && p.name.toLowerCase().trim() === team.captain.toLowerCase().trim();
                          const lvl = p.level || 'B';

                          return (
                            <div 
                              key={p.id} 
                              className={`player-roster-badge flex items-center justify-between p-2 rounded-lg border transition-colors ${
                                isCaptain 
                                  ? 'bg-amber-50/70 border-amber-300/80 shadow-2xs' 
                                  : 'bg-white border-gray-200/80 hover:bg-gray-50/80'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div 
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-black flex-shrink-0 shadow-2xs ${
                                    isCaptain 
                                      ? 'bg-amber-500 text-white' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {getInitials(p.name)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate">
                                    {p.name}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`badge-level badge-level-${lvl.toLowerCase()} text-2xs py-0 px-1 font-extrabold`}>
                                  {lvl}
                                </span>
                                {isCaptain && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                    <Crown size={9} className="text-amber-600" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Team Card Footer Button */}
                  <div className="team-card-footer pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onViewRoster(team)}
                      className="btn btn-secondary w-full justify-center text-xs font-bold py-2"
                    >
                      <ListOrdered size={15} />
                      <span>{isAdmin ? 'Kelola Skuad Lengkap' : 'Lihat Skuad Lengkap'} ({teamPlayers.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
