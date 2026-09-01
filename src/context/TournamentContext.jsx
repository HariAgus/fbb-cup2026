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

  // ---------------- BADMINTON STANDINGS CALCULATION ----------------
  const calculateStandings = useMemo(() => {
    const teams = data.teams || [];
    const statsMap = {};

    teams.forEach((team) => {
      statsMap[team.id] = {
        teamId: team.id,
        team,
        mp: 0, // Matches Played
        w: 0,  // Match Won
        l: 0,  // Match Lost
        gw: 0, // Games/Sets Won
        gl: 0, // Games/Sets Lost
        gd: 0, // Games Difference
        pts: 0,// Points
        form: [] // Last matches ['W', 'L']
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

        if (s1 > s2) {
          t1.w += 1;
          t1.pts += 3;
          t1.form.push('W');
          t2.l += 1;
          t2.form.push('L');
        } else {
          t1.l += 1;
          t1.form.push('L');
          t2.w += 1;
          t2.pts += 3;
          t2.form.push('W');
        }
      }
    });

    Object.values(statsMap).forEach((st) => {
      st.gd = st.gw - st.gl;
    });

    // Sorting: Points (DESC) -> Games Diff (DESC) -> Games Won (DESC) -> Name (ASC)
    const sorted = Object.values(statsMap).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gw !== a.gw) return b.gw - a.gw;
      return a.team.name.localeCompare(b.team.name);
    });

    const playoffTopCount = data.tournamentInfo?.rules?.playoffTopCount || 4;

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      isPlayoffZone: index < playoffTopCount
    }));
  }, [data]);

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
          time: `${String(8 + (matchCount % 6) * 1.5).padStart(2, '0')}:30 WIB`,
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

  const updateMatchScore = (matchId, t1Score, t2Score, detailScores = '', status = 'finished', team1PlayerIds = null, team2PlayerIds = null) => {
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
            team2PlayerIds: team2PlayerIds !== null ? team2PlayerIds : m.team2PlayerIds
          };
        }
        return m;
      })
    }));
    showToast('Skor dan pemain pertandingan berhasil diperbarui!');
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

