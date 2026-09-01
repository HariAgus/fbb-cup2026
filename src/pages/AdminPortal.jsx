import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { AdminLoginView } from '../components/AdminLoginView';
import { AdminDrawer } from '../components/AdminDrawer';
import { StandingsView } from '../components/StandingsView';
import { MatchesView } from '../components/MatchesView';
import { TeamsView } from '../components/TeamsView';
import { PlayersView } from '../components/PlayersView';
import { KnockoutView } from '../components/KnockoutView';
import { CloudSyncView } from '../components/CloudSyncView';
import { PlayerGradingAndDrawView } from '../components/PlayerGradingAndDrawView';
import { AdminDoorprizeView } from '../components/AdminDoorprizeView';
import { PlayerModal } from '../components/Modals/PlayerModal';
import { TeamModal } from '../components/Modals/TeamModal';
import { ScoreModal } from '../components/Modals/ScoreModal';
import { AddMatchModal } from '../components/Modals/AddMatchModal';
import { KnockoutScoreModal } from '../components/Modals/KnockoutScoreModal';
import { RosterModal } from '../components/Modals/RosterModal';
import { 
  ShieldCheck, 
  Table2, 
  Calendar, 
  Users, 
  Award, 
  Cloud, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  CalendarPlus, 
  Activity, 
  UserPlus, 
  Shuffle, 
  Sparkles,
  LogOut,
  UserCheck,
  Menu,
  Gift
} from 'lucide-react';

export const AdminPortal = () => {
  const {
    data,
    cloudSettings,
    syncToGoogleSheets,
    syncLoading,
    generateAllMatches,
    currentUser,
    authLoading,
    logoutAdmin
  } = useTournament();
  const [activeTab, setActiveTab] = useState('draw');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal States
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState(false);

  const [isKnockoutScoreModalOpen, setIsKnockoutScoreModalOpen] = useState(false);
  const [selectedKnockoutMatch, setSelectedKnockoutMatch] = useState(null);

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedRosterTeam, setSelectedRosterTeam] = useState(null);

  const totalPlayers = (data.players || []).length;
  const totalTeams = (data.teams || []).length;
  const totalMatches = (data.matches || []).length;
  const finishedMatches = (data.matches || []).filter((m) => m.status === 'finished').length;

  const adminNavItems = [
    { id: 'draw', label: 'Undian Pot', icon: Shuffle },
    { id: 'doorprize', label: 'Doorprize', icon: Gift },
    { id: 'players', label: 'Pemain', icon: Activity },
    { id: 'teams', label: 'Tim Skuad', icon: Users },
    { id: 'matches', label: 'Jadwal & Skor', icon: Calendar },
    { id: 'standings', label: 'Klasemen', icon: Table2 },
    { id: 'knockout', label: 'Playoff', icon: Award },
    { id: 'cloud', label: 'Database', icon: Cloud }
  ];

  // Handler helpers
  const handleOpenAddPlayer = () => {
    setEditingPlayer(null);
    setIsPlayerModalOpen(true);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleOpenScoreModal = (match) => {
    setSelectedMatch(match);
    setIsScoreModalOpen(true);
  };

  const handleOpenAddMatch = () => {
    setIsAddMatchModalOpen(true);
  };

  const handleOpenKnockoutScoreModal = (kMatch) => {
    setSelectedKnockoutMatch(kMatch);
    setIsKnockoutScoreModalOpen(true);
  };

  const handleViewRoster = (team) => {
    setSelectedRosterTeam(team);
    setIsRosterModalOpen(true);
  };

  // 🔒 If checking auth status
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card glass-card">
          <div className="brand-badge animate-bounce mb-3 mx-auto">
            <span className="text-2xl">🏸</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Memeriksa Sesi Firebase...</h3>
          <p className="text-xs text-muted">Menghubungkan ke otentikasi panitia</p>
        </div>
      </div>
    );
  }

  // 🔒 If user is NOT logged in, show dedicated Admin Login Screen
  if (!currentUser) {
    return <AdminLoginView />;
  }

  return (
    <div className="app-container">
      {/* 🌟 Clean 1-Row Admin Navbar */}
      <header className="admin-navbar-single-row">
        <div className="admin-navbar-inner">
          {/* Left: Hamburger Drawer Button & Brand */}
          <div className="admin-brand-group">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="drawer-hamburger-btn"
              title="Buka Menu Panel Panitia (Drawer)"
            >
              <Menu size={20} />
            </button>

            <Link to="/fbb-cup2026/admin" className="navbar-brand" style={{ padding: 0 }}>
              <div className="brand-badge">
                <span className="text-lg">🏸</span>
              </div>
              <div className="brand-text-wrapper">
                <div className="brand-title flex items-center gap-1.5">
                  <span>FBB</span>
                  <span className="brand-highlight">ADMIN</span>
                  <span className="panitia-role-badge">PANITIA</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Sleek Compact Navigation Tabs (Desktop) */}
          <nav className="admin-nav-tabs-desktop">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`admin-tab-pill ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Tools, Public Link & User Profile Pill */}
          <div className="admin-right-actions">
            {cloudSettings.googleSheets?.webAppUrl && (
              <button
                onClick={syncToGoogleSheets}
                disabled={syncLoading}
                className="btn btn-sm btn-outline-primary"
                title="Kirim perubahan ke Google Sheets"
              >
                <RefreshCw size={13} className={syncLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Sync Sheets</span>
              </button>
            )}

            <Link to="/fbb-cup2026" className="public-portal-link text-xs py-1.5 px-3" title="Lihat Tampilan Pengunjung">
              <span className="hidden sm:inline">Mode Pengunjung</span>
              <ExternalLink size={13} />
            </Link>

            {/* Admin User Profile Pill (Opens Drawer) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="admin-user-pill-btn"
              title="Klik untuk membuka Menu Panitia & Pengaturan"
            >
              <div className="admin-user-avatar">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Admin'}
                    className="avatar-img"
                  />
                ) : (
                  <span className="avatar-initial">
                    {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="admin-user-info hidden md:flex">
                <span className="admin-user-name">
                  {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                </span>
                <span className="admin-user-role flex items-center gap-1">
                  <span className="online-dot" /> Online
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Side Drawer */}
      <AdminDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        logoutAdmin={logoutAdmin}
        cloudSettings={cloudSettings}
        syncToGoogleSheets={syncToGoogleSheets}
        syncLoading={syncLoading}
        totalPlayers={totalPlayers}
        totalTeams={totalTeams}
        finishedMatches={finishedMatches}
        totalMatches={totalMatches}
        onOpenAddPlayer={handleOpenAddPlayer}
        onOpenAddTeam={handleOpenAddTeam}
        onOpenAddMatch={handleOpenAddMatch}
        generateAllMatches={generateAllMatches}
      />

      {/* Main Admin Content */}
      <main className="main-content">
        {/* Admin Quick Control Bar */}
        <div className="admin-quick-bar">
          <div className="admin-quick-left">
            <span className="badge badge-primary">Badminton Control Panel</span>
            <div className="admin-quick-stats">
              <span><b>{totalPlayers}</b> Pemain Terdaftar</span>
              <span className="stat-sep">•</span>
              <span><b>{totalTeams}</b> Tim PB</span>
              <span className="stat-sep">•</span>
              <span><b>{finishedMatches}/{totalMatches}</b> Laga Selesai</span>
            </div>
          </div>

          <div className="admin-quick-right header-actions-group">
            <button 
              onClick={() => setActiveTab('draw')} 
              className={`btn btn-sm ${activeTab === 'draw' ? 'btn-primary' : 'btn-outline-primary'}`}
              title="Buka Alat Grading & Kocok Tim"
            >
              <Shuffle size={14} /> <span>Kocok Tim (Pot Draw)</span>
            </button>
            <button 
              onClick={() => setActiveTab('doorprize')} 
              className={`btn btn-sm ${activeTab === 'doorprize' ? 'btn-primary' : 'btn-outline-primary'}`}
              title="Buka Fitur Undian & Spin Doorprize"
            >
              <Gift size={14} /> <span>Spin Doorprize</span>
            </button>
            <button onClick={handleOpenAddPlayer} className="btn btn-sm btn-outline-primary">
              <UserPlus size={14} /> <span>Pemain Baru</span>
            </button>
            <button onClick={handleOpenAddTeam} className="btn btn-sm btn-secondary">
              <Plus size={14} /> <span>Tim Badminton</span>
            </button>
            {totalTeams >= 2 && (
              <button onClick={generateAllMatches} className="btn btn-sm btn-secondary">
                <CalendarPlus size={14} /> <span>Generate Jadwal</span>
              </button>
            )}
            <button onClick={() => setIsAddMatchModalOpen(true)} className="btn btn-sm btn-secondary">
              <Plus size={14} /> <span>Jadwal Laga</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        <div className="admin-view-wrapper">
          {activeTab === 'draw' && (
            <PlayerGradingAndDrawView
              onOpenAddPlayer={handleOpenAddPlayer}
              onEditPlayer={handleEditPlayer}
            />
          )}

          {activeTab === 'doorprize' && (
            <AdminDoorprizeView />
          )}

          {activeTab === 'players' && (
            <PlayersView
              onOpenAddPlayer={handleOpenAddPlayer}
              onEditPlayer={handleEditPlayer}
            />
          )}

          {activeTab === 'teams' && (
            <TeamsView
              onOpenAddTeam={handleOpenAddTeam}
              onEditTeam={handleEditTeam}
              onViewRoster={handleViewRoster}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesView
              onOpenScoreModal={handleOpenScoreModal}
              onOpenAddMatch={() => setIsAddMatchModalOpen(true)}
            />
          )}

          {activeTab === 'standings' && (
            <StandingsView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'knockout' && (
            <KnockoutView
              onOpenKnockoutScoreModal={handleOpenKnockoutScoreModal}
            />
          )}

          {activeTab === 'cloud' && <CloudSyncView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span className="text-xs text-muted">
            🛡️ Panel Admin Resmi Turnamen Badminton FBB Cup 2026. Data pemain dan tim tersinkronisasi otomatis.
          </span>
          <Link to="/fbb-cup2026" className="text-xs text-primary font-semibold hover:underline">
            ← Kembali ke Halaman Publik
          </Link>
        </div>
      </footer>

      {/* Modals */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        playerToEdit={editingPlayer}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamToEdit={editingTeam}
      />

      <ScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        match={selectedMatch}
      />

      <AddMatchModal
        isOpen={isAddMatchModalOpen}
        onClose={() => setIsAddMatchModalOpen(false)}
      />

      <KnockoutScoreModal
        isOpen={isKnockoutScoreModalOpen}
        onClose={() => setIsKnockoutScoreModalOpen(false)}
        knockoutMatch={selectedKnockoutMatch}
      />

      <RosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        team={selectedRosterTeam}
      />
    </div>
  );
};
