import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import {
  Trophy,
  Users,
  Activity,
  Flame,
  MapPin,
  CalendarDays,
  Calendar,
  Maximize2,
  X,
  Sparkles,
  Download,
  Shield,
  Medal,
  CheckCircle2
} from 'lucide-react';

export const HeroBanner = ({ setActiveTab }) => {
  const { data } = useTournament();
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const totalTeams = data.teams?.length || 0;
  const totalPlayers = data.players?.length || 0;
  const finishedMatches = (data.matches || []).filter((m) => m.status === 'finished');
  const totalFinishedMatches = finishedMatches.length;
  const totalMatches = data.matches?.length || 0;

  const posterUrl = data.tournamentInfo?.posterUrl || '/images/merdeka-cup-2026-poster.jpg';
  const venue = data.tournamentInfo?.venue || 'GOR Arena 74, Bekasi';
  const date = data.tournamentInfo?.date || '13 & 20 September 2026';

  return (
    <>
      <section className="hero-banner-section">
        {/* Top Hero Banner */}
        <div className="hero-banner-inner">
          {/* Left Side: Header info & Event Details */}
          <div className="hero-content">
            <div className="hero-tag-row">
              <span className="badge badge-primary font-bold">
                <Flame size={14} className="text-primary" /> Fun Badminton Bekasi
              </span>
              <span className="badge badge-finished font-bold">
                <Sparkles size={14} className="text-emerald-600" /> Edisi Merdeka Cup 2026
              </span>
            </div>

            <h1 className="hero-main-title">
              MERDEKA CUP <span className="hero-title-highlight">2026</span>
            </h1>

            <p className="hero-tagline">
              Turnamen resmi beregu bulutangkis <b>Fun Badminton Bekasi</b>. Pantau susunan pemain yang bertanding, skor detail per set, jadwal laga, dan klasemen turnamen secara langsung (*real-time*).
            </p>

            {/* Event Meta Cards */}
            <div className="hero-event-meta-grid">
              <div className="event-meta-card">
                <div className="event-meta-icon icon-orange">
                  <CalendarDays size={20} />
                </div>
                <div className="event-meta-text">
                  <span className="meta-sublabel">Tanggal Laga</span>
                  <span className="meta-mainval">{date}</span>
                </div>
              </div>

              <div className="event-meta-card">
                <div className="event-meta-icon icon-blue">
                  <MapPin size={20} />
                </div>
                <div className="event-meta-text">
                  <span className="meta-sublabel">Venue / Lokasi</span>
                  <span className="meta-mainval">{venue}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="header-actions-group">
              <button
                className="btn btn-primary"
                onClick={() => setActiveTab('standings')}
              >
                <Trophy size={18} />
                <span>Lihat Klasemen</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('matches')}
              >
                <Calendar size={18} />
                <span>Jadwal & Hasil</span>
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => setIsPosterModalOpen(true)}
              >
                <Maximize2 size={16} />
                <span>Lihat Poster Resmi</span>
              </button>
            </div>
          </div>

          {/* Right Side: Official Poster Showcase Card */}
          <div className="hero-poster-showcase-wrap">
            <div
              className="hero-poster-card"
              onClick={() => setIsPosterModalOpen(true)}
              title="Klik untuk memperbesar poster resmi"
            >
              <div className="poster-image-container">
                <img
                  src={posterUrl}
                  alt="Poster Resmi Fun Badminton Bekasi Merdeka Cup 2026"
                  className="hero-poster-img"
                />
                <div className="poster-overlay-badge">
                  <span className="badge badge-primary poster-top-badge">
                    🏸 OFFICIAL POSTER
                  </span>
                  <div className="poster-bottom-bar">
                    <span className="poster-loc-label">
                      <MapPin size={13} className="text-orange-400" /> {venue}
                    </span>
                    <span className="poster-zoom-btn">
                      <Maximize2 size={14} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Click to expand pill */}
              <div className="poster-card-footer">
                <span className="poster-click-hint">
                  <Maximize2 size={13} /> Klik untuk melihat ukuran penuh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 Dedicated Premium Tournament Pulse Metrics Deck */}
        <div className="tournament-metrics-deck">
          {/* Metric 1: Teams */}
          <div className="metric-deck-card theme-orange">
            <div className="metric-icon-box">
              <Shield size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-num-row">
                <span className="metric-number">{totalTeams}</span>
                <span className="metric-tag">TEAM</span>
              </div>
              <div className="metric-title">Team bertanding</div>
              <div className="metric-desc">4 Team terbaik akan ke Semifinal</div>
            </div>
          </div>

          {/* Metric 2: Players */}
          <div className="metric-deck-card theme-blue">
            <div className="metric-icon-box">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-num-row">
                <span className="metric-number">{totalPlayers}</span>
                <span className="metric-tag">PEMAIN</span>
              </div>
              <div className="metric-title">Atlet Bertanding</div>
              <div className="metric-desc">Skuad Beregu Turnamen</div>
            </div>
          </div>

          {/* Metric 3: Matches */}
          <div className="metric-deck-card theme-green">
            <div className="metric-icon-box">
              <Activity size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-num-row">
                <span className="metric-number">{totalFinishedMatches}</span>
                <span className="metric-slash">/{totalMatches}</span>
                <span className="metric-tag">LAGA</span>
              </div>
              <div className="metric-title">Pertandingan Selesai</div>
              <div className="metric-desc">Fase Grup & Playoff</div>
            </div>
          </div>

          {/* Metric 4: Trophy */}
          <div className="metric-deck-card theme-gold">
            <div className="metric-icon-box">
              <Medal size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-num-row">
                <span className="metric-number">1</span>
                <span className="metric-tag">JUARA 1</span>
              </div>
              <div className="metric-title">Piala Bergilir</div>
              <div className="metric-desc">FBB Merdeka Cup 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* Poster Lightbox Modal */}
      {isPosterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPosterModalOpen(false)}>
          <div
            className="modal-content max-w-lg p-0 bg-transparent border-0 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-primary" />
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                      Poster Resmi FBB Merdeka Cup 2026
                    </h3>
                    <p className="text-2xs text-muted">{date} • {venue}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPosterModalOpen(false)}
                  className="btn-icon-subtle text-gray-500 hover:text-gray-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Poster Full Image */}
              <div className="p-3 bg-gray-900/5 flex items-center justify-center max-h-[75vh] overflow-y-auto">
                <img
                  src={posterUrl}
                  alt="Poster Resmi Turnamen"
                  className="max-h-[70vh] w-auto rounded-xl shadow-md object-contain"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-600">
                  📍 {venue}
                </span>
                <a
                  href={posterUrl}
                  download="Poster-FBB-Merdeka-Cup-2026.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  <Download size={14} /> Unduh Poster
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
