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
  // --- Basic ---
  {
    id: 'tit-for-tat',
    name: 'Tit for Tat',
    color: '#3b82f6',
    isBuiltIn: true,
    code: `// Cooperate on the first move, then copy the opponent's last move.
if (context.round === 0) return 'C';
return context.opponentHistory[context.round - 1];`
  },
  {
    id: 'always-cooperate',
    name: 'Always Cooperate',
    color: '#10b981',
    isBuiltIn: true,
    code: `return 'C';`
  },
  {
    id: 'always-defect',
    name: 'Always Defect',
    color: '#ef4444',
    isBuiltIn: true,
    code: `return 'D';`
  },
  {
    id: 'random',
    name: 'Random',
    color: '#8b5cf6',
    isBuiltIn: true,
    code: `return Math.random() > 0.5 ? 'C' : 'D';`
  },

  // --- Cooperative & Nice ---
  {
    id: 'generous-tft',
    name: 'Generous Tit-for-Tat',
    color: '#34d399',
    isBuiltIn: true,
    code: `// TFT but 10% chance to forgive a defection
if (context.round === 0) return 'C';
if (context.opponentHistory[context.round - 1] === 'C') return 'C';
return Math.random() < 0.1 ? 'C' : 'D';`
  },
  {
    id: 'tit-for-two-tats',
    name: 'Tit for Two Tats',
    color: '#6ee7b7',
    isBuiltIn: true,
    code: `// Defect only if opponent defects twice in a row
if (context.round < 2) return 'C';
const last1 = context.opponentHistory[context.round - 1];
const last2 = context.opponentHistory[context.round - 2];
if (last1 === 'D' && last2 === 'D') return 'D';
return 'C';`
  },
  {
    id: 'optimistic-starter',
    name: 'Optimistic Starter',
    color: '#a7f3d0',
    isBuiltIn: true,
    code: `// Cooperate for first 5 rounds, then TFT
if (context.round < 5) return 'C';
return context.opponentHistory[context.round - 1];`
  },
  {
    id: 'trust-builder',
    name: 'Trust Builder',
    color: '#059669',
    isBuiltIn: true,
    code: `// Always cooperate first 3 rounds.
// If long streak of mutual cooperation, force C (attempt to forgive).
if (context.round < 3) return 'C';
// Simple implementation: acts as TFT otherwise
return context.opponentHistory[context.round - 1];`
  },

  // --- Aggressive & Exploitative ---
  {
    id: 'grim-trigger',
    name: 'Grim Trigger',
    color: '#b91c1c',
    isBuiltIn: true,
    code: `// Cooperate until opponent defects once, then defect forever.
if (context.opponentHistory.includes('D')) return 'D';
return 'C';`
  },
  {
    id: 'bully',
    name: 'Bully',
    color: '#f87171',
    isBuiltIn: true,
    code: `// Defect until opponent cooperates twice in a row, then cooperate.
if (context.round < 2) return 'D';
const last1 = context.opponentHistory[context.round - 1];
const last2 = context.opponentHistory[context.round - 2];
if (last1 === 'C' && last2 === 'C') return 'C';
return 'D';`
  },
  {
    id: 'opportunist',
    name: 'Opportunist',
    color: '#991b1b',
    isBuiltIn: true,
    code: `// Defect if opponent cooperates > 80% of the time.
if (context.round < 5) return 'C';
const oppCs = context.opponentHistory.filter(m => m === 'C').length;
if ((oppCs / context.round) > 0.8) return 'D';
return context.opponentHistory[context.round - 1];`
  },
  {
    id: 'endgame-defector',
    name: 'Endgame Defector',
    color: '#7f1d1d',
    isBuiltIn: true,
    code: `// Cooperate early, defect in the final 5 rounds.
if (context.totalRounds && context.round >= context.totalRounds - 5) return 'D';
if (context.round === 0) return 'C';
return context.opponentHistory[context.round - 1];`
  },

  // --- Reactive ---
  {
    id: 'suspicious-tft',
    name: 'Suspicious TFT',
    color: '#f59e0b',
    isBuiltIn: true,
    code: `// Start with Defect, then TFT
if (context.round === 0) return 'D';
return context.opponentHistory[context.round - 1];`
  },
  {
    id: 'reverse-tft',
    name: 'Reverse TFT',
    color: '#d97706',
    isBuiltIn: true,
    code: `// Do the opposite of opponent's last move
if (context.round === 0) return 'C';
return context.opponentHistory[context.round - 1] === 'C' ? 'D' : 'C';`
  },
  {
    id: 'echo-delay',
    name: 'Echo with Delay',
    color: '#b45309',
    isBuiltIn: true,
    code: `// Copy move from 2 rounds ago
if (context.round < 2) return 'C';
return context.opponentHistory[context.round - 2];`
  },
  {
    id: 'pavlov',
    name: 'Pavlov (Win-Stay Lose-Shift)',
    color: '#ec4899',
    isBuiltIn: true,
    code: `// If last payoff >= 3 (R or T), repeat move. Else switch.
if (context.round === 0) return 'C';
const lastPayoff = context.payoffHistory[context.round - 1];
const myLast = context.myHistory[context.round - 1];
if (lastPayoff >= 3) return myLast;
return myLast === 'C' ? 'D' : 'C';`
  },

  // --- Learning & Noise Resilient ---
  {
    id: 'majority-rule',
    name: 'Majority Rule',
    color: '#6366f1',
    isBuiltIn: true,
    code: `// Cooperate if opponent cooperated more than defected in last 10 rounds
if (context.round === 0) return 'C';
const window = context.opponentHistory.slice(-10);
const cCount = window.filter(m => m === 'C').length;
return cCount >= window.length / 2 ? 'C' : 'D';`
  },
  {
    id: 'stochastic-tft',
    name: 'Stochastic TFT',
    color: '#818cf8',
    isBuiltIn: true,
    code: `// TFT with 10% noise
if (context.round === 0) return 'C';
if (Math.random() < 0.1) return Math.random() > 0.5 ? 'C' : 'D';
return context.opponentHistory[context.round - 1];`
  },
  {
    id: 'mirror-matcher',
    name: 'Mirror Matcher',
    color: '#a855f7',
    isBuiltIn: true,
    code: `// Cooperate with probability equal to opponent's cooperation rate
if (context.round === 0) return 'C';
const oppCs = context.opponentHistory.filter(m => m === 'C').length;
const rate = oppCs / context.round;
return Math.random() < rate ? 'C' : 'D';`
  }
];

export const BOILERPLATE_CODE = `// Available Context:
// context.round (number): Current round index (0-based)
// context.totalRounds (number): Total rounds in match
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
