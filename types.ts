export enum ResourceType {
  GRAIN = 'GRAIN',
  FOREST = 'FOREST',
  HILLS = 'HILLS',
  MOUNTAINS = 'MOUNTAINS',
  PASTURE = 'PASTURE',
  DESERT = 'DESERT',
  SEA = 'SEA'
}

export enum PortType {
  GENERIC = 'GENERIC', // 3:1
  GRAIN = 'GRAIN',
  FOREST = 'FOREST',
  HILLS = 'HILLS',
  MOUNTAINS = 'MOUNTAINS',
  PASTURE = 'PASTURE',
  NONE = 'NONE'
}

export interface HexData {
  id: string;
  q: number;
  r: number;
  resource: ResourceType;
  number: number | null;
  port?: PortType;
  rotation?: number; // Degrees for port orientation
}

export interface ScoreBreakdown {
  settlements: number;
  cities: number;
  victoryCards: number;
  longestRoad: boolean;
  largestArmy: boolean;
  total: number;
}

export interface GameSession {
  id: string;
  session_name: string; // Group Name essentially
  created_date: string; // DateTime string
  num_players: number;
  players_list: string[];
  winner: string;
  notes?: string;
  groupId?: string;
  scoreBreakdown?: ScoreBreakdown;
  diceStats?: number[]; // Array of numbers that appeared most frequently
  winnerPhoto?: string; // Base64 string
}

export interface PlayerGroup {
  id: string;
  name: string;
  players: string[];
  lastUpdated: string;
}

export interface PlayerStats {
  name: string;
  wins: number;
  totalGames: number;
  winRate: number;
  maxStreak: number; // Max winning streak in last 30 days
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}