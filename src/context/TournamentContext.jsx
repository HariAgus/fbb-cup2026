import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  loadTournamentData,
  saveTournamentData,
  loadCloudSettings,
  saveCloudSettings,
  syncWithGoogleSheets,
  syncWithFirebase,
  subscribeToTournamentData,
  initialTournamentData
} from '../services/storage';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
  logoutFirebase,
  subscribeToAuthState
} from '../services/firebaseAuth';

const TournamentContext = createContext(null);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournament must be used within TournamentProvider');
  return context;
};

export const TournamentProvider = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  const [data, setData] = useState(loadTournamentData);
  const [cloudSettings, setCloudSettings] = useState(loadCloudSettings);
  const [syncLoading, setSyncLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Pure Firebase Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to real Firebase Auth changes
  useEffect(() => {
    if (cloudSettings.firebase?.projectId && cloudSettings.firebase?.apiKey) {
      setAuthLoading(true);
      const unsubscribe = subscribeToAuthState(cloudSettings.firebase, (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } else {
      setCurrentUser(null);
      setAuthLoading(false);
    }
  }, [cloudSettings.firebase?.projectId, cloudSettings.firebase?.apiKey]);

  // Real-time synchronization with Firestore (Official Cloud Data)
  useEffect(() => {
    if (cloudSettings.firebase?.projectId && cloudSettings.firebase?.apiKey) {
      const unsubscribe = subscribeToTournamentData(
        cloudSettings.firebase,
        (remoteData) => {
          if (remoteData && remoteData.players && remoteData.players.length > 0) {
            setData(remoteData);
          }
        },
        (err) => {
          console.warn('Firestore live listener notice:', err);
        }
      );
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [
    cloudSettings.firebase?.projectId,
    cloudSettings.firebase?.apiKey,
    cloudSettings.firebase?.collectionName,
    cloudSettings.firebase?.documentId
  ]);

  useEffect(() => {
    saveTournamentData(data);
  }, [data]);

  useEffect(() => {
    saveCloudSettings(cloudSettings);
  }, [cloudSettings]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  // Pure Firebase Auth Action Methods
  const loginAdmin = async (email, password) => {
    try {
      setAuthLoading(true);
      const user = await loginWithEmail(cloudSettings.firebase, email, password);
      setCurrentUser(user);
      showToast(`Selamat datang kembali, ${user.displayName || user.email}!`);
      return { success: true, user };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const registerAdmin = async (email, password, displayName) => {
    try {
      setAuthLoading(true);
      const user = await registerWithEmail(cloudSettings.firebase, email, password, displayName);
      setCurrentUser(user);
      showToast(`Akun panitia berhasil didaftarkan! Selamat datang, ${displayName || user.email}`);
      return { success: true, user };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const loginAdminWithGoogle = async () => {
    try {
      setAuthLoading(true);
      const user = await loginWithGoogle(cloudSettings.firebase);
      setCurrentUser(user);
      showToast(`Login Google berhasil! Selamat datang, ${user.displayName || user.email}`);
      return { success: true, user };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await logoutFirebase(cloudSettings.firebase);
    } catch (err) {
      console.warn('Firebase logout skipped:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('fbb_admin_session');
    showToast('Anda telah keluar dari Portal Admin.');
    return true;
  };

  const resetAdminPassword = async (email) => {
    try {
      await resetPassword(cloudSettings.firebase, email);
      showToast('Link reset kata sandi telah dikirim ke email Anda. Silakan periksa inbox/spam.', 'info');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // ---------------- BADMINTON DETAIL SCORES PARSER ----------------
  const parseDetailScores = (detailScores) => {
    if (!detailScores || typeof detailScores !== 'string') {
      return { t1Total: 0, t2Total: 0, sets: [] };
    }

    let t1Total = 0;
    let t2Total = 0;
    const sets = [];

    const setMatches = detailScores.match(/\b(\d+)\s*[-:]\s*(\d+)\b/g);
    if (setMatches) {
      setMatches.forEach((setStr) => {
        const parts = setStr.split(/[-:]/);
        if (parts.length === 2) {
          const s1 = parseInt(parts[0].trim(), 10) || 0;
          const s2 = parseInt(parts[1].trim(), 10) || 0;
          t1Total += s1;
          t2Total += s2;
          sets.push({ t1: s1, t2: s2 });
        }
      });
    }

    return { t1Total, t2Total, sets };
  };

  // ---------------- BADMINTON STANDINGS CALCULATION ----------------
  const calculateStandings = useMemo(() => {
    const teams = data.teams || [];
    const statsMap = {};

    teams.forEach((team) => {
      statsMap[team.id] = {
        teamId: team.id,
        team,
        mp: 0,       // Matches Played
        w: 0,        // Match Won
        d: 0,        // Drawn (if any)
        l: 0,        // Match Lost
        gw: 0,       // Games/Sets Won
        gl: 0,       // Games/Sets Lost
        gd: 0,       // Games Difference
        pointWon: 0, // Total Skor Poin yang Didapat (Points For)
        pointLost: 0,// Total Skor Poin Kebobolan (Points Against)
        pd: 0,       // Selisih Poin (Point Difference)
        gf: 0,       // Compatibility alias for pointWon
        ga: 0,       // Compatibility alias for pointLost
        pts: 0,      // Main Points (3 pts per win)
        form: []     // Last matches ['W', 'L']
      };
    });

    const finishedMatches = (data.matches || []).filter(
      (m) => m.status === 'finished' && m.team1Score !== null && m.team2Score !== null
    );

    finishedMatches.forEach((m) => {
      const t1 = statsMap[m.team1Id];
      const t2 = statsMap[m.team2Id];

      if (t1 && t2) {
        const s1 = Number(m.team1Score);
        const s2 = Number(m.team2Score);

        t1.mp += 1;
        t2.mp += 1;
        t1.gw += s1;
        t1.gl += s2;
        t2.gw += s2;
        t2.gl += s1;

        // Calculate points: prioritize manual total points if set, otherwise parse detailScores
        let pts1 = 0;
        let pts2 = 0;

        if (m.team1TotalPoints !== undefined && m.team1TotalPoints !== null && m.team1TotalPoints !== '') {
          pts1 = Number(m.team1TotalPoints) || 0;
          pts2 = Number(m.team2TotalPoints) || 0;
        } else {
          const { t1Total, t2Total } = parseDetailScores(m.detailScores);
          pts1 = t1Total;
          pts2 = t2Total;
        }

        t1.pointWon += pts1;
        t1.pointLost += pts2;
        t2.pointWon += pts2;
        t2.pointLost += pts1;

        if (s1 > s2) {
          t1.w += 1;
          t1.pts += 3;
          t1.form.push('W');
          t2.l += 1;
          t2.form.push('L');
        } else if (s2 > s1) {
          t1.l += 1;
          t1.form.push('L');
          t2.w += 1;
          t2.pts += 3;
          t2.form.push('W');
        } else {
          t1.d += 1;
          t1.pts += 1;
          t1.form.push('D');
          t2.d += 1;
          t2.pts += 1;
          t2.form.push('D');
        }
      }
    });

    Object.values(statsMap).forEach((st) => {
      st.gd = st.gw - st.gl;
      st.pd = st.pointWon - st.pointLost;
      st.gf = st.pointWon;
      st.ga = st.pointLost;
    });

    // Ranking hierarchy:
    // 1. Points (pts) DESC
    // 2. Games Difference (gd) DESC
    // 3. Games Won (gw) DESC
    // 4. Point Difference / Selisih Poin (pd) DESC
    // 5. Total Skor yang Didapat / Points Scored (pointWon) DESC
    // 6. Name (ASC)
    const sorted = Object.values(statsMap).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gw !== a.gw) return b.gw - a.gw;
      if (b.pd !== a.pd) return b.pd - a.pd;
      if (b.pointWon !== a.pointWon) return b.pointWon - a.pointWon;
      return a.team.name.localeCompare(b.team.name);
    });

    const playoffTopCount = data.tournamentInfo?.rules?.playoffTopCount || 4;

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      isPlayoffZone: index < playoffTopCount
    }));
  }, [data]);

  const standings = calculateStandings;

  // Real-time Playoff Bracket Synchronization from Live Standings (Rank 1 vs 3, Rank 2 vs 4)
  useEffect(() => {
    setData((prev) => {
      const currentKms = prev.knockoutMatches || [];
      const rank1 = standings[0]?.team;
      const rank2 = standings[1]?.team;
      const rank3 = standings[2]?.team;
      const rank4 = standings[3]?.team;

      const r1Id = rank1 ? rank1.id : null;
      const r2Id = rank2 ? rank2.id : null;
      const r3Id = rank3 ? rank3.id : null;
      const r4Id = rank4 ? rank4.id : null;

      let changed = false;
      const updatedKms = currentKms.map((m) => {
        if (m.id === 'sf-1') {
          const expectedTitle = 'Juara 1 vs Juara 3 Klasemen';
          const p1 = rank1 ? `Juara 1 (${rank1.name})` : 'Juara 1 Klasemen';
          const p2 = rank3 ? `Juara 3 (${rank3.name})` : 'Juara 3 Klasemen';
          if (
            m.team1Id !== r1Id ||
            m.team2Id !== r3Id ||
            m.matchTitle !== expectedTitle ||
            m.team1Placeholder !== p1 ||
            m.team2Placeholder !== p2
          ) {
            changed = true;
            return {
              ...m,
              stage: 'Semifinal 1',
              matchTitle: expectedTitle,
              team1Placeholder: p1,
              team2Placeholder: p2,
              team1Id: r1Id,
              team2Id: r3Id
            };
          }
        }
        if (m.id === 'sf-2') {
          const expectedTitle = 'Juara 2 vs Juara 4 Klasemen';
          const p1 = rank2 ? `Juara 2 (${rank2.name})` : 'Juara 2 Klasemen';
          const p2 = rank4 ? `Juara 4 (${rank4.name})` : 'Juara 4 Klasemen';
          if (
            m.team1Id !== r2Id ||
            m.team2Id !== r4Id ||
            m.matchTitle !== expectedTitle ||
            m.team1Placeholder !== p1 ||
            m.team2Placeholder !== p2
          ) {
            changed = true;
            return {
              ...m,
              stage: 'Semifinal 2',
              matchTitle: expectedTitle,
              team1Placeholder: p1,
              team2Placeholder: p2,
              team1Id: r2Id,
              team2Id: r4Id
            };
          }
        }
        if (m.id === 'final') {
          const expectedTitle = 'Pemenang Semifinal 1 vs Pemenang Semifinal 2';
          if (m.matchTitle !== expectedTitle) {
            changed = true;
            return {
              ...m,
              stage: 'Grand Final FBB Badminton 2026',
              matchTitle: expectedTitle,
              team1Placeholder: 'Pemenang Semifinal 1 (Juara 1 vs 3)',
              team2Placeholder: 'Pemenang Semifinal 2 (Juara 2 vs 4)'
            };
          }
        }
        return m;
      });

      if (changed) {
        return {
          ...prev,
          knockoutMatches: updatedKms
        };
      }
      return prev;
    });
  }, [standings]);

  // ---------------- MASTER PLAYER ACTIONS & GRADING ----------------
  const addPlayer = (player) => {
    const newPlayer = {
      id: `p-${Date.now()}`,
      name: player.name || 'Nama Pemain',
      gender: player.gender || 'L',
      level: player.level || 'B',
      phone: player.phone || '',
      teamId: player.teamId || null
    };

    setData((prev) => {
      const updatedPlayers = [...(prev.players || []), newPlayer];
      let updatedTeams = prev.teams;
      if (newPlayer.teamId) {
        updatedTeams = prev.teams.map((t) => {
          if (t.id === newPlayer.teamId && !t.playerIds?.includes(newPlayer.id)) {
            return { ...t, playerIds: [...(t.playerIds || []), newPlayer.id] };
          }
          return t;
        });
      }
      return {
        ...prev,
        players: updatedPlayers,
        teams: updatedTeams
      };
    });

    showToast(`Pemain ${newPlayer.name} (Level ${newPlayer.level}) berhasil didaftarkan!`);
    return newPlayer;
  };

  const updatePlayer = (updatedPlayer) => {
    setData((prev) => {
      const updatedPlayers = prev.players.map((p) =>
        p.id === updatedPlayer.id
          ? { ...p, ...updatedPlayer, level: updatedPlayer.level || p.level || 'B' }
          : p
      );
      const updatedTeams = prev.teams.map((t) => {
        let playerIds = t.playerIds || [];
        if (t.id === updatedPlayer.teamId) {
          if (!playerIds.includes(updatedPlayer.id)) {
            playerIds = [...playerIds, updatedPlayer.id];
          }
        } else {
          playerIds = playerIds.filter((id) => id !== updatedPlayer.id);
        }
        return { ...t, playerIds };
      });
      return {
        ...prev,
        players: updatedPlayers,
        teams: updatedTeams
      };
    });
    showToast(`Data pemain ${updatedPlayer.name} diperbarui!`);
  };

  const updatePlayerLevel = (playerId, level) => {
    setData((prev) => ({
      ...prev,
      players: (prev.players || []).map((p) => (p.id === playerId ? { ...p, level } : p))
    }));
    showToast(`Level pemain berhasil diubah ke Level ${level}!`);
  };

  const batchUpdatePlayerLevels = (levelUpdates) => {
    setData((prev) => ({
      ...prev,
      players: (prev.players || []).map((p) =>
        levelUpdates[p.id] ? { ...p, level: levelUpdates[p.id] } : p
      )
    }));
    showToast('Grading beberapa pemain berhasil disimpan!');
  };

  const deletePlayer = (playerId) => {
    const player = data.players.find((p) => p.id === playerId);
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
      teams: prev.teams.map((t) => ({
        ...t,
        playerIds: (t.playerIds || []).filter((id) => id !== playerId)
      })),
      matches: prev.matches.map((m) => ({
        ...m,
        team1PlayerIds: (m.team1PlayerIds || []).filter((id) => id !== playerId),
        team2PlayerIds: (m.team2PlayerIds || []).filter((id) => id !== playerId)
      }))
    }));
    showToast(`Pemain ${player ? player.name : ''} telah dihapus.`, 'warning');
  };

  // ---------------- BALANCED POT DRAW ENGINE (PENGUNDIAN SEIMBANG LEVEL A, B, C) ----------------
  const drawBalancedTeams = ({
    numberOfTeams = 6,
    teamTemplates = null,
    playerIdsToDraw = null
  }) => {
    const allPlayers = [...(data.players || [])];
    const targetPlayers = playerIdsToDraw
      ? allPlayers.filter((p) => playerIdsToDraw.includes(p.id))
      : allPlayers;

    if (targetPlayers.length < numberOfTeams) {
      showToast(`Jumlah pemain (${targetPlayers.length}) kurang dari jumlah tim (${numberOfTeams})!`, 'error');
      return null;
    }

    // Fisher-Yates array shuffler
    const shuffleArray = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Separate players into pots by level
    const potA = shuffleArray(targetPlayers.filter((p) => (p.level || 'B') === 'A'));
    const potB = shuffleArray(targetPlayers.filter((p) => (p.level || 'B') === 'B'));
    const potC = shuffleArray(targetPlayers.filter((p) => (p.level || 'B') === 'C'));
    const otherPot = shuffleArray(targetPlayers.filter((p) => !['A', 'B', 'C'].includes(p.level)));

    const defaultPresets = [
      { name: 'PB Garuda FBB', shortName: 'GDA', color: '#E06020', logo: '🏸' },
      { name: 'PB Thunder Smash', shortName: 'THW', color: '#3B82F6', logo: '⚡' },
      { name: 'PB Phoenix Shuttle', shortName: 'PHX', color: '#EF4444', logo: '🔥' },
      { name: 'PB Sparta Netters', shortName: 'SPT', color: '#10B981', logo: '🛡️' },
      { name: 'PB Rajawali Smash', shortName: 'RJW', color: '#8B5CF6', logo: '🦅' },
      { name: 'PB Bintang Jaya', shortName: 'BTJ', color: '#EC4899', logo: '⭐' },
      { name: 'PB Elang Perkasa', shortName: 'ELG', color: '#F59E0B', logo: '🦁' },
      { name: 'PB Dragon Force', shortName: 'DGN', color: '#06B6D4', logo: '🐉' },
      { name: 'PB Cendrawasih', shortName: 'CDW', color: '#14B8A6', logo: '🪶' },
      { name: 'PB Harimau Sakti', shortName: 'HMU', color: '#F97316', logo: '🐯' },
      { name: 'PB Nusantara Net', shortName: 'NST', color: '#6366F1', logo: '🏆' },
      { name: 'PB Jaya Raya Muda', shortName: 'JRM', color: '#84CC16', logo: '🥇' }
    ];

    const resultTeams = [];
    for (let i = 0; i < numberOfTeams; i++) {
      const existingTeam = data.teams?.[i];
      const preset = teamTemplates?.[i] || existingTeam || defaultPresets[i] || {
        name: `PB Tim ${i + 1}`,
        shortName: `T${i + 1}`,
        color: '#E06020',
        logo: '🏸'
      };

      resultTeams.push({
        id: existingTeam?.id || `team-${i + 1}`,
        name: preset.name || `PB Tim ${i + 1}`,
        shortName: preset.shortName || `T${i + 1}`,
        captain: existingTeam?.captain || '-',
        phone: existingTeam?.phone || '',
        color: preset.color || '#E06020',
        logo: preset.logo || '🏸',
        playerIds: []
      });
    }

    // Step 1: Distribute Pot A round-robin
    potA.forEach((player, idx) => {
      const teamIdx = idx % numberOfTeams;
      resultTeams[teamIdx].playerIds.push(player.id);
    });

    // Step 2: Distribute Pot B round-robin
    potB.forEach((player, idx) => {
      const teamIdx = idx % numberOfTeams;
      resultTeams[teamIdx].playerIds.push(player.id);
    });

    // Step 3: Distribute Pot C round-robin
    potC.forEach((player, idx) => {
      const teamIdx = idx % numberOfTeams;
      resultTeams[teamIdx].playerIds.push(player.id);
    });

    // Step 4: Distribute other players if any
    otherPot.forEach((player, idx) => {
      const teamIdx = idx % numberOfTeams;
      resultTeams[teamIdx].playerIds.push(player.id);
    });

    // Assign captain as the top Level A player (or first player) if not set
    resultTeams.forEach((t) => {
      if (t.playerIds.length > 0) {
        const firstPlayer = allPlayers.find((p) => p.id === t.playerIds[0]);
        if (firstPlayer) {
          t.captain = firstPlayer.name;
        }
      }
    });

    return {
      teams: resultTeams,
      potA,
      potB,
      potC,
      totalPlayersDrawn: targetPlayers.length
    };
  };

  const applyDrawResult = (drawnTeams, autoGenerateMatches = false) => {
    setData((prev) => {
      const teamPlayerMapping = {};
      drawnTeams.forEach((team) => {
        team.playerIds.forEach((pId) => {
          teamPlayerMapping[pId] = team.id;
        });
      });

      const updatedPlayers = (prev.players || []).map((p) => {
        if (teamPlayerMapping[p.id]) {
          return { ...p, teamId: teamPlayerMapping[p.id] };
        }
        return p;
      });

      return {
        ...prev,
        teams: drawnTeams,
        players: updatedPlayers
      };
    });

    if (autoGenerateMatches) {
      setTimeout(() => {
        generateAllMatches();
      }, 100);
    }

    showToast(`Hasil pengocokan pembagian ${drawnTeams.length} tim berhasil diterapkan!`, 'success');
  };

  // ---------------- TEAM ACTIONS ----------------
  const addTeam = (team) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: team.name || 'PB Garuda',
      shortName: team.shortName || team.name?.substring(0, 3).toUpperCase() || 'TIM',
      captain: team.captain || '-',
      phone: team.phone || '',
      color: team.color || '#E06020',
      logo: team.logo || '🏸',
      playerIds: team.playerIds || []
    };

    setData((prev) => {
      const updatedPlayers = (prev.players || []).map((p) => {
        if (newTeam.playerIds.includes(p.id)) {
          return { ...p, teamId: newTeam.id };
        }
        return p;
      });

      return {
        ...prev,
        teams: [...(prev.teams || []), newTeam],
        players: updatedPlayers
      };
    });

    showToast(`Tim ${newTeam.name} berhasil dibuat!`);
    return newTeam;
  };

  const updateTeam = (updatedTeam) => {
    setData((prev) => {
      const updatedPlayers = (prev.players || []).map((p) => {
        if (updatedTeam.playerIds?.includes(p.id)) {
          return { ...p, teamId: updatedTeam.id };
        } else if (p.teamId === updatedTeam.id) {
          return { ...p, teamId: null };
        }
        return p;
      });

      return {
        ...prev,
        teams: prev.teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)),
        players: updatedPlayers
      };
    });
    showToast(`Tim ${updatedTeam.name} berhasil diperbarui!`);
  };

  const deleteTeam = (teamId) => {
    const team = data.teams.find((t) => t.id === teamId);
    setData((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== teamId),
      players: (prev.players || []).map((p) => (p.teamId === teamId ? { ...p, teamId: null } : p)),
      matches: prev.matches.filter((m) => m.team1Id !== teamId && m.team2Id !== teamId)
    }));
    showToast(`Tim ${team ? team.name : ''} telah dihapus.`, 'warning');
  };

  const assignPlayerToTeam = (playerId, teamId) => {
    setData((prev) => {
      const updatedPlayers = (prev.players || []).map((p) => (p.id === playerId ? { ...p, teamId } : p));
      const updatedTeams = (prev.teams || []).map((t) => {
        if (t.id === teamId) {
          return { ...t, playerIds: [...new Set([...(t.playerIds || []), playerId])] };
        } else {
          return { ...t, playerIds: (t.playerIds || []).filter((id) => id !== playerId) };
        }
      });
      return { ...prev, players: updatedPlayers, teams: updatedTeams };
    });
    showToast('Pemain berhasil dimasukkan ke tim!');
  };

  const removePlayerFromTeam = (playerId, teamId) => {
    setData((prev) => {
      const updatedPlayers = (prev.players || []).map((p) => (p.id === playerId ? { ...p, teamId: null } : p));
      const updatedTeams = (prev.teams || []).map((t) => {
        if (t.id === teamId) {
          return { ...t, playerIds: (t.playerIds || []).filter((id) => id !== playerId) };
        }
        return t;
      });
      return { ...prev, players: updatedPlayers, teams: updatedTeams };
    });
    showToast('Pemain dikeluarkan dari tim.');
  };

  // ---------------- MATCH ACTIONS ----------------
  const generateAllMatches = () => {
    const teams = data.teams || [];
    if (teams.length < 2) {
      showToast('Minimal harus ada 2 tim untuk membuat jadwal turnamen badminton!', 'error');
      return;
    }

    const newMatches = [];
    let matchCount = 1;

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const matchday = Math.ceil(matchCount / Math.floor(teams.length / 2 || 1));
        const t1 = teams[i];
        const t2 = teams[j];

        newMatches.push({
          id: `match-badminton-${matchCount}`,
          stage: 'league',
          round: `Matchday ${matchday}`,
          team1Id: t1.id,
          team2Id: t2.id,
          team1PlayerIds: t1.playerIds?.[0] ? [t1.playerIds[0]] : [],
          team2PlayerIds: t2.playerIds?.[0] ? [t2.playerIds[0]] : [],
          team1Score: null,
          team2Score: null,
          detailScores: '',
          status: 'scheduled',
          date: `2026-09-${15 + (matchday - 1)}`,
          time: '',
          pitch: `Court ${(matchCount % 3) + 1} Badminton`
        });
        matchCount++;
      }
    }

    setData((prev) => ({
      ...prev,
      matches: newMatches
    }));
    showToast(`Berhasil membuat ${newMatches.length} jadwal pertandingan turnamen badminton!`);
  };

  const updateMatchScore = (
    matchId,
    t1Score,
    t2Score,
    detailScores = '',
    status = 'finished',
    team1PlayerIds = null,
    team2PlayerIds = null,
    pitch = null,
    time = null,
    date = null,
    team1TotalPoints = null,
    team2TotalPoints = null
  ) => {
    setData((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            team1Score: t1Score === '' || t1Score === null ? null : Number(t1Score),
            team2Score: t2Score === '' || t2Score === null ? null : Number(t2Score),
            detailScores: detailScores !== undefined ? detailScores : m.detailScores,
            status: status || m.status,
            team1PlayerIds: team1PlayerIds !== null ? team1PlayerIds : m.team1PlayerIds,
            team2PlayerIds: team2PlayerIds !== null ? team2PlayerIds : m.team2PlayerIds,
            pitch: pitch !== null ? pitch : m.pitch,
            time: time !== null ? time : (m.time || ''),
            date: date !== null ? date : m.date,
            team1TotalPoints: team1TotalPoints !== null && team1TotalPoints !== '' ? Number(team1TotalPoints) : (team1TotalPoints === '' ? null : m.team1TotalPoints),
            team2TotalPoints: team2TotalPoints !== null && team2TotalPoints !== '' ? Number(team2TotalPoints) : (team2TotalPoints === '' ? null : m.team2TotalPoints)
          };
        }
        return m;
      })
    }));
    showToast('Data pertandingan dan skor berhasil diperbarui!');
  };

  const addCustomMatch = (matchObj) => {
    const newMatch = {
      ...matchObj,
      id: `match-custom-${Date.now()}`
    };
    setData((prev) => ({
      ...prev,
      matches: [...(prev.matches || []), newMatch]
    }));
    showToast('Jadwal pertandingan badminton baru ditambahkan!');
  };

  const deleteMatch = (matchId) => {
    setData((prev) => ({
      ...prev,
      matches: prev.matches.filter((m) => m.id !== matchId)
    }));
    showToast('Pertandingan dihapus.', 'warning');
  };

  // ---------------- KNOCKOUT ACTIONS ----------------
  const updateKnockoutScore = (matchId, t1Score, t2Score, detailScores = '', winnerTeamId = null, team1PlayerIds = null, team2PlayerIds = null) => {
    setData((prev) => {
      const updatedKnockouts = prev.knockoutMatches.map((m) => {
        if (m.id === matchId) {
          const s1 = t1Score !== null && t1Score !== '' ? Number(t1Score) : null;
          const s2 = t2Score !== null && t2Score !== '' ? Number(t2Score) : null;
          let calculatedWinner = winnerTeamId;
          if (!calculatedWinner && s1 !== null && s2 !== null) {
            if (s1 > s2) calculatedWinner = m.team1Id;
            else if (s2 > s1) calculatedWinner = m.team2Id;
          }
          return {
            ...m,
            team1Score: s1,
            team2Score: s2,
            detailScores: detailScores !== undefined ? detailScores : m.detailScores,
            team1PlayerIds: team1PlayerIds !== null ? team1PlayerIds : m.team1PlayerIds,
            team2PlayerIds: team2PlayerIds !== null ? team2PlayerIds : m.team2PlayerIds,
            winnerId: calculatedWinner,
            status: s1 !== null && s2 !== null ? 'finished' : 'scheduled'
          };
        }
        return m;
      });

      const sf1 = updatedKnockouts.find((k) => k.id === 'sf-1');
      const sf2 = updatedKnockouts.find((k) => k.id === 'sf-2');
      const finalMatch = updatedKnockouts.find((k) => k.id === 'final');

      if (finalMatch) {
        if (sf1?.winnerId) finalMatch.team1Id = sf1.winnerId;
        if (sf2?.winnerId) finalMatch.team2Id = sf2.winnerId;
      }

      return {
        ...prev,
        knockoutMatches: updatedKnockouts
      };
    });
    showToast('Skor babak playoff badminton diperbarui!');
  };

  // ---------------- CLOUD & STORAGE SYNC ----------------
  const syncToGoogleSheets = async () => {
    if (!cloudSettings.googleSheets?.webAppUrl) {
      showToast('Silakan masukkan Google Apps Script Web App URL di Pengaturan Cloud', 'error');
      return false;
    }
    try {
      setSyncLoading(true);
      await syncWithGoogleSheets(cloudSettings.googleSheets.webAppUrl, data);
      setCloudSettings((prev) => ({
        ...prev,
        googleSheets: { ...prev.googleSheets, lastSync: new Date().toLocaleTimeString() }
      }));
      showToast('Data turnamen badminton berhasil disimpan ke Google Sheets!');
      return true;
    } catch (err) {
      showToast(`Gagal sync Google Sheets: ${err.message}`, 'error');
      return false;
    } finally {
      setSyncLoading(false);
    }
  };

  const loadFromGoogleSheets = async () => {
    if (!cloudSettings.googleSheets?.webAppUrl) {
      showToast('Silakan masukkan Google Apps Script Web App URL di Pengaturan Cloud', 'error');
      return false;
    }
    try {
      setSyncLoading(true);
      const fetchedData = await syncWithGoogleSheets(cloudSettings.googleSheets.webAppUrl);
      if (fetchedData && fetchedData.teams) {
        setData(fetchedData);
        showToast('Data turnamen badminton berhasil diambil dari Google Sheets!');
        return true;
      } else {
        showToast('Data di Google Sheets masih kosong atau tidak valid', 'warning');
        return false;
      }
    } catch (err) {
      showToast(`Gagal load dari Google Sheets: ${err.message}`, 'error');
      return false;
    } finally {
      setSyncLoading(false);
    }
  };

  const syncToFirebase = async () => {
    try {
      setSyncLoading(true);
      await syncWithFirebase(cloudSettings.firebase, data);
      setCloudSettings((prev) => ({
        ...prev,
        firebase: { ...prev.firebase, lastSync: new Date().toLocaleTimeString() }
      }));
      showToast('Data turnamen badminton berhasil disimpan ke Firebase Firestore!');
      return true;
    } catch (err) {
      showToast(`Gagal sync Firebase: ${err.message}`, 'error');
      return false;
    } finally {
      setSyncLoading(false);
    }
  };

  const loadFromFirebase = async () => {
    try {
      setSyncLoading(true);
      const fetchedData = await syncWithFirebase(cloudSettings.firebase);
      if (fetchedData && fetchedData.teams) {
        setData(fetchedData);
        showToast('Data turnamen badminton berhasil diambil dari Firebase Firestore!');
        return true;
      }
    } catch (err) {
      showToast(`Gagal load dari Firebase: ${err.message}`, 'error');
      return false;
    } finally {
      setSyncLoading(false);
    }
  };

  const resetToSampleData = () => {
    setData(initialTournamentData);
    showToast('Data telah direset ke data contoh FBB Badminton 2026', 'info');
  };

  const exportDataJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fbb_badminton_2026_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data turnamen badminton berhasil didownload (JSON)');
  };

  const importDataJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.teams && parsed.players) {
        setData(parsed);
        showToast('Data turnamen badminton berhasil diimport!');
        return true;
      } else {
        throw new Error('Format JSON tidak sesuai');
      }
    } catch (err) {
      showToast(`Gagal import JSON: ${err.message}`, 'error');
      return false;
    }
  };

  // ---------------- DOORPRIZE DRAW & HISTORY ACTIONS ----------------
  const addDoorprizeDraw = ({ prizeName, quantity = 1, winners = [], notes = '' }) => {
    if (!prizeName || winners.length === 0) {
      showToast('Nama hadiah atau pemenang tidak boleh kosong', 'error');
      return null;
    }

    const newDraw = {
      id: `dp-${Date.now()}`,
      prizeName: prizeName.trim(),
      quantity: Number(quantity) || winners.length,
      drawnAt: new Date().toISOString(),
      notes: notes ? notes.trim() : '',
      winners: winners.map((w) => ({
        playerId: w.playerId || w.id,
        playerName: w.playerName || w.name,
        playerLevel: w.playerLevel || w.level || 'B',
        teamName: w.teamName || '',
        phone: w.phone || ''
      }))
    };

    setData((prev) => ({
      ...prev,
      doorprizes: [newDraw, ...(prev.doorprizes || [])]
    }));

    showToast(`🎉 Undian doorprize "${prizeName}" berhasil disimpan & dipublikasikan!`, 'success');
    return newDraw;
  };

  const deleteDoorprizeDraw = (drawId) => {
    setData((prev) => ({
      ...prev,
      doorprizes: (prev.doorprizes || []).filter((dp) => dp.id !== drawId)
    }));
    showToast('Catatan undian doorprize telah dihapus.', 'info');
  };

  const resetDoorprizeHistory = () => {
    setData((prev) => ({
      ...prev,
      doorprizes: []
    }));
    showToast('Seluruh riwayat undian doorprize telah direset.', 'info');
  };

  const value = {
    data,
    setData,
    isAdmin,
    cloudSettings,
    setCloudSettings,
    syncLoading,
    notification,
    showToast,
    standings: calculateStandings,
    parseDetailScores,
    // Player methods & Grading
    addPlayer,
    updatePlayer,
    updatePlayerLevel,
    batchUpdatePlayerLevels,
    deletePlayer,
    // Pot Draw & Team methods
    drawBalancedTeams,
    applyDrawResult,
    addTeam,
    updateTeam,
    deleteTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    // Match methods
    generateAllMatches,
    updateMatchScore,
    addCustomMatch,
    deleteMatch,
    // Knockout methods
    updateKnockoutScore,
    // Doorprize methods
    addDoorprizeDraw,
    deleteDoorprizeDraw,
    resetDoorprizeHistory,
    // Authentication methods & state (Pure Firebase Auth)
    currentUser,
    authLoading,
    isAuthenticated: !!currentUser,
    loginAdmin,
    registerAdmin,
    loginAdminWithGoogle,
    logoutAdmin,
    resetAdminPassword,
    // Cloud sync methods
    syncToGoogleSheets,
    loadFromGoogleSheets,
    syncToFirebase,
    loadFromFirebase,
    resetToSampleData,
    exportDataJSON,
    importDataJSON
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

