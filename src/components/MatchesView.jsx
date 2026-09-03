import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  Plus, 
  CheckCircle, 
  Filter, 
  Trash2,
  CalendarPlus,
  Users
} from 'lucide-react';

export const MatchesView = ({ onOpenScoreModal, onOpenAddMatch }) => {
  const { data, isAdmin, deleteMatch, generateAllMatches } = useTournament();
  const [filterStatus, setFilterStatus] = useState('all');

  const matches = data.matches || [];
  const allPlayers = data.players || [];
  const teamsMap = (data.teams || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  const playersMap = allPlayers.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const filteredMatches = matches.filter((m) => {
    return filterStatus === 'all' || m.status === filterStatus;
  });

  const getPlayerNames = (playerIds) => {
    if (!playerIds || playerIds.length === 0) return null;
    return playerIds
      .map((id) => playersMap[id]?.name || 'Pemain')
      .join(' / ');
  };

  return (
    <div className="matches-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Calendar className="text-primary" size={26} />
            Jadwal & Hasil Pertandingan Badminton
          </h2>
          <p className="view-subtitle">
            Pantau susunan pemain yang bertanding, skor pertandingan, dan rincian poin laga FBB Cup 2026.
          </p>
        </div>

        {isAdmin && (
          <div className="header-actions-group">
            <button className="btn btn-secondary" onClick={generateAllMatches}>
              <CalendarPlus size={16} />
              <span>Generate Jadwal Otomatis</span>
            </button>
            <button className="btn btn-primary" onClick={onOpenAddMatch}>
              <Plus size={18} />
              <span>Tambah Jadwal Laga</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="matches-filter-bar glass-card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <span className="text-xs font-bold text-gray-700">Filter Status Pertandingan:</span>
          </div>

          <div className="status-pill-filter">
            {['all', 'live', 'finished', 'scheduled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`status-filter-btn ${filterStatus === st ? 'active' : ''}`}
              >
                {st === 'all' && 'Semua Laga'}
                {st === 'live' && '🔴 LIVE'}
                {st === 'finished' && '🟢 Selesai'}
                {st === 'scheduled' && '⚪ Terjadwal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches Cards Grid */}
      <div className="matches-cards-grid">
        {filteredMatches.length === 0 ? (
          <div className="glass-card empty-state-card col-span-full">
            <Calendar size={48} className="text-muted mb-2" />
            <h3 className="text-lg font-bold text-gray-900">Belum Ada Pertandingan</h3>
            <p className="text-muted text-sm mb-4">
              Klik "Generate Jadwal Otomatis" atau tambah jadwal laga baru.
            </p>
            {isAdmin && (
              <button onClick={generateAllMatches} className="btn btn-primary">
                <CalendarPlus size={16} /> Buat Jadwal Sekarang
              </button>
            )}
          </div>
        ) : (
          filteredMatches.map((m) => {
            const team1 = teamsMap[m.team1Id] || { name: 'TBD', shortName: 'TBD', color: '#E06020', logo: '🏸' };
            const team2 = teamsMap[m.team2Id] || { name: 'TBD', shortName: 'TBD', color: '#3B82F6', logo: '🏸' };

            const isScoreAvailable = m.team1Score !== null && m.team2Score !== null;
            const t1Score = Number(m.team1Score);
            const t2Score = Number(m.team2Score);

            const isTeam1Winner = isScoreAvailable && m.status === 'finished' && t1Score > t2Score;
            const isTeam2Winner = isScoreAvailable && m.status === 'finished' && t2Score > t1Score;

            const t1Lineup = getPlayerNames(m.team1PlayerIds);
            const t2Lineup = getPlayerNames(m.team2PlayerIds);

            return (
              <div key={m.id} className="match-card glass-card">
                {/* Header Meta */}
                <div className="match-card-meta">
                  <span className="badge badge-primary text-xs font-bold">
                    {m.round || 'Turnamen FBB'}
                  </span>

                  <div className="flex items-center gap-2">
                    {m.status === 'live' && (
                      <span className="badge badge-live">
                        <span className="dot-pulse-red" /> LIVE
                      </span>
                    )}
                    {m.status === 'finished' && (
                      <span className="badge badge-finished">
                        <CheckCircle size={12} /> SELESAI
                      </span>
                    )}
                    {m.status === 'scheduled' && (
                      <span className="badge badge-scheduled">
                        TERJADWAL
                      </span>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('Hapus jadwal pertandingan ini?')) {
                            deleteMatch(m.id);
                          }
                        }}
                        className="btn-icon-subtle text-red-500 hover:text-red-700"
                        title="Hapus Pertandingan"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scoreboard Display with Proper Margins & Clean Layout */}
                <div className="match-fixture-box">
                  {/* Team 1 Row */}
                  <div className={`match-team-row ${isTeam1Winner ? 'team-row-winner' : ''}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="team-emblem"
                        style={{ backgroundColor: `${team1.color || '#E06020'}18`, borderColor: team1.color || '#E06020' }}
                      >
                        {team1.logo || '🏸'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                          <span>{team1.name}</span>
                          <span className="team-code-tag">{team1.shortName || 'PB'}</span>
                        </div>
                        <div className="match-player-lineup text-xs text-orange-950 font-semibold truncate mt-0.5">
                          👤 {t1Lineup || <span className="text-gray-400 font-normal">Pemain belum ditentukan</span>}
                        </div>
                      </div>
                    </div>

                    <div className="match-score-cell">
                      <span className={`score-digit-val ${isTeam1Winner ? 'text-primary font-black' : 'text-gray-900'}`}>
                        {isScoreAvailable ? m.team1Score : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Divider / Set Details */}
                  <div className="match-fixture-divider">
                    {m.detailScores ? (
                      <span className="detail-scores-chip">{m.detailScores}</span>
                    ) : (
                      <span className="vs-divider-text">VS</span>
                    )}
                  </div>

                  {/* Team 2 Row */}
                  <div className={`match-team-row ${isTeam2Winner ? 'team-row-winner' : ''}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="team-emblem"
                        style={{ backgroundColor: `${team2.color || '#3B82F6'}18`, borderColor: team2.color || '#3B82F6' }}
                      >
                        {team2.logo || '🏸'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                          <span>{team2.name}</span>
                          <span className="team-code-tag">{team2.shortName || 'PB'}</span>
                        </div>
                        <div className="match-player-lineup text-xs text-orange-950 font-semibold truncate mt-0.5">
                          👤 {t2Lineup || <span className="text-gray-400 font-normal">Pemain belum ditentukan</span>}
                        </div>
                      </div>
                    </div>

                    <div className="match-score-cell">
                      <span className={`score-digit-val ${isTeam2Winner ? 'text-primary font-black' : 'text-gray-900'}`}>
                        {isScoreAvailable ? m.team2Score : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Meta & Action */}
                <div className="match-card-bottom">
                  <div className="match-venue-info">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Clock size={13} className="text-primary" />
                      <span>{m.date || 'TBD'} • {m.time || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                      <MapPin size={13} className="text-primary" />
                      <span>{m.pitch || 'Lapangan 1'}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onOpenScoreModal(m)}
                      className="btn btn-sm btn-primary"
                    >
                      <Edit3 size={14} />
                      <span>Update Skor & Pemain</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
