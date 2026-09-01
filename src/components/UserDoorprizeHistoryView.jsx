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
          <div className="doorprize-card-grid">
            {filteredDoorprizes.map((dp) => (
              <div key={dp.id} className="public-doorprize-card glass-card">
                {/* Card Top: Prize Header */}
                <div className="prize-card-header">
                  <div className="prize-info-left">
                    <div className="prize-icon-circle">
                      <Trophy size={20} className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="prize-name">{dp.prizeName}</h3>
                      <div className="prize-meta flex items-center gap-2 text-xs text-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(dp.drawnAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} WIB
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-primary">
                          {dp.winners?.length || 1} Pemenang
                        </span>
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
                        <Check size={14} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-bold">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} />
                        <span className="text-xs">Bagikan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Card Body: Winners Badges */}
                <div className="prize-winners-container">
                  <div className="winners-label flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2.5">
                    <Award size={14} className="text-primary" />
                    <span>Daftar Pemenang Beruntung:</span>
                  </div>

                  <div className="winners-grid">
                    {(dp.winners || []).map((winner, idx) => (
                      <div key={idx} className="winner-card-item">
                        <div className="winner-rank-badge">#{idx + 1}</div>
                        <div className="winner-avatar">
                          {(winner.playerName || 'P')[0].toUpperCase()}
                        </div>
                        <div className="winner-details min-w-0 flex-1">
                          <div className="winner-name truncate font-bold text-sm text-gray-900">
                            {winner.playerName}
                          </div>
                          <div className="winner-sub flex items-center gap-1.5 mt-0.5">
                            <span className={`level-badge level-${(winner.playerLevel || 'b').toLowerCase()} text-[10px]`}>
                              Level {winner.playerLevel || 'B'}
                            </span>
                            {winner.teamName && (
                              <span className="team-badge text-[10px] text-gray-600 truncate">
                                🏸 {winner.teamName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
