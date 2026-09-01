import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import { UserPortal } from './pages/UserPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Toast } from './components/Toast';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <TournamentProvider>
        <Routes>
          {/* User / Public View Routes */}
          <Route path="/fbb-cup2026" element={<UserPortal />} />
          <Route path="/" element={<Navigate to="/fbb-cup2026" replace />} />

          {/* Admin Command Center Routes */}
          <Route path="/fbb-cup2026/admin" element={<AdminPortal />} />
          <Route path="/admin" element={<Navigate to="/fbb-cup2026/admin" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/fbb-cup2026" replace />} />
        </Routes>
        <Toast />
      </TournamentProvider>
    </BrowserRouter>
  );
}
