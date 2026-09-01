import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { HeroBanner } from '../components/HeroBanner';
import { StandingsView } from '../components/StandingsView';
import { MatchesView } from '../components/MatchesView';
import { TeamsView } from '../components/TeamsView';
import { PlayersView } from '../components/PlayersView';
import { KnockoutView } from '../components/KnockoutView';
import { UserDoorprizeHistoryView } from '../components/UserDoorprizeHistoryView';
import { RosterModal } from '../components/Modals/RosterModal';
import { 
  Flame, 
  Table2, 
  Calendar, 
  Users, 
  Award, 
  ShieldCheck,
  Activity,
  Gift
} from 'lucide-react';

export const UserPortal = () => {
  const { data, currentUser } = useTournament();
  const [activeTab, setActiveTab] = useState('standings');
  const [selectedRosterTeam, setSelectedRosterTeam] = useState(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  const navItems = [
    { id: 'standings', label: 'Klasemen Badminton', icon: Table2 },
    { id: 'matches', label: 'Jadwal & Skor', icon: Calendar },
    { id: 'teams', label: 'Tim Badminton', icon: Users },
    { id: 'players', label: 'Data Pemain', icon: Activity },
    { id: 'knockout', label: 'Bagan Playoff', icon: Award },
    { id: 'doorprize', label: 'Doorprize', icon: Gift }
  ];

  const handleViewRoster = (team) => {
    setSelectedRosterTeam(team);
    setIsRosterModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Public Navbar */}
      <header className="navbar-container">
        <div className="navbar-inner">
          <Link to="/fbb-cup2026" className="navbar-brand">
            <div className="brand-badge">
              <span className="text-xl">🏸</span>
            </div>
            <div className="brand-text-wrapper">
              <div className="brand-title">
                FBB <span className="brand-highlight">BADMINTON 2026</span>
              </div>
              <div className="brand-subtitle">Official Badminton Championship</div>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="navbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section: Link to Admin Portal */}
          <div className="navbar-right">
            <Link
              to="/fbb-cup2026/admin"
              className={`admin-portal-link ${currentUser ? 'active-admin' : ''}`}
              title={currentUser ? 'Buka Dashboard Admin (Sesi Aktif)' : 'Login Panitia & Manajemen Data'}
            >
              {currentUser && <span className="online-dot" />}
              <ShieldCheck size={16} />
              <span>{currentUser ? `Dashboard (${currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]})` : 'Login Panitia'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <HeroBanner
          onOpenAddTeam={null}
          setActiveTab={setActiveTab}
        />

        {activeTab === 'standings' && (
          <StandingsView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            onOpenScoreModal={() => {}}
            onOpenAddMatch={() => {}}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsView
            onOpenAddTeam={() => {}}
            onEditTeam={() => {}}
            onViewRoster={handleViewRoster}
          />
        )}

        {activeTab === 'players' && (
          <PlayersView
            onOpenAddPlayer={() => {}}
            onEditPlayer={() => {}}
          />
        )}

        {activeTab === 'knockout' && (
          <KnockoutView
            onOpenKnockoutScoreModal={() => {}}
          />
        )}

        {activeTab === 'doorprize' && (
          <UserDoorprizeHistoryView />
        )}
      </main>

      {/* Public Footer */}
      <footer className="app-footer">
        <div className="app-footer-inner">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">🏸</span>
            <span className="font-bold text-sm text-gray-800">FBB BADMINTON CUP 2026 OFFICIAL</span>
            <span className="text-xs text-muted">| Arena: {data.tournamentInfo?.venue || 'Jakarta'}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted">
            <Link to="/fbb-cup2026/admin" className="text-primary hover:underline flex items-center gap-1 font-semibold">
              <ShieldCheck size={14} /> Login Admin Panel
            </Link>
            <span>© 2026 FBB Badminton Championship</span>
          </div>
        </div>
      </footer>

      {/* Player Roster Modal */}
      <RosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        team={selectedRosterTeam}
      />
    </div>
  );
};
