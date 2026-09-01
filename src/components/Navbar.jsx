import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Trophy, 
  Table2, 
  Flame, 
  Users, 
  Calendar, 
  Shuffle, 
  Cloud, 
  ShieldCheck, 
  Eye,
  Award
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { isAdmin, setIsAdmin, data, cloudSettings } = useTournament();

  const navItems = [
    { id: 'standings', label: 'Klasemen', icon: Table2 },
    { id: 'matches', label: 'Pertandingan', icon: Calendar },
    { id: 'groups', label: 'Grup & Undian', icon: Shuffle },
    { id: 'teams', label: 'Tim & Pemain', icon: Users },
    { id: 'knockout', label: 'Fase Gugur', icon: Award },
    { id: 'cloud', label: 'Cloud & Database', icon: Cloud }
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => setActiveTab('standings')}>
          <div className="brand-badge">
            <Flame size={22} className="brand-flame-icon" />
          </div>
          <div className="brand-text-wrapper">
            <div className="brand-title">
              FBB <span className="brand-highlight">CUP 2026</span>
            </div>
            <div className="brand-subtitle">Tournament Championship</div>
          </div>
        </div>

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
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <div className="nav-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Mode Switcher & Cloud Indicator */}
        <div className="navbar-right">
          {/* Cloud Sync Pill Indicator */}
          {cloudSettings.googleSheets?.webAppUrl && (
            <div className="cloud-indicator-badge" title="Google Sheets Terhubung">
              <span className="dot-pulse" />
              <span>Sheets Sync</span>
            </div>
          )}

          {/* Admin Toggle */}
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`admin-toggle-btn ${isAdmin ? 'admin-active' : 'public-active'}`}
            title={isAdmin ? 'Klik untuk beralih ke Mode Publik' : 'Klik untuk masuk Mode Admin'}
          >
            {isAdmin ? (
              <>
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Mode Admin</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>Mode Publik</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
