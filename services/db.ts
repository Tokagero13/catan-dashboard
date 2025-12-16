import { GameSession, PlayerGroup, PlayerStats } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3002';

class ApiDatabaseService {
  // --- Sessions ---
  async getAllSessions(): Promise<GameSession[]> {
    const res = await fetch(`${API}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return await res.json();
  }

  async addSession(session: GameSession): Promise<void> {
    const res = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to add session');
  }

  async deleteSession(id: string): Promise<void> {
    const res = await fetch(`${API}/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete session');
  }

  // --- Leaderboard (client-side calculation) ---
  async getLeaderboard(): Promise<PlayerStats[]> {
    const sessions = await this.getAllSessions();
    const statsMap: Record<string, { wins: number; total: number; maxStreak: number }> = {};
    sessions.forEach((session) => {
      const winner = session.winner.trim();
      if (!statsMap[winner]) statsMap[winner] = { wins: 0, total: 0, maxStreak: 0 };
      statsMap[winner].wins += 1;
      session.players_list.forEach((p: string) => {
        const player = p.trim();
        if (!player) return;
        if (!statsMap[player]) statsMap[player] = { wins: 0, total: 0, maxStreak: 0 };
        statsMap[player].total += 1;
      });
    });
    // Calculate Streaks
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const sortedSessions = [...sessions].sort((a, b) => {
      const timeA = parseInt(a.id) || 0;
      const timeB = parseInt(b.id) || 0;
      return timeA - timeB;
    });
    Object.keys(statsMap).forEach(player => {
      let currentStreak = 0;
      let maxStreak = 0;
      sortedSessions.forEach(session => {
        const sessionTime = parseInt(session.id) || 0;
        if (sessionTime < thirtyDaysAgo) return;
        if (session.players_list.includes(player)) {
          if (session.winner === player) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
            currentStreak = 0;
          }
        }
      });
      statsMap[player].maxStreak = maxStreak;
    });
    const leaderboard: PlayerStats[] = Object.entries(statsMap).map(([name, stat]) => ({
      name,
      wins: stat.wins,
      totalGames: stat.total,
      winRate: stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0,
      maxStreak: stat.maxStreak
    }));
    return leaderboard.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });
  }

  // --- Groups ---
  async getAllGroups(): Promise<PlayerGroup[]> {
    const res = await fetch(`${API}/groups`);
    if (!res.ok) throw new Error('Failed to fetch groups');
    return await res.json();
  }

  async saveGroup(group: PlayerGroup): Promise<void> {
    const res = await fetch(`${API}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
    if (!res.ok) throw new Error('Failed to save group');
  }

  async deleteGroup(id: string): Promise<void> {
    const res = await fetch(`${API}/groups/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete group');
  }
}

export const db = new ApiDatabaseService();