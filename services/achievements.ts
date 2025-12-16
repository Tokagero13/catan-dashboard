import { Achievement, GameSession } from '../types';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'novice',
    title: 'Поселенец',
    description: 'Сыграйте свою первую игру.',
    icon: '🛖',
  },
  {
    id: 'first_win',
    title: 'Первая Победа',
    description: 'Выиграйте 1 игру.',
    icon: '🏆',
  },
  {
    id: 'veteran',
    title: 'Ветеран',
    description: 'Сыграйте 5 игр.',
    icon: '⚔️',
  },
  {
    id: 'master',
    title: 'Владыка Катана',
    description: 'Выиграйте 5 игр.',
    icon: '👑',
  },
  {
    id: 'unstoppable',
    title: 'Неудержимый',
    description: 'Серия из 3 побед подряд (в этом месяце).',
    icon: '🔥',
  },
  {
    id: 'party',
    title: 'Душа Компании',
    description: 'Сыграйте в партии на 5+ человек.',
    icon: '🥳',
  },
  {
    id: 'duelist',
    title: 'Дуэлянт',
    description: 'Сыграйте партию 1 на 1 (2 игрока).',
    icon: '🤺',
  },
  {
    id: 'strategist',
    title: 'Стратег',
    description: 'Иметь винрейт выше 50% (минимум 3 игры).',
    icon: '🧠',
  },
  {
    id: 'loyal',
    title: 'Старожил',
    description: 'Сыграйте 10 игр.',
    icon: '👴',
  }
];

export const getPlayerAchievements = (playerName: string, sessions: GameSession[]): string[] => {
  const earned: string[] = [];
  
  // Filter sessions where player participated
  const playerSessions = sessions.filter(s => s.players_list.includes(playerName));
  // Filter sessions where player won
  const wins = playerSessions.filter(s => s.winner === playerName);

  if (playerSessions.length >= 1) earned.push('novice');
  if (wins.length >= 1) earned.push('first_win');
  if (playerSessions.length >= 5) earned.push('veteran');
  if (wins.length >= 5) earned.push('master');
  if (playerSessions.some(s => s.num_players >= 5)) earned.push('party');
  if (playerSessions.some(s => s.num_players === 2)) earned.push('duelist');
  if (playerSessions.length >= 10) earned.push('loyal');

  if (playerSessions.length >= 3) {
    const winRate = wins.length / playerSessions.length;
    if (winRate >= 0.5) earned.push('strategist');
  }

  // Calculate Streak for Achievement
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const sortedSessions = [...sessions].sort((a, b) => {
    const timeA = parseInt(a.id) || 0;
    const timeB = parseInt(b.id) || 0;
    return timeA - timeB;
  });

  let currentStreak = 0;
  let maxStreak = 0;

  sortedSessions.forEach(session => {
    // Check Date
    const sessionTime = parseInt(session.id) || 0;
    if (sessionTime < thirtyDaysAgo) return;

    if (session.players_list.includes(playerName)) {
        if (session.winner === playerName) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
            currentStreak = 0;
        }
    }
  });

  if (maxStreak >= 3) earned.push('unstoppable');

  return earned;
};