import { PayoffMatrix, Strategy } from './types';

// Standard Prisoner's Dilemma Payoffs
// T = 5 (Temptation), R = 3 (Reward), P = 1 (Punishment), S = 0 (Sucker)
export const PAYOFF_MATRIX: PayoffMatrix = {
  CC: [3, 3],
  CD: [0, 5],
  DC: [5, 0],
  DD: [1, 1],
};

export const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: 'tit-for-tat',
    name: 'Tit for Tat',
    color: '#3b82f6',
    isBuiltIn: true,
    code: `// Cooperate on the first move, then copy the opponent's last move.
if (context.round === 0) {
  return 'C';
}
return context.opponentHistory[context.round - 1];`
  },
  {
    id: 'always-defect',
    name: 'Always Defect',
    color: '#ef4444',
    isBuiltIn: true,
    code: `// Always behave selfishly.
return 'D';`
  },
  {
    id: 'always-cooperate',
    name: 'Always Cooperate',
    color: '#10b981',
    isBuiltIn: true,
    code: `// Always be nice.
return 'C';`
  },
  {
    id: 'grudger',
    name: 'Grudger',
    color: '#f59e0b',
    isBuiltIn: true,
    code: `// Cooperate until the opponent defects once, then defect forever.
if (context.opponentHistory.includes('D')) {
  return 'D';
}
return 'C';`
  },
  {
    id: 'random',
    name: 'Random',
    color: '#8b5cf6',
    isBuiltIn: true,
    code: `// Flip a coin.
return Math.random() > 0.5 ? 'C' : 'D';`
  }
];

export const BOILERPLATE_CODE = `// Available Context:
// context.round (number): Current round index (0-based)
// context.myHistory (Array<'C'|'D'>): Your previous moves
// context.opponentHistory (Array<'C'|'D'>): Opponent's previous moves
// context.payoffHistory (Array<number>): Your previous scores

// Rule: You must return 'C' or 'D'.
// Any error or timeout results in 'D'.

if (context.round === 0) {
  return 'C';
}

// Example: Copy opponent
return context.opponentHistory[context.round - 1];
`;
