import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  LogOut, 
  ExternalLink, 
  RefreshCw, 
  Shuffle, 
  Users, 
  Calendar, 
  Table2, 
  Award, 
  Cloud, 
  Activity, 
  ShieldCheck, 
  Plus, 
  UserPlus, 
  CalendarPlus,
  Flame,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

export const AdminDrawer = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  currentUser,
  logoutAdmin,
  cloudSettings,
  syncToGoogleSheets,
  syncLoading,
  totalPlayers,
  totalTeams,
  finishedMatches,
  totalMatches,
  onOpenAddPlayer,
  onOpenAddTeam,
  onOpenAddMatch,
  generateAllMatches
}) => {
  if (!isOpen) return null;

  const { data } = useTournament();
  const totalDoorprizes = (data?.doorprizes || []).length;

  const navItems = [
    { id: 'draw', label: 'Grading & Undian Tim', icon: Shuffle, badge: 'Pot Draw' },
    { id: 'doorprize', label: 'Spin & Undian Doorprize', icon: Gift, count: totalDoorprizes > 0 ? `${totalDoorprizes} Hadiah` : 'Undi 🎁' },
    { id: 'players', label: 'Manajemen Pemain', icon: Activity, count: totalPlayers },
    { id: 'teams', label: 'Kelola Tim & Skuad', icon: Users, count: totalTeams },
    { id: 'matches', label: 'Update Skor & Jadwal', icon: Calendar, count: `${finishedMatches}/${totalMatches}` },
    { id: 'standings', label: 'Pantau Klasemen', icon: Table2 },
    { id: 'knockout', label: 'Babak Playoff', icon: Award },
    { id: 'cloud', label: 'Database & Sync', icon: Cloud }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    onClose();
  };

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header: User Profile */}
        <div className="admin-drawer-header">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-xs font-bold px-2 py-0.5">
                <ShieldCheck size={12} /> PANEL PANITIA
              </span>
              <span className="online-badge">
                <span className="online-dot" /> Online
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="drawer-close-btn"
              title="Tutup Menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="admin-drawer-profile">
            <div className="drawer-avatar">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'Admin'} 
                  className="drawer-avatar-img"
                />
              ) : (
                <span className="drawer-avatar-initial">
                  {(currentUser?.displayName || currentUser?.email || 'A')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="drawer-user-name">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Panitia Turnamen'}
              </h4>
              <p className="drawer-user-email truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Quick Tournament Stat Bar */}
          <div className="drawer-quick-stats">
            <div className="stat-mini-tile">
              <span className="stat-mini-num">{totalPlayers}</span>
              <span className="stat-mini-lbl">Pemain</span>
            </div>
            <div className="stat-mini-tile">
              <span className="stat-mini-num">{totalTeams}</span>
              <span className="stat-mini-lbl">Tim PB</span>
            </div>
            <div className="stat-mini-tile">
              <span className="stat-mini-num">{finishedMatches}/{totalMatches}</span>
              <span className="stat-mini-lbl">Laga</span>
            </div>
          </div>
        </div>

        {/* Drawer Body: Navigation & Quick Tools */}
        <div className="admin-drawer-body">
          {/* Main Navigation Menu */}
          <div className="drawer-section-title">NAVIGASI UTAMA</div>
          <div className="drawer-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="drawer-nav-icon">
                      <Icon size={18} />
                    </div>
                    <span className="drawer-nav-label">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="badge badge-primary text-2xs font-extrabold px-1.5 py-0.5">
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="drawer-nav-count">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action Tools */}
          <div className="drawer-section-title mt-5">AKSI CEPAT TURNAMEN</div>
          <div className="drawer-actions-grid">
            <button
              onClick={() => {
                handleTabClick('draw');
              }}
              className="drawer-action-btn btn-highlight"
            >
              <Shuffle size={15} />
              <span>Kocok Tim (Pot Draw)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAddPlayer();
              }}
              className="drawer-action-btn"
            >
              <UserPlus size={15} />
              <span>+ Pemain Baru</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAddTeam();
              }}
              className="drawer-action-btn"
            >
              <Plus size={15} />
              <span>+ Tim Badminton</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAddMatch();
              }}
              className="drawer-action-btn"
            >
              <CalendarPlus size={15} />
              <span>+ Jadwal Laga</span>
            </button>
          </div>

          {/* Cloud Sync Tool in Drawer */}
          {cloudSettings?.googleSheets?.webAppUrl && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={syncToGoogleSheets}
                disabled={syncLoading}
                className="btn btn-secondary w-full justify-between text-xs py-2.5 font-bold"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className={syncLoading ? 'animate-spin text-primary' : 'text-primary'} />
                  Sync ke Google Sheets
                </span>
                <span className="badge badge-primary text-3xs">Sheets</span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer: Mode Pengunjung & Logout */}
        <div className="admin-drawer-footer">
          <Link 
            to="/fbb-cup2026" 
            className="drawer-public-link"
            onClick={onClose}
          >
            <ExternalLink size={15} />
            <span>Buka Halaman Pengunjung</span>
          </Link>

          <button
            onClick={() => {
              onClose();
              logoutAdmin();
            }}
            className="drawer-logout-btn"
            title="Keluar dari akun admin"
          >
            <LogOut size={16} />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
