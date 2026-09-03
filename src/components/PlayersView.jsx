import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Edit3, 
  Trash2, 
  Filter,
  Crown,
  Zap,
  Shield
} from 'lucide-react';

export const PlayersView = ({ onOpenAddPlayer, onEditPlayer }) => {
  const { data, isAdmin, deletePlayer, updatePlayerLevel } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'assigned' | 'free'
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'A' | 'B+' | 'B' | 'C'

  const players = data.players || [];
  const teams = data.teams || [];

  const teamsMap = teams.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  const filteredPlayers = players.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q));

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'assigned' && p.teamId) ||
      (filterStatus === 'free' && !p.teamId);

    const playerLevel = p.level || 'B';
    const matchLevel = levelFilter === 'all' || playerLevel === levelFilter;

    return matchSearch && matchStatus && matchLevel;
  });

  const unassignedCount = players.filter((p) => !p.teamId).length;
  const countA = players.filter((p) => (p.level || 'B') === 'A').length;
  const countBPlus = players.filter((p) => (p.level || 'B') === 'B+').length;
  const countB = players.filter((p) => (p.level || 'B') === 'B').length;
  const countC = players.filter((p) => (p.level || 'B') === 'C').length;

  return (
    <div className="players-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Users className="text-primary" size={26} />
            Manajemen Data Pemain Badminton
          </h2>
          <p className="view-subtitle">
            Database seluruh pemain turnamen lengkap dengan grading level kemampuan (A, B+, B, C) untuk undian tim seimbang.
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={onOpenAddPlayer}>
            <Plus size={18} />
            <span>Tambah Pemain Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="matches-filter-bar glass-card flex-wrap gap-2.5">
        <div className="search-input-box flex-1 min-w-[200px]">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama pemain, no WA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Level Filters */}
        <div className="status-pill-filter">
          <button
            onClick={() => setLevelFilter('all')}
            className={`status-filter-btn ${levelFilter === 'all' ? 'active' : ''}`}
          >
            Semua Level ({players.length})
          </button>
          <button
            onClick={() => setLevelFilter('A')}
            className={`status-filter-btn ${levelFilter === 'A' ? 'active' : ''}`}
          >
            👑 Level A ({countA})
          </button>
          <button
            onClick={() => setLevelFilter('B+')}
            className={`status-filter-btn ${levelFilter === 'B+' ? 'active' : ''}`}
          >
            ⭐ Level B+ ({countBPlus})
          </button>
          <button
            onClick={() => setLevelFilter('B')}
            className={`status-filter-btn ${levelFilter === 'B' ? 'active' : ''}`}
          >
            ⚡ Level B ({countB})
          </button>
          <button
            onClick={() => setLevelFilter('C')}
            className={`status-filter-btn ${levelFilter === 'C' ? 'active' : ''}`}
          >
            🛡️ Level C ({countC})
          </button>
        </div>

        {/* Team Status Filters */}
        <div className="status-pill-filter">
          <button
            onClick={() => setFilterStatus('all')}
            className={`status-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          >
            Semua Tim
          </button>
          <button
            onClick={() => setFilterStatus('assigned')}
            className={`status-filter-btn ${filterStatus === 'assigned' ? 'active' : ''}`}
          >
            Sudah Masuk Tim
          </button>
          <button
            onClick={() => setFilterStatus('free')}
            className={`status-filter-btn ${filterStatus === 'free' ? 'active' : ''}`}
          >
            Belum Ada Tim ({unassignedCount})
          </button>
        </div>
      </div>

      {/* Players Grid / Table */}
      <div className="group-table-card glass-card">
        <div className="table-responsive">
          <table className="standings-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>NO</th>
                <th>NAMA PEMAIN</th>
                <th>LEVEL</th>
                <th>GENDER</th>
                <th>KONTAK WHATSAPP</th>
                <th>TIM SAAT INI</th>
                {isAdmin && <th style={{ textAlign: 'center', width: '120px' }}>AKSI</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="empty-table-msg">
                    Tidak ada data pemain yang cocok.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const assignedTeam = player.teamId ? teamsMap[player.teamId] : null;
                  const lvl = player.level || 'B';

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
                        <span className={`badge-level badge-level-${lvl.toLowerCase().replace('+', '-plus')} font-bold`}>
                          {lvl === 'A' && '👑 Level A'}
                          {lvl === 'B+' && '⭐ Level B+'}
                          {lvl === 'B' && '⚡ Level B'}
                          {lvl === 'C' && '🛡️ Level C'}
                          {!['A', 'B+', 'B', 'C'].includes(lvl) && `Level ${lvl}`}
                        </span>
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
                          <span className="badge badge-scheduled text-2xs">Belum Masuk Tim</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'center' }}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onEditPlayer(player)}
                              className="btn-icon btn-secondary"
                              title="Edit Pemain & Level"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus pemain ${player.name}?`)) {
                                  deletePlayer(player.id);
                                }
                              }}
                              className="btn-icon btn-danger"
                              title="Hapus Pemain"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
  );
};

