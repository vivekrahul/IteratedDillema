import { Strategy, MatchResult, RoundResult, Move, TournamentResult, TournamentEntry } from '../types';
import { PAYOFF_MATRIX } from '../constants';
import { executeStrategy } from './sandbox';

/**
 * Runs a single match between two strategies.
 */
export const runMatch = (
  strategyA: Strategy,
  strategyB: Strategy,
  rounds: number
): MatchResult => {
  const history: RoundResult[] = [];
  const movesA: Move[] = [];
  const movesB: Move[] = [];
  const payoffsA: number[] = [];
  const payoffsB: number[] = [];
  
  let totalScoreA = 0;
  let totalScoreB = 0;

  for (let r = 0; r < rounds; r++) {
    // Prepare Context
    const contextA = {
      round: r,
      totalRounds: rounds,
      myHistory: [...movesA],
      opponentHistory: [...movesB],
      payoffHistory: [...payoffsA]
    };

    const contextB = {
      round: r,
      totalRounds: rounds,
      myHistory: [...movesB],
      opponentHistory: [...movesA], // Note the swap
      payoffHistory: [...payoffsB]
    };

    // Execute Strategies
    const moveA = executeStrategy(strategyA.code, contextA);
    const moveB = executeStrategy(strategyB.code, contextB);

    // Calculate Payoff
    let scoreA = 0;
    let scoreB = 0;

    if (moveA === 'C' && moveB === 'C') {
      [scoreA, scoreB] = PAYOFF_MATRIX.CC;
    } else if (moveA === 'C' && moveB === 'D') {
      [scoreA, scoreB] = PAYOFF_MATRIX.CD;
    } else if (moveA === 'D' && moveB === 'C') {
      [scoreA, scoreB] = PAYOFF_MATRIX.DC;
    } else {
      [scoreA, scoreB] = PAYOFF_MATRIX.DD;
    }

    // Update State
    movesA.push(moveA);
    movesB.push(moveB);
    payoffsA.push(scoreA);
    payoffsB.push(scoreB);
    totalScoreA += scoreA;
    totalScoreB += scoreB;

    history.push({
      round: r,
      moveA,
      moveB,
      scoreA,
      scoreB
    });
  }

  // Calculate Metrics
  const coopA = movesA.filter(m => m === 'C').length;
  const coopB = movesB.filter(m => m === 'C').length;

  return {
    strategyAId: strategyA.id,
    strategyBId: strategyB.id,
    rounds: history,
    totalScoreA,
    totalScoreB,
    metrics: {
      cooperationRateA: coopA / rounds,
      cooperationRateB: coopB / rounds
    }
  };
};

/**
 * Runs a Round Robin tournament.
 */
export const runTournament = (
  strategies: Strategy[],
  roundsPerMatch: number
): TournamentResult => {
  const entries: Record<string, TournamentEntry> = {};
  const matches: MatchResult[] = [];

  // Initialize entries
  strategies.forEach(s => {
    entries[s.id] = {
      strategyId: s.id,
      matchesPlayed: 0,
      totalScore: 0,
      avgScorePerRound: 0,
      cooperationRate: 0,
      wins: 0
    };
  });

  // Round Robin Loop
  for (let i = 0; i < strategies.length; i++) {
    for (let j = i; j < strategies.length; j++) {
       const stratA = strategies[i];
       const stratB = strategies[j];

       const match = runMatch(stratA, stratB, roundsPerMatch);
       matches.push(match);

       // Update stats for A
       entries[stratA.id].matchesPlayed++;
       entries[stratA.id].totalScore += match.totalScoreA;
       if (match.totalScoreA > match.totalScoreB) entries[stratA.id].wins++;

       // Update stats for B (if not self-play)
       if (stratA.id !== stratB.id) {
         entries[stratB.id].matchesPlayed++;
         entries[stratB.id].totalScore += match.totalScoreB;
         if (match.totalScoreB > match.totalScoreA) entries[stratB.id].wins++;
       }
    }
  }

  // Finalize averages
  const finalEntries = Object.values(entries).map(entry => {
    const totalRounds = entry.matchesPlayed * roundsPerMatch;
    return {
      ...entry,
      avgScorePerRound: totalRounds > 0 ? entry.totalScore / totalRounds : 0,
      cooperationRate: calculateGlobalCoopRate(entry.strategyId, matches)
    };
  }).sort((a, b) => b.totalScore - a.totalScore); 

  return {
    timestamp: Date.now(),
    entries: finalEntries,
    matches
  };
};

function calculateGlobalCoopRate(strategyId: string, matches: MatchResult[]): number {
  let totalMoves = 0;
  let totalCoops = 0;

  for (const m of matches) {
    if (m.strategyAId === strategyId) {
       totalMoves += m.rounds.length;
       totalCoops += m.metrics.cooperationRateA * m.rounds.length;
    }
    if (m.strategyBId === strategyId) {
      totalMoves += m.rounds.length;
      totalCoops += m.metrics.cooperationRateB * m.rounds.length;
    }
  }
  
  return totalMoves === 0 ? 0 : totalCoops / totalMoves;
}
