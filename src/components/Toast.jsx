import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { notification } = useTournament();

  if (!notification) return null;

  const { message, type } = notification;

  return (
    <div className={`toast-floating-container toast-${type || 'success'}`}>
      <div className="toast-content">
        {type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
        {type === 'error' && <AlertCircle size={18} className="text-rose-400" />}
        {type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
        {type === 'info' && <Info size={18} className="text-primary-light" />}
        <span className="toast-text">{message}</span>
      </div>
    </div>
  );
};
