import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Plus, Users, Check, UserPlus } from 'lucide-react';

const LOGO_EMOJIS = ['🏸', '⚡', '🔥', '🦅', '🛡️', '⚔️', '🎯', '👑', '🦁', '🚀', '🐉', '⭐', '🦏', '🐘', '🦜', '𓆌'];
const PRESET_COLORS = ['#E06020', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#64748B'];

export const TeamModal = ({ isOpen, onClose, teamToEdit = null }) => {
  const { addTeam, updateTeam, data, addPlayer } = useTournament();

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    captain: '',
    phone: '',
    color: '#E06020',
    logo: '🏸',
    playerIds: []
  });

  const [quickPlayerName, setQuickPlayerName] = useState('');

  const allPlayers = data.players || [];

  useEffect(() => {
    if (teamToEdit) {
      setFormData({
        id: teamToEdit.id,
        name: teamToEdit.name || '',
        shortName: teamToEdit.shortName || '',
        captain: teamToEdit.captain || '',
        phone: teamToEdit.phone || '',
        color: teamToEdit.color || '#E06020',
        logo: teamToEdit.logo || '🏸',
        playerIds: teamToEdit.playerIds ? [...teamToEdit.playerIds] : []
      });
    } else {
      setFormData({
        name: '',
        shortName: '',
        captain: '',
        phone: '',
        color: '#E06020',
        logo: '🏸',
        playerIds: []
      });
    }
  }, [teamToEdit, isOpen]);

  if (!isOpen) return null;

  const togglePlayerSelection = (playerId) => {
    setFormData((prev) => {
      const exists = prev.playerIds.includes(playerId);
      return {
        ...prev,
        playerIds: exists
          ? prev.playerIds.filter((id) => id !== playerId)
          : [...prev.playerIds, playerId]
      };
    });
  };

  const handleQuickAddPlayer = (e) => {
    e.preventDefault();
    if (!quickPlayerName.trim()) return;

    const newP = addPlayer({
      name: quickPlayerName.trim(),
      gender: 'L',
      phone: ''
    });

    if (newP && newP.id) {
      setFormData((prev) => ({
        ...prev,
        playerIds: [...prev.playerIds, newP.id]
      }));
      setQuickPlayerName('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (teamToEdit) {
      updateTeam(formData);
    } else {
      addTeam(formData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          {/* Modal Header */}
          <div className="modal-header">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <span>{formData.logo || '🏸'}</span>
                <span>{teamToEdit ? 'Edit Tim Badminton' : 'Daftarkan Tim Badminton Baru'}</span>
              </h3>
              <p className="text-2xs text-muted mt-0.5">
                {teamToEdit ? 'Perbarui informasi dan susunan pemain tim' : 'Buat tim baru dan pilih pemain dari master pool'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn-icon-subtle text-muted">
              ✕
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="modal-body flex-1 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-group md:col-span-2">
                <label className="form-label">Nama Tim / PB *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PB Garuda FBB"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kode (3 Huruf)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="GDA"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                  className="form-control uppercase font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Nama Kapten Tim</label>
                <input
                  type="text"
                  placeholder="Nama Kapten / Official"
                  value={formData.captain}
                  onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            {/* Logo & Color Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Ikon / Logo Tim</label>
                <div className="emoji-picker-grid">
                  {LOGO_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: emoji })}
                      className={`emoji-btn ${formData.logo === emoji ? 'active' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warna Utama Tim</label>
                <div className="color-picker-grid">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`color-btn ${formData.color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Players in Team Roster Section */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0 flex items-center gap-1.5">
                  <Users size={15} className="text-primary" />
                  <span>Pilih Pemain Skuad ({formData.playerIds.length} Terpilih)</span>
                </label>
                <span className="text-2xs text-muted">Klik nama untuk memilih</span>
              </div>

              {/* Players list checkbox selector */}
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1.5 mb-2">
                {allPlayers.length === 0 ? (
                  <p className="text-xs text-muted text-center py-2">
                    Belum ada master pemain. Tambahkan di bawah atau lewat menu Manajemen Pemain.
                  </p>
                ) : (
                  allPlayers.map((player) => {
                    const isSelected = formData.playerIds.includes(player.id);
                    const isAssignedOther = player.teamId && player.teamId !== teamToEdit?.id;
                    const lvl = player.level || 'B';

                    return (
                      <div
                        key={player.id}
                        onClick={() => togglePlayerSelection(player.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition text-xs ${isSelected
                          ? 'bg-orange-50 border border-orange-300 font-bold text-orange-950 shadow-2xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'
                              }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                          <span className="font-medium text-gray-900">{player.name}</span>
                          <span className={`badge-level badge-level-${lvl.toLowerCase().replace('+', '-plus')} text-3xs py-0 px-1 font-bold`}>
                            {lvl}
                          </span>
                        </div>

                        {isAssignedOther && !isSelected && (
                          <span className="text-3xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-semibold">
                            Di tim lain
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick add player input */}
              <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Tambah nama pemain baru ke database..."
                  value={quickPlayerName}
                  onChange={(e) => setQuickPlayerName(e.target.value)}
                  className="form-control text-xs py-1.5 flex-1"
                />
                <button
                  type="button"
                  onClick={handleQuickAddPlayer}
                  disabled={!quickPlayerName.trim()}
                  className="btn btn-sm btn-outline-primary whitespace-nowrap"
                >
                  <UserPlus size={13} /> Tambah Pemain
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer (Sticky at Bottom) */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary font-bold shadow-md">
              <Check size={16} />
              <span>{teamToEdit ? 'Simpan Perubahan Tim' : 'Daftarkan Tim Badminton'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
