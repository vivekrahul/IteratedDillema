export type Move = 'C' | 'D';

export interface PayoffMatrix {
  CC: [number, number]; // [Score A, Score B]
  CD: [number, number];
  DC: [number, number];
  DD: [number, number];
}

export interface Strategy {
  id: string;
  name: string;
  code: string; // The function body
  color: string;
  isBuiltIn?: boolean;
}

export interface MatchContext {
  round: number;
  totalRounds?: number; // Optional for backward compatibility, but engine will provide it
  myHistory: Move[];
  opponentHistory: Move[];
  payoffHistory: number[]; // My payoffs
}

export interface RoundResult {
  round: number;
  moveA: Move;
  moveB: Move;
  scoreA: number;
  scoreB: number;
}

export interface MatchResult {
  strategyAId: string;
  strategyBId: string;
  rounds: RoundResult[];
  totalScoreA: number;
  totalScoreB: number;
  metrics: {
    cooperationRateA: number;
    cooperationRateB: number;
  };
}

export interface TournamentEntry {
  strategyId: string;
  matchesPlayed: number;
  totalScore: number;
  avgScorePerRound: number;
  cooperationRate: number;
  wins: number; // Raw win count (score > opponent)
}

export interface TournamentResult {
  timestamp: number;
  entries: TournamentEntry[];
  matches: MatchResult[];
}
