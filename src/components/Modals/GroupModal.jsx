import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';

export const GroupModal = ({ isOpen, onClose, groupToEdit = null }) => {
  const { addGroup, updateGroup } = useTournament();

  const [name, setName] = useState('');
  const [maxTeams, setMaxTeams] = useState(4);

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name || '');
      setMaxTeams(groupToEdit.maxTeams || 4);
    } else {
      setName('');
      setMaxTeams(4);
    }
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (groupToEdit) {
      updateGroup({
        ...groupToEdit,
        name,
        maxTeams: Number(maxTeams)
      });
    } else {
      addGroup(name, Number(maxTeams));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="font-bold text-lg text-gray-900">
            {groupToEdit ? 'Edit Nama Grup' : 'Buat Grup Turnamen Baru'}
          </h3>
          <button onClick={onClose} className="btn-icon-subtle text-muted">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nama Grup *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Grup A, Grup B, dsb."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kapasitas Maksimal Tim</label>
            <input
              type="number"
              min={2}
              max={16}
              value={maxTeams}
              onChange={(e) => setMaxTeams(e.target.value)}
              className="form-control"
            />
            <span className="text-xs text-muted mt-1">
              Standar turnamen fase grup biasanya 4 tim per grup.
            </span>
          </div>

          <div className="modal-footer mt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {groupToEdit ? 'Simpan Perubahan' : 'Buat Grup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
