import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';

export const PlayerModal = ({ isOpen, onClose, playerToEdit = null }) => {
  const { addPlayer, updatePlayer, data } = useTournament();

  const [formData, setFormData] = useState({
    name: '',
    gender: 'L',
    level: 'B',
    phone: '',
    teamId: ''
  });

  const teams = data.teams || [];

  useEffect(() => {
    if (playerToEdit) {
      setFormData({
        id: playerToEdit.id,
        name: playerToEdit.name || '',
        gender: playerToEdit.gender || 'L',
        level: playerToEdit.level || 'B',
        phone: playerToEdit.phone || '',
        teamId: playerToEdit.teamId || ''
      });
    } else {
      setFormData({
        name: '',
        gender: 'L',
        level: 'B',
        phone: '',
        teamId: ''
      });
    }
  }, [playerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      level: formData.level || 'B',
      teamId: formData.teamId || null
    };

    if (playerToEdit) {
      updatePlayer(payload);
    } else {
      addPlayer(payload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form-wrapper">
          <div className="modal-header">
            <h3 className="font-bold text-lg text-gray-900">
              {playerToEdit ? 'Edit Data Pemain' : 'Tambah Pemain Baru'}
            </h3>
            <button type="button" onClick={onClose} className="btn-icon-subtle text-muted">
              ✕
            </button>
          </div>

          <div className="modal-body flex-1 overflow-y-auto space-y-4">
            <div className="form-group">
              <label className="form-label">Nama Lengkap Pemain *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Anthony Sinisuka Ginting"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="form-control"
                >
                  <option value="L">Laki-Laki (Putra)</option>
                  <option value="P">Perempuan (Putri)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Grading Level Pemain</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="form-control font-bold"
                >
                  <option value="A">👑 Level A (Unggulan)</option>
                  <option value="B">⚡ Level B (Menengah)</option>
                  <option value="C">🛡️ Level C (Pemula)</option>
                </select>
              </div>
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

            <div className="form-group">
              <label className="form-label">Penempatan Tim (Opsional)</label>
              <select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="form-control"
              >
                <option value="">-- Bebas (Belum Masuk Tim) --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <span className="text-2xs text-muted mt-1">
                Pemain juga dapat dipilih langsung saat membuat atau mengedit tim.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary font-bold">
              {playerToEdit ? 'Simpan Perubahan' : 'Daftarkan Pemain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
