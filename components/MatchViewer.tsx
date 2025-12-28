import React, { useState, useEffect, useMemo } from 'react';
import { Strategy, MatchResult } from '../types';
import { runMatch } from '../services/engine';
import { Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MatchViewerProps {
  strategies: Strategy[];
}

const MatchViewer: React.FC<MatchViewerProps> = ({ strategies }) => {
  const [strategyAId, setStrategyAId] = useState<string>(strategies[0]?.id || '');
  const [strategyBId, setStrategyBId] = useState<string>(strategies[1]?.id || strategies[0]?.id || '');
  const [rounds, setRounds] = useState(50);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    // Reset selection if strategies change/delete
    if (strategies.length > 0 && !strategies.find(s => s.id === strategyAId)) {
        setStrategyAId(strategies[0].id);
    }
    if (strategies.length > 0 && !strategies.find(s => s.id === strategyBId)) {
        setStrategyBId(strategies[strategies.length > 1 ? 1 : 0].id);
    }
  }, [strategies, strategyAId, strategyBId]);

  const handleRun = () => {
    const sA = strategies.find(s => s.id === strategyAId);
    const sB = strategies.find(s => s.id === strategyBId);
    if (sA && sB) {
      const result = runMatch(sA, sB, rounds);
      setMatchResult(result);
    }
  };

  const stratA = strategies.find(s => s.id === strategyAId);
  const stratB = strategies.find(s => s.id === strategyBId);

  // Cumulative Score Data for Chart
  const chartData = useMemo(() => {
    if (!matchResult) return [];
    let cumA = 0;
    let cumB = 0;
    return matchResult.rounds.map(r => {
      cumA += r.scoreA;
      cumB += r.scoreB;
      return {
        round: r.round + 1,
        [stratA?.name || 'A']: cumA,
        [stratB?.name || 'B']: cumB,
      };
    });
  }, [matchResult, stratA, stratB]);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Controls */}
      <div className="bg-surface p-6 rounded-lg border border-zinc-800 shadow-md">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-mono text-zinc-500 mb-1 uppercase">Player 1</label>
            <select 
              value={strategyAId} 
              onChange={e => setStrategyAId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white"
            >
              {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="flex items-center justify-center px-2 pb-2 text-zinc-500 font-bold">VS</div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-mono text-zinc-500 mb-1 uppercase">Player 2</label>
            <select 
              value={strategyBId} 
              onChange={e => setStrategyBId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white"
            >
               {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="w-24">
             <label className="block text-xs font-mono text-zinc-500 mb-1 uppercase">Rounds</label>
             <input 
               type="number" 
               value={rounds} 
               onChange={e => setRounds(Number(e.target.value))}
               min={1} 
               max={1000}
               className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-center"
             />
          </div>

          <button 
            onClick={handleRun}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <Play size={18} />
            Run Match
          </button>
        </div>
      </div>

      {matchResult && stratA && stratB && (
        <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-surface p-4 rounded-lg border-l-4" style={{borderLeftColor: stratA.color}}>
                <div className="text-zinc-500 text-sm font-mono uppercase mb-1">{stratA.name}</div>
                <div className="text-4xl font-bold text-white">{matchResult.totalScoreA}</div>
                <div className="text-zinc-400 text-xs mt-2">
                  Avg: {(matchResult.totalScoreA / rounds).toFixed(2)} pts/round
                </div>
                <div className="text-zinc-400 text-xs">
                  Coop: {(matchResult.metrics.cooperationRateA * 100).toFixed(0)}%
                </div>
             </div>
             <div className="bg-surface p-4 rounded-lg border-l-4" style={{borderLeftColor: stratB.color}}>
                <div className="text-zinc-500 text-sm font-mono uppercase mb-1">{stratB.name}</div>
                <div className="text-4xl font-bold text-white">{matchResult.totalScoreB}</div>
                 <div className="text-zinc-400 text-xs mt-2">
                  Avg: {(matchResult.totalScoreB / rounds).toFixed(2)} pts/round
                </div>
                <div className="text-zinc-400 text-xs">
                  Coop: {(matchResult.metrics.cooperationRateB * 100).toFixed(0)}%
                </div>
             </div>
          </div>

          {/* Chart */}
          <div className="bg-surface p-4 rounded-lg border border-zinc-800 h-64">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stratA.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={stratA.color} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stratB.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={stratB.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="round" stroke="#52525b" tick={{fontSize: 12}} />
                  <YAxis stroke="#52525b" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff'}}
                    itemStyle={{fontSize: 14}}
                  />
                  <Area type="monotone" dataKey={stratA.name} stroke={stratA.color} fillOpacity={1} fill="url(#colorA)" strokeWidth={2} />
                  <Area type="monotone" dataKey={stratB.name} stroke={stratB.color} fillOpacity={1} fill="url(#colorB)" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          {/* Timeline / Transcript */}
          <div className="bg-surface p-4 rounded-lg border border-zinc-800 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-mono text-zinc-500 uppercase mb-3">Match Transcript</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-sm">
                  <div className="contents text-zinc-500 font-mono text-xs border-b border-zinc-800 pb-2 mb-2">
                    <div className="py-1">Rnd</div>
                    <div className="py-1 text-center" style={{color: stratA.color}}>{stratA.name}</div>
                    <div className="py-1 text-center" style={{color: stratB.color}}>{stratB.name}</div>
                    <div className="py-1 text-right">Pts</div>
                  </div>
                  {matchResult.rounds.map((r) => (
                    <div key={r.round} className="contents hover:bg-zinc-800/50">
                      <div className="font-mono text-zinc-600 py-1">{r.round + 1}</div>
                      <div className="flex justify-center py-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.moveA === 'C' ? 'bg-cooperate/20 text-cooperate' : 'bg-defect/20 text-defect'}`}>
                          {r.moveA}
                        </span>
                      </div>
                      <div className="flex justify-center py-1">
                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.moveB === 'C' ? 'bg-cooperate/20 text-cooperate' : 'bg-defect/20 text-defect'}`}>
                          {r.moveB}
                        </span>
                      </div>
                      <div className="font-mono text-zinc-400 text-right py-1">
                        {r.scoreA} - {r.scoreB}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MatchViewer;