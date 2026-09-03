import React from 'react';
import { useTournament } from '../context/TournamentContext';
import confetti from 'canvas-confetti';
import {
  Award,
  Trophy,
  Sparkles,
  Edit3,
  Crown,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const KnockoutView = ({ onOpenKnockoutScoreModal }) => {
  const { data, standings, isAdmin } = useTournament();

  const knockoutMatches = data.knockoutMatches || [];
  const teamsMap = (data.teams || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  // Live Standings top 4
  const rank1 = standings[0]?.team;
  const rank2 = standings[1]?.team;
  const rank3 = standings[2]?.team;
  const rank4 = standings[3]?.team;

  const rawSf1 = knockoutMatches.find((m) => m.id === 'sf-1') || {};
  const rawSf2 = knockoutMatches.find((m) => m.id === 'sf-2') || {};
  const rawFinal = knockoutMatches.find((m) => m.id === 'final') || {};

  // Resolved SF1 Teams (Juara 1 vs Juara 3)
  const sf1Team1 = rank1 || (rawSf1.team1Id ? teamsMap[rawSf1.team1Id] : null);
  const sf1Team2 = rank3 || (rawSf1.team2Id ? teamsMap[rawSf1.team2Id] : null);

  // Resolved SF2 Teams (Juara 2 vs Juara 4)
  const sf2Team1 = rank2 || (rawSf2.team1Id ? teamsMap[rawSf2.team1Id] : null);
  const sf2Team2 = rank4 || (rawSf2.team2Id ? teamsMap[rawSf2.team2Id] : null);

  const sf1 = {
    ...rawSf1,
    id: 'sf-1',
    stage: 'Semifinal 1',
    team1Id: sf1Team1?.id || rawSf1.team1Id,
    team2Id: sf1Team2?.id || rawSf1.team2Id,
    team1: sf1Team1,
    team2: sf1Team2,
    team1Placeholder: sf1Team1 ? `Juara 1 (${sf1Team1.name})` : 'Juara 1 Klasemen',
    team2Placeholder: sf1Team2 ? `Juara 3 (${sf1Team2.name})` : 'Juara 3 Klasemen'
  };

  const sf2 = {
    ...rawSf2,
    id: 'sf-2',
    stage: 'Semifinal 2',
    team1Id: sf2Team1?.id || rawSf2.team1Id,
    team2Id: sf2Team2?.id || rawSf2.team2Id,
    team1: sf2Team1,
    team2: sf2Team2,
    team1Placeholder: sf2Team1 ? `Juara 2 (${sf2Team1.name})` : 'Juara 2 Klasemen',
    team2Placeholder: sf2Team2 ? `Juara 4 (${sf2Team2.name})` : 'Juara 4 Klasemen'
  };

  // SF Winners
  const sf1WinnerId = sf1.winnerId || (sf1.team1Score !== null && sf1.team2Score !== null ? (sf1.team1Score > sf1.team2Score ? sf1.team1Id : sf1.team2Id) : null);
  const sf2WinnerId = sf2.winnerId || (sf2.team1Score !== null && sf2.team2Score !== null ? (sf2.team1Score > sf2.team2Score ? sf2.team1Id : sf2.team2Id) : null);

  const sf1WinnerTeam = sf1WinnerId ? teamsMap[sf1WinnerId] : null;
  const sf2WinnerTeam = sf2WinnerId ? teamsMap[sf2WinnerId] : null;

  // Final Match
  const finalMatch = {
    ...rawFinal,
    id: 'final',
    stage: 'Grand Final FBB Badminton 2026',
    team1Id: sf1WinnerId || rawFinal.team1Id,
    team2Id: sf2WinnerId || rawFinal.team2Id,
    team1: sf1WinnerTeam || (rawFinal.team1Id ? teamsMap[rawFinal.team1Id] : null),
    team2: sf2WinnerTeam || (rawFinal.team2Id ? teamsMap[rawFinal.team2Id] : null),
    team1Placeholder: sf1WinnerTeam ? sf1WinnerTeam.name : (sf1.team1 && sf1.team2 ? `Pemenang SF 1 (${sf1.team1.shortName || 'J1'} / ${sf1.team2.shortName || 'J3'})` : 'Pemenang Semifinal 1 (Juara 1 vs 3)'),
    team2Placeholder: sf2WinnerTeam ? sf2WinnerTeam.name : (sf2.team1 && sf2.team2 ? `Pemenang SF 2 (${sf2.team1.shortName || 'J2'} / ${sf2.team2.shortName || 'J4'})` : 'Pemenang Semifinal 2 (Juara 2 vs 4)')
  };

  const finalWinnerId = finalMatch.winnerId || (finalMatch.team1Score !== null && finalMatch.team2Score !== null ? (finalMatch.team1Score > finalMatch.team2Score ? finalMatch.team1Id : finalMatch.team2Id) : null);
  const winnerFinal = finalWinnerId ? teamsMap[finalWinnerId] : null;

  const triggerCelebrate = () => {
    try {
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.5 }
      });
    } catch (e) { }
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
          <button onClick={triggerCelebrate} className="btn btn-primary shadow-lg animate-bounce">
            <Sparkles size={18} />
            <span>Selebrasi Juara!</span>
          </button>
        )}
      </div>

      {/* Real-time Matchup Format Notification Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3.5 mb-6 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
            ⚡
          </div>
          <div className="text-xs text-gray-800 leading-snug">
            <span className="font-bold text-orange-950">Skema Bagan Real-Time: </span>
            <span>Semifinal 1 mempertemukan <b>Juara 1 vs Juara 3</b> dan Semifinal 2 mempertemukan <b>Juara 2 vs Juara 4</b> klasemen resmi.</span>
          </div>
        </div>
        <span className="badge badge-primary text-3xs font-mono font-bold shrink-0 hidden sm:inline-flex">
          LIVE STANDINGS
        </span>
      </div>

      {/* Champion Podium Box if Final Completed */}
      {winnerFinal && (
        <div className="champion-banner-card glass-card animate-float mb-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Crown size={48} className="text-amber-500" />
            <div className="text-center">
              <span className="badge badge-gold mb-1">🏆 SANG JUARA RESMI FBB CUP 2026</span>
              <h2 className="text-3xl font-black text-gray-900 flex items-center justify-center gap-3">
                <span>{winnerFinal.logo || '🏸'}</span>
                <span>{winnerFinal.name}</span>
              </h2>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Selamat kepada sang juara turnamen bergengsi FBB Badminton Cup 2026!
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
          <h3 className="bracket-col-title flex items-center gap-2">
            <Flame size={16} className="text-primary" />
            BABAK SEMIFINAL (TOP 4)
          </h3>

          <div className="bracket-matches-stack">
            {/* SF 1: Juara 1 vs Juara 3 */}
            <div className="bracket-match-card glass-card">
              <div className="bracket-match-header">
                <span className="badge badge-primary text-xs font-bold">
                  Juara 1 vs Juara 3 Klasemen
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock size={11} /> {sf1.time || '08:00 WIB'}
                </span>
              </div>

              <div className="bracket-teams-box">
                {/* Team 1 (Juara 1) */}
                <div className={`bracket-team-row ${sf1WinnerId === sf1.team1Id && sf1.team1Id ? 'winner-row' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">{sf1.team1?.logo || '🏸'}</span>
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-sm text-gray-900 block truncate">
                        {sf1.team1?.name || sf1.team1Placeholder}
                      </span>
                    </div>
                    {rank1 && sf1.team1?.id === rank1.id && (
                      <span className="badge-level badge-level-a text-3xs font-bold shrink-0">Rank 1</span>
                    )}
                  </div>
                  <span className="bracket-score-num text-gray-900 font-bold ml-2">
                    {sf1.team1Score !== null ? sf1.team1Score : '-'}
                  </span>
                </div>

                {/* Team 2 (Juara 3) */}
                <div className={`bracket-team-row ${sf1WinnerId === sf1.team2Id && sf1.team2Id ? 'winner-row' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">{sf1.team2?.logo || '🏸'}</span>
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-sm text-gray-900 block truncate">
                        {sf1.team2?.name || sf1.team2Placeholder}
                      </span>
                    </div>
                    {rank3 && sf1.team2?.id === rank3.id && (
                      <span className="badge-level badge-level-b text-3xs font-bold shrink-0">Rank 3</span>
                    )}
                  </div>
                  <span className="bracket-score-num text-gray-900 font-bold ml-2">
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

            {/* SF 2: Juara 2 vs Juara 4 */}
            <div className="bracket-match-card glass-card">
              <div className="bracket-match-header">
                <span className="badge badge-primary text-xs font-bold">
                  Juara 2 vs Juara 4 Klasemen
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock size={11} /> {sf2.time || '08.00 WIB'}
                </span>
              </div>

              <div className="bracket-teams-box">
                {/* Team 1 (Juara 2) */}
                <div className={`bracket-team-row ${sf2WinnerId === sf2.team1Id && sf2.team1Id ? 'winner-row' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">{sf2.team1?.logo || '🏸'}</span>
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-sm text-gray-900 block truncate">
                        {sf2.team1?.name || sf2.team1Placeholder}
                      </span>
                    </div>
                    {rank2 && sf2.team1?.id === rank2.id && (
                      <span className="badge-level badge-level-a text-3xs font-bold shrink-0">Rank 2</span>
                    )}
                  </div>
                  <span className="bracket-score-num text-gray-900 font-bold ml-2">
                    {sf2.team1Score !== null ? sf2.team1Score : '-'}
                  </span>
                </div>

                {/* Team 2 (Juara 4) */}
                <div className={`bracket-team-row ${sf2WinnerId === sf2.team2Id && sf2.team2Id ? 'winner-row' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">{sf2.team2?.logo || '🏸'}</span>
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-sm text-gray-900 block truncate">
                        {sf2.team2?.name || sf2.team2Placeholder}
                      </span>
                    </div>
                    {rank4 && sf2.team2?.id === rank4.id && (
                      <span className="badge-level badge-level-c text-3xs font-bold shrink-0">Rank 4</span>
                    )}
                  </div>
                  <span className="bracket-score-num text-gray-900 font-bold ml-2">
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

          <div className="bracket-match-card glass-card final-card-glow">
            <div className="bracket-match-header">
              <span className="badge badge-gold text-xs font-bold">Perebutan Juara 1</span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock size={11} /> {finalMatch.time || '10:00 WIB'}
              </span>
            </div>

            <div className="bracket-teams-box">
              {/* Final Team 1 */}
              <div className={`bracket-team-row ${finalWinnerId === finalMatch.team1Id && finalMatch.team1Id ? 'winner-row' : ''}`}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg shrink-0">{finalMatch.team1?.logo || '🏆'}</span>
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {finalMatch.team1?.name || finalMatch.team1Placeholder}
                  </span>
                </div>
                <span className="bracket-score-num text-amber-600 font-bold ml-2">
                  {finalMatch.team1Score !== null ? finalMatch.team1Score : '-'}
                </span>
              </div>

              {/* Final Team 2 */}
              <div className={`bracket-team-row ${finalWinnerId === finalMatch.team2Id && finalMatch.team2Id ? 'winner-row' : ''}`}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg shrink-0">{finalMatch.team2?.logo || '🏆'}</span>
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {finalMatch.team2?.name || finalMatch.team2Placeholder}
                  </span>
                </div>
                <span className="bracket-score-num text-amber-600 font-bold ml-2">
                  {finalMatch.team2Score !== null ? finalMatch.team2Score : '-'}
                </span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => onOpenKnockoutScoreModal(finalMatch)}
                className="btn btn-sm btn-primary w-full mt-3 shadow-md"
              >
                <Edit3 size={14} /> Update Skor Grand Final
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
