import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import confetti from 'canvas-confetti';
import { 
  Shuffle, 
  Plus, 
  Trash2, 
  Edit3, 
  UserPlus, 
  CalendarPlus, 
  X, 
  Sparkles, 
  Layers,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const GroupsView = ({ onOpenAddGroup, onEditGroup }) => {
  const { 
    data, 
    isAdmin, 
    deleteGroup, 
    assignTeamToGroup, 
    removeTeamFromGroup, 
    generateGroupMatches, 
    autoDrawGroups,
    showToast 
  } = useTournament();

  const [selectedTeamToAssign, setSelectedTeamToAssign] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStepText, setDrawingStepText] = useState('');

  const groups = data.groups || [];
  const teams = data.teams || [];

  // Find all assigned team IDs
  const assignedTeamIds = groups.flatMap((g) => g.teamIds || []);
  const unassignedTeams = teams.filter((t) => !assignedTeamIds.includes(t.id));

  // Trigger live interactive draw animation
  const handleLiveDraw = () => {
    if (teams.length < 2 || groups.length < 1) {
      showToast('Dibutuhkan minimal 2 tim dan 1 grup untuk undian!', 'error');
      return;
    }

    setIsDrawing(true);
    setDrawingStepText('🎲 Mengacak bola undian tim FBB Cup 2026...');

    let countdown = 3;
    const interval = setInterval(() => {
      if (countdown > 1) {
        countdown--;
        setDrawingStepText(`🎲 Mengocok pot undian... (${countdown})`);
      } else {
        clearInterval(interval);
        autoDrawGroups();
        setIsDrawing(false);
        setDrawingStepText('');

        // Fire festive confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas-confetti environment issue
        }
      }
    }, 800);
  };

  return (
    <div className="groups-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Shuffle className="text-primary" size={26} />
            Manajemen Grup & Undian
          </h2>
          <p className="view-subtitle">
            Kelola pembagian grup turnamen dan masukkan tim/peserta ke dalam masing-masing grup.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              className="btn btn-secondary"
              onClick={handleLiveDraw}
              disabled={isDrawing}
            >
              <Sparkles size={18} className="text-amber-500" />
              <span>{isDrawing ? 'Mengundi...' : 'Undian Otomatis (Live Draw)'}</span>
            </button>

            <button 
              className="btn btn-primary"
              onClick={onOpenAddGroup}
            >
              <Plus size={18} />
              <span>+ Buat Grup Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Drawing Progress Alert */}
      {isDrawing && (
        <div className="live-draw-alert glass-card glass-card-highlight">
          <div className="spinner-flame" />
          <div>
            <h4 className="text-primary font-bold text-lg">PROSES UNDIAN GRUP SEDANG BERJALAN</h4>
            <p className="text-sm text-gray-600">{drawingStepText}</p>
          </div>
        </div>
      )}

      {/* Unassigned Teams Bar */}
      {unassignedTeams.length > 0 && (
        <div className="unassigned-bar glass-card">
          <div className="unassigned-header">
            <span className="badge badge-gold">
              {unassignedTeams.length} Tim Belum Masuk Grup
            </span>
            <span className="text-xs text-muted">
              Pilih grup pada kartu di bawah atau gunakan Undian Otomatis
            </span>
          </div>
          <div className="unassigned-team-pills">
            {unassignedTeams.map((team) => (
              <div 
                key={team.id} 
                className="team-pill-chip"
                style={{ borderColor: `${team.color || '#E06020'}44` }}
              >
                <span>{team.logo || '⚽'}</span>
                <span className="font-bold text-gray-800">{team.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="groups-cards-grid">
        {groups.length === 0 ? (
          <div className="glass-card empty-state-card col-span-full">
            <Layers size={48} className="text-muted mb-2" />
            <h3 className="text-lg font-bold">Belum Ada Grup Turnamen</h3>
            <p className="text-muted text-sm mb-4">Buat grup baru untuk mulai membagi tim peserta turnamen.</p>
            {isAdmin && (
              <button onClick={onOpenAddGroup} className="btn btn-primary">
                <Plus size={18} /> Buat Grup Sekarang
              </button>
            )}
          </div>
        ) : (
          groups.map((group) => {
            const groupTeams = (group.teamIds || [])
              .map((id) => teams.find((t) => t.id === id))
              .filter(Boolean);

            const isFull = groupTeams.length >= (group.maxTeams || 4);

            return (
              <div key={group.id} className="group-manage-card glass-card">
                {/* Header */}
                <div className="group-card-top">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                      <span className={`badge ${isFull ? 'badge-finished' : 'badge-primary'}`}>
                        {groupTeams.length} / {group.maxTeams || 4} Tim
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">Kapasitas Maksimal: {group.maxTeams || 4} Tim</p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGroup(group)}
                        className="btn-icon btn-secondary"
                        title="Edit Nama Grup"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus ${group.name}?`)) {
                            deleteGroup(group.id);
                          }
                        }}
                        className="btn-icon btn-danger"
                        title="Hapus Grup"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Slot List */}
                <div className="group-team-slots">
                  {groupTeams.map((team, idx) => (
                    <div 
                      key={team.id} 
                      className="group-team-item"
                      style={{ borderLeft: `3px solid ${team.color || '#E06020'}` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="slot-index">{idx + 1}</span>
                        <div 
                          className="slot-logo"
                          style={{ backgroundColor: `${team.color || '#E06020'}18` }}
                        >
                          {team.logo || '⚽'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{team.name}</div>
                          <div className="text-xs text-muted">Kapten: {team.captain || '-'}</div>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => removeTeamFromGroup(team.id, group.id)}
                          className="btn-remove-slot"
                          title="Keluarkan dari grup"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Empty slots placeholders */}
                  {Array.from({ length: Math.max(0, (group.maxTeams || 4) - groupTeams.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="group-slot-empty">
                      <span>+ Slot Kosong ({groupTeams.length + i + 1})</span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                {isAdmin && (
                  <div className="group-card-footer">
                    {/* Add Team Dropdown */}
                    {!isFull && unassignedTeams.length > 0 && (
                      <div className="assign-team-box">
                        <select
                          className="form-control text-sm py-1.5"
                          value={selectedTeamToAssign[group.id] || ''}
                          onChange={(e) =>
                            setSelectedTeamToAssign({
                              ...selectedTeamToAssign,
                              [group.id]: e.target.value
                            })
                          }
                        >
                          <option value="">-- Masukkan Tim ke {group.name} --</option>
                          {unassignedTeams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={!selectedTeamToAssign[group.id]}
                          onClick={() => {
                            if (selectedTeamToAssign[group.id]) {
                              assignTeamToGroup(selectedTeamToAssign[group.id], group.id);
                              setSelectedTeamToAssign({ ...selectedTeamToAssign, [group.id]: '' });
                            }
                          }}
                        >
                          <UserPlus size={15} /> Masukkan
                        </button>
                      </div>
                    )}

                    {/* Auto Match Schedule Generator */}
                    {groupTeams.length >= 2 && (
                      <button
                        onClick={() => {
                          if (confirm(`Buat jadwal pertandingan round-robin otomatis untuk ${group.name}?`)) {
                            generateGroupMatches(group.id);
                          }
                        }}
                        className="btn btn-sm btn-outline-primary w-full mt-2"
                      >
                        <CalendarPlus size={15} />
                        <span>Generate Jadwal Pertandingan ({group.name})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
