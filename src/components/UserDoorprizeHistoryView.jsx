import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Gift,
  Trophy,
  Sparkles,
  Search,
  Users,
  Share2,
  Check,
  Award,
  Crown,
  Clock
} from 'lucide-react';

export const UserDoorprizeHistoryView = () => {
  const { data } = useTournament();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const doorprizes = useMemo(() => data.doorprizes || [], [data.doorprizes]);
  const allPlayers = useMemo(() => data.players || [], [data.players]);

  // Aggregate statistics
  const totalPrizes = doorprizes.length;
  const totalWinners = doorprizes.reduce((acc, curr) => acc + (curr.winners?.length || 0), 0);

  // Filter doorprizes based on search and level
  const filteredDoorprizes = useMemo(() => {
    return doorprizes.filter((dp) => {
      const matchesPrize = (dp.prizeName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const hasMatchingWinner = (dp.winners || []).some((w) => {
        const matchesName = (w.playerName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTeam = (w.teamName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLvl = selectedLevel === 'ALL' || w.playerLevel === selectedLevel;
        return (matchesName || matchesTeam) && matchesLvl;
      });

      if (searchQuery.trim() === '' && selectedLevel === 'ALL') return true;
      return matchesPrize || hasMatchingWinner;
    });
  }, [doorprizes, searchQuery, selectedLevel]);

  // Handle Share to WhatsApp / Clipboard
  const handleShare = (dp) => {
    const winnerNames = (dp.winners || []).map((w, idx) => `  ${idx + 1}. ${w.playerName} (${w.teamName ? `Tim: ${w.teamName}, ` : ''}Level ${w.playerLevel || 'B'})`).join('\n');
    const text = `🎉 *HASIL UNDIAN DOORPRIZE FBB MERDEKA CUP 2026* 🎉\n\n🎁 *Hadiah:* ${dp.prizeName}\n👥 *Pemenang Beruntung:*\n${winnerNames}\n\nLihat selengkapnya di web resmi FBB Cup! 🏸`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(dp.id);
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  return (
    <div className="user-doorprize-view">
      {/* 🌟 Hero Banner Section */}
      <div className="public-doorprize-hero glass-card">
        <div className="hero-badge-row">
          <span className="badge badge-primary flex items-center gap-1.5 py-1 px-3">
            <Sparkles size={14} className="text-amber-300" />
            <span>DOORPRIZE OFFICIAL</span>
          </span>
          <span className="text-xs text-muted">Fun Badminton Bekasi 2026</span>
        </div>

        <h1 className="hero-title">
          Daftar Pemenang <span className="text-gradient">Undian Doorprize</span>
        </h1>
        <p className="hero-description">
          Selamat kepada seluruh pemain beruntung yang berhasil memenangkan hadiah doorprize eksklusif turnamen FBB Merdeka Cup 2026!
        </p>

        {/* Highlight Stats Row */}
        <div className="public-doorprize-stats">
          <div className="stat-card">
            <div className="stat-icon-wrapper prize-icon">
              <Gift size={22} />
            </div>
            <div>
              <div className="stat-num">{totalPrizes}</div>
              <div className="stat-label">Hadiah Diundi</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper winner-icon">
              <Crown size={22} />
            </div>
            <div>
              <div className="stat-num">{totalWinners}</div>
              <div className="stat-label">Pemenang Beruntung</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper player-icon">
              <Users size={22} />
            </div>
            <div>
              <div className="stat-num">{allPlayers.length}</div>
              <div className="stat-label">Total Peserta</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filter Bar */}
      <div className="public-filter-bar glass-card mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="search-box-wrapper w-full sm:w-80">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama pemenang atau hadiah..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 font-semibold">Filter:</span>
            <div className="level-pills-group">
              {['ALL', 'A', 'B', 'C'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`level-pill-btn ${selectedLevel === lvl ? 'active' : ''}`}
                >
                  {lvl === 'ALL' ? 'Semua' : `Level ${lvl}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🎁 Doorprize History Feed */}
      <div className="doorprize-feed-container mt-6">
        {filteredDoorprizes.length === 0 ? (
          <div className="empty-public-doorprize glass-card">
            <div className="empty-icon-circle">
              <Gift size={38} className="text-primary animate-bounce" />
            </div>
            <h3 className="empty-title">
              {doorprizes.length === 0 ? 'Undian Doorprize Belum Dimulai' : 'Tidak Ada Hasil yang Cocok'}
            </h3>
            <p className="empty-description">
              {doorprizes.length === 0
                ? 'Panitia akan segera melaksanakan pengundian doorprize selama turnamen berlangsung. Pantau halaman ini secara berkala!'
                : 'Coba ubah kata kunci pencarian atau filter level Anda.'}
            </p>
          </div>
        ) : (
          <div className="doorprize-vertical-feed">
            {filteredDoorprizes.map((dp, drawIdx) => (
              <div key={dp.id} className="public-doorprize-card glass-card">
                {/* Card Top: Prize Header */}
                <div className="prize-card-header">
                  <div className="prize-info-left">
                    <div className="prize-icon-circle">
                      <Trophy size={22} className="text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="prize-name">{dp.prizeName}</h3>
                        <span className="badge badge-primary text-xs font-bold px-2 py-0.5">
                          {dp.winners?.length || 1} Pemenang
                        </span>
                      </div>
                      <div className="prize-meta flex items-center gap-2 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={13} className="text-gray-400" />
                          {new Date(dp.drawnAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} WIB
                        </span>
                        <span>•</span>
                        <span className="text-2xs text-gray-500">Undian #{filteredDoorprizes.length - drawIdx}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleShare(dp)}
                    className="share-btn"
                    title="Bagikan ke WhatsApp"
                  >
                    {copiedId === dp.id ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-xs text-emerald-600 font-bold">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} />
                        <span className="text-xs font-semibold">Bagikan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Card Body: Vertical Winners List */}
                <div className="prize-winners-container">
                  <div className="winners-label flex items-center justify-between text-xs font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-900">
                      <Award size={15} className="text-primary" />
                      <span>Daftar Pemenang Hadiah:</span>
                    </div>
                    <span className="text-2xs text-muted font-normal">
                      Total: <b>{dp.winners?.length || 1}</b> Peserta
                    </span>
                  </div>

                  <div className="winners-vertical-list space-y-2.5">
                    {(dp.winners || []).map((winner, idx) => {
                      const lvl = (winner.playerLevel || 'B').toUpperCase();
                      return (
                        <div key={idx} className="winner-row-card">
                          {/* Rank Badge */}
                          <div className="winner-rank-pill">
                            <span>#{idx + 1}</span>
                          </div>

                          {/* Player Avatar */}
                          <div className="winner-avatar">
                            {(winner.playerName || 'P')[0].toUpperCase()}
                          </div>

                          {/* Player Info Details */}
                          <div className="winner-details min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="winner-name font-bold text-sm text-gray-900">
                                {winner.playerName}
                              </span>
                              <span className={`badge-level badge-level-${lvl.toLowerCase().replace('+', '-plus')} text-3xs py-0.5 px-1.5 font-bold`}>
                                Level {lvl}
                              </span>
                            </div>

                            {winner.teamName && (
                              <div className="winner-team-text text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                                <span>🏸 Tim:</span>
                                <span className="font-semibold text-gray-700">{winner.teamName}</span>
                              </div>
                            )}
                          </div>

                          {/* Right Winning Badge */}
                          <div className="winner-status-badge">
                            <span className="badge badge-finished text-3xs font-bold flex items-center gap-1">
                              <span>Pemenang Sah</span>
                              <Crown size={11} className="text-amber-500" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
