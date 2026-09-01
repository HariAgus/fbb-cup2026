import React from 'react';
import { useTournament } from '../context/TournamentContext';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Trophy, 
  Sparkles, 
  Edit3, 
  Crown
} from 'lucide-react';

export const KnockoutView = ({ onOpenKnockoutScoreModal }) => {
  const { data, standings, isAdmin } = useTournament();

  const knockoutMatches = data.knockoutMatches || [];
  const teamsMap = (data.teams || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  const sf1 = knockoutMatches.find((m) => m.id === 'sf-1');
  const sf2 = knockoutMatches.find((m) => m.id === 'sf-2');
  const finalMatch = knockoutMatches.find((m) => m.id === 'final');

  const winnerFinal = finalMatch?.winnerId ? teamsMap[finalMatch.winnerId] : null;

  const triggerCelebrate = () => {
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch (e) {}
  };

  return (
    <div className="knockout-container">
      {/* Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title flex items-center gap-2">
            <Award className="text-primary" size={26} />
            Bagan Babak Playoff & Grand Final
          </h2>
          <p className="view-subtitle">
            4 Tim Teratas di Klasemen bertarung di Babak Semifinal (Playoff) menuju Grand Final Juara FBB Cup 2026.
          </p>
        </div>

        {winnerFinal && (
          <button onClick={triggerCelebrate} className="btn btn-primary">
            <Sparkles size={18} />
            <span>Selebrasi Juara!</span>
          </button>
        )}
      </div>

      {/* Champion Podium Box if Final Completed */}
      {winnerFinal && (
        <div className="champion-banner-card glass-card animate-float">
          <div className="flex items-center justify-center gap-4">
            <Crown size={48} className="text-amber-500" />
            <div className="text-center">
              <span className="badge badge-gold mb-1">🏆 SANG JUARA FBB CUP 2026</span>
              <h2 className="text-3xl font-black text-gray-900 flex items-center justify-center gap-3">
                <span>{winnerFinal.logo || '🏆'}</span>
                <span>{winnerFinal.name}</span>
              </h2>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Selamat kepada sang juara turnamen bergengsi FBB Cup 2026!
              </p>
            </div>
            <Trophy size={48} className="text-amber-500" />
          </div>
        </div>
      )}

      {/* Bracket Tree Layout */}
      <div className="bracket-layout">
        {/* SEMIFINALS COLUMN */}
        <div className="bracket-column">
          <h3 className="bracket-col-title">BABAK SEMIFINAL (TOP 4)</h3>

          <div className="bracket-matches-stack">
            {/* SF 1 */}
            {sf1 && (
              <div className="bracket-match-card glass-card">
                <div className="bracket-match-header">
                  <span className="badge badge-primary text-xs">Peringkat 1 vs Peringkat 4</span>
                  <span className="text-xs text-muted">{sf1.date || '19 Sep 2026'}</span>
                </div>

                <div className="bracket-teams-box">
                  {/* Team 1 */}
                  <div className={`bracket-team-row ${sf1.winnerId === sf1.team1Id ? 'winner-row' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span>{teamsMap[sf1.team1Id]?.logo || '⚽'}</span>
                      <span className="font-bold text-sm text-gray-900">
                        {teamsMap[sf1.team1Id]?.name || sf1.team1Placeholder || 'Peringkat 1'}
                      </span>
                    </div>
                    <span className="bracket-score-num text-gray-900">
                      {sf1.team1Score !== null ? sf1.team1Score : '-'}
                    </span>
                  </div>

                  {/* Team 2 */}
                  <div className={`bracket-team-row ${sf1.winnerId === sf1.team2Id ? 'winner-row' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span>{teamsMap[sf1.team2Id]?.logo || '⚽'}</span>
                      <span className="font-bold text-sm text-gray-900">
                        {teamsMap[sf1.team2Id]?.name || sf1.team2Placeholder || 'Peringkat 4'}
                      </span>
                    </div>
                    <span className="bracket-score-num text-gray-900">
                      {sf1.team2Score !== null ? sf1.team2Score : '-'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => onOpenKnockoutScoreModal(sf1)}
                    className="btn btn-sm btn-secondary w-full mt-2"
                  >
                    <Edit3 size={13} /> Update Skor Semifinal 1
                  </button>
                )}
              </div>
            )}

            {/* SF 2 */}
            {sf2 && (
              <div className="bracket-match-card glass-card">
                <div className="bracket-match-header">
                  <span className="badge badge-primary text-xs">Peringkat 2 vs Peringkat 3</span>
                  <span className="text-xs text-muted">{sf2.date || '19 Sep 2026'}</span>
                </div>

                <div className="bracket-teams-box">
                  {/* Team 1 */}
                  <div className={`bracket-team-row ${sf2.winnerId === sf2.team1Id ? 'winner-row' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span>{teamsMap[sf2.team1Id]?.logo || '⚽'}</span>
                      <span className="font-bold text-sm text-gray-900">
                        {teamsMap[sf2.team1Id]?.name || sf2.team1Placeholder || 'Peringkat 2'}
                      </span>
                    </div>
                    <span className="bracket-score-num text-gray-900">
                      {sf2.team1Score !== null ? sf2.team1Score : '-'}
                    </span>
                  </div>

                  {/* Team 2 */}
                  <div className={`bracket-team-row ${sf2.winnerId === sf2.team2Id ? 'winner-row' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span>{teamsMap[sf2.team2Id]?.logo || '⚽'}</span>
                      <span className="font-bold text-sm text-gray-900">
                        {teamsMap[sf2.team2Id]?.name || sf2.team2Placeholder || 'Peringkat 3'}
                      </span>
                    </div>
                    <span className="bracket-score-num text-gray-900">
                      {sf2.team2Score !== null ? sf2.team2Score : '-'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => onOpenKnockoutScoreModal(sf2)}
                    className="btn btn-sm btn-secondary w-full mt-2"
                  >
                    <Edit3 size={13} /> Update Skor Semifinal 2
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CONNECTOR ARROW */}
        <div className="bracket-connector">
          <div className="connector-line-top" />
          <div className="connector-junction" />
          <div className="connector-line-bottom" />
        </div>

        {/* GRAND FINAL COLUMN */}
        <div className="bracket-column">
          <h3 className="bracket-col-title text-amber-600 flex items-center gap-2 justify-center">
            <Trophy size={18} /> GRAND FINAL
          </h3>

          {finalMatch && (
            <div className="bracket-match-card glass-card final-card-glow">
              <div className="bracket-match-header">
                <span className="badge badge-gold text-xs">Perebutan Juara 1</span>
                <span className="text-xs text-muted">{finalMatch.date || '20 Sep 2026'}</span>
              </div>

              <div className="bracket-teams-box">
                {/* Team 1 */}
                <div className={`bracket-team-row ${finalMatch.winnerId && finalMatch.winnerId === finalMatch.team1Id ? 'winner-row' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span>{teamsMap[finalMatch.team1Id]?.logo || '🏆'}</span>
                    <span className="font-bold text-sm text-gray-900">
                      {teamsMap[finalMatch.team1Id]?.name || finalMatch.team1Placeholder || 'Pemenang SF 1'}
                    </span>
                  </div>
                  <span className="bracket-score-num text-amber-600 font-bold">
                    {finalMatch.team1Score !== null ? finalMatch.team1Score : '-'}
                  </span>
                </div>

                {/* Team 2 */}
                <div className={`bracket-team-row ${finalMatch.winnerId && finalMatch.winnerId === finalMatch.team2Id ? 'winner-row' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span>{teamsMap[finalMatch.team2Id]?.logo || '🏆'}</span>
                    <span className="font-bold text-sm text-gray-900">
                      {teamsMap[finalMatch.team2Id]?.name || finalMatch.team2Placeholder || 'Pemenang SF 2'}
                    </span>
                  </div>
                  <span className="bracket-score-num text-amber-600 font-bold">
                    {finalMatch.team2Score !== null ? finalMatch.team2Score : '-'}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => onOpenKnockoutScoreModal(finalMatch)}
                  className="btn btn-sm btn-primary w-full mt-3"
                >
                  <Edit3 size={14} /> Update Skor Grand Final
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
