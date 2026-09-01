import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Trophy, 
  ChevronRight, 
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';

export const StandingsView = ({ setActiveTab }) => {
  const { data, standings } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');

  const renderFormBadge = (result, index) => {
    if (result === 'W') {
      return (
        <span key={index} className="form-pill form-w" title="Menang">
          W
        </span>
      );
    }
    if (result === 'D') {
      return (
        <span key={index} className="form-pill form-d" title="Seri">
          D
        </span>
      );
    }
    return (
      <span key={index} className="form-pill form-l" title="Kalah">
        L
      </span>
    );
  };

  const filteredStandings = (standings || []).filter((item) =>
    item.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.team.shortName && item.team.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="standings-container">
      {/* Section Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Trophy className="text-primary" size={26} />
            Klasemen Resmi Turnamen FBB Cup 2026
          </h2>
          <p className="view-subtitle">
            Peringkat tim berdasarkan Poin (PTS), Selisih Gol (GD), dan Produktivitas Gol (GF).
          </p>
        </div>

        {/* Search */}
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari tim di klasemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Rules Notice / Legend */}
      <div className="rules-legend-card glass-card">
        <div className="rules-legend-left">
          <span className="qualify-indicator-badge">
            <span className="qualify-bar" /> 4 Tim Teratas Lolos ke Babak Playoff / Semifinal
          </span>
          <span className="rules-points-badge">
            🏆 Menang: <b>3 Poin</b> | 🤝 Seri: <b>1 Poin</b> | ❌ Kalah: <b>0 Poin</b>
          </span>
        </div>
        <div className="rules-legend-right">
          <button onClick={() => setActiveTab('matches')} className="btn btn-sm btn-secondary">
            <Calendar size={14} /> Lihat Semua Jadwal Laga
          </button>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="group-table-card glass-card">
        <div className="group-table-header">
          <div className="group-title-wrap">
            <span className="group-badge-icon">🏆</span>
            <h3 className="group-card-title">Tabel Klasemen Turnamen ({standings.length} Tim)</h3>
          </div>
          <span className="text-xs text-muted">Update Otomatis Real-Time</span>
        </div>

        <div className="table-responsive">
          <table className="standings-table">
            <thead>
              <tr>
                <th className="th-pos">POS</th>
                <th className="th-team">TIM & PESERTA</th>
                <th className="th-num" title="Matches Played (Main)">MP</th>
                <th className="th-num" title="Won (Menang)">W</th>
                <th className="th-num" title="Drawn (Seri)">D</th>
                <th className="th-num" title="Lost (Kalah)">L</th>
                <th className="th-num" title="Goals For (Gol Masuk)">GF</th>
                <th className="th-num" title="Goals Against (Kebobolan)">GA</th>
                <th className="th-num" title="Goal Difference (Selisih Gol)">GD</th>
                <th className="th-pts" title="Points (Poin)">PTS</th>
                <th className="th-form">FORM</th>
              </tr>
            </thead>
            <tbody>
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="empty-table-msg">
                    Belum ada data tim yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredStandings.map((item) => {
                  const gdValue = item.gd;
                  const gdClass =
                    gdValue > 0 ? 'gd-positive' : gdValue < 0 ? 'gd-negative' : 'gd-neutral';

                  return (
                    <tr
                      key={item.teamId}
                      className={`standings-row ${item.isPlayoffZone ? 'row-qualified' : ''}`}
                    >
                      {/* Position */}
                      <td className="td-pos">
                        <div className="pos-cell">
                          {item.isPlayoffZone && <span className="qualify-slot-indicator" />}
                          <span className={`pos-number pos-rank-${item.rank}`}>
                            {item.rank}
                          </span>
                        </div>
                      </td>

                      {/* Team Name & Logo */}
                      <td className="td-team">
                        <div className="team-cell">
                          <div
                            className="team-avatar-badge"
                            style={{
                              backgroundColor: `${item.team.color || '#E06020'}18`,
                              borderColor: item.team.color || '#E06020'
                            }}
                          >
                            <span>{item.team.logo || '⚽'}</span>
                          </div>
                          <div className="team-name-wrap">
                            <span className="team-full-name">{item.team.name}</span>
                            <span className="team-code-tag">{item.team.shortName || 'TIM'}</span>
                            <span className="text-xs text-muted">
                              ({item.team.members?.length || 0} Peserta)
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="td-num font-semibold">{item.mp}</td>
                      <td className="td-num text-emerald-600 font-bold">{item.w}</td>
                      <td className="td-num text-amber-600 font-bold">{item.d}</td>
                      <td className="td-num text-rose-600 font-bold">{item.l}</td>
                      <td className="td-num font-semibold">{item.gf}</td>
                      <td className="td-num text-muted">{item.ga}</td>
                      <td className="td-num">
                        <span className={`gd-pill ${gdClass}`}>
                          {gdValue > 0 ? `+${gdValue}` : gdValue}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="td-pts">
                        <span className="pts-highlight">{item.pts}</span>
                      </td>

                      {/* Form */}
                      <td className="td-form">
                        <div className="form-pills-row">
                          {item.form && item.form.length > 0 ? (
                            item.form.slice(-5).map((res, i) => renderFormBadge(res, i))
                          ) : (
                            <span className="text-muted text-xs">-</span>
                          )}
                        </div>
                      </td>
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
