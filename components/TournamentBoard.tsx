import React, { useState } from 'react';
import { Strategy, TournamentResult } from '../types';
import { runTournament } from '../services/engine';
import { Trophy, PlayCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TournamentBoardProps {
  strategies: Strategy[];
}

const TournamentBoard: React.FC<TournamentBoardProps> = ({ strategies }) => {
  const [rounds, setRounds] = useState(20);
  const [result, setResult] = useState<TournamentResult | null>(null);

  const handleRun = () => {
    if (strategies.length < 2) return;
    const res = runTournament(strategies, rounds);
    setResult(res);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Config */}
      <div className="bg-surface p-6 rounded-lg border border-zinc-800 shadow-md">
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-xl font-bold text-white mb-1">Round Robin Tournament</h2>
             <p className="text-zinc-400 text-sm">Every strategy plays against every other strategy (and itself).</p>
           </div>
           <div className="flex items-end gap-4">
              <div className="w-24">
                <label className="block text-xs font-mono text-zinc-500 mb-1 uppercase">Rounds/Match</label>
                <input 
                  type="number" 
                  value={rounds} 
                  onChange={e => setRounds(Number(e.target.value))}
                  min={1} 
                  max={200}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-center"
                />
              </div>
              <button 
                onClick={handleRun}
                disabled={strategies.length < 2}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                <Trophy size={18} />
                Start Tournament
              </button>
           </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="flex-1 overflow-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leaderboard Table */}
            <div className="lg:col-span-2 bg-surface rounded-lg border border-zinc-800 overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead className="bg-zinc-900 text-zinc-500 font-mono uppercase text-xs">
                   <tr>
                     <th className="p-4">Rank</th>
                     <th className="p-4">Strategy</th>
                     <th className="p-4 text-right">Total Score</th>
                     <th className="p-4 text-right">Avg / Round</th>
                     <th className="p-4 text-right">Wins</th>
                     <th className="p-4 text-right">Coop %</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {result.entries.map((entry, idx) => {
                     const strategy = strategies.find(s => s.id === entry.strategyId);
                     return (
                       <tr key={entry.strategyId} className="hover:bg-zinc-800/50 transition-colors">
                         <td className="p-4 font-mono text-zinc-500">#{idx + 1}</td>
                         <td className="p-4 font-bold text-white flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: strategy?.color || '#fff'}}></div>
                           {strategy?.name || entry.strategyId}
                         </td>
                         <td className="p-4 text-right font-mono text-primary">{entry.totalScore.toLocaleString()}</td>
                         <td className="p-4 text-right text-zinc-300">{entry.avgScorePerRound.toFixed(2)}</td>
                         <td className="p-4 text-right text-zinc-300">{entry.wins}</td>
                         <td className="p-4 text-right text-zinc-300">{(entry.cooperationRate * 100).toFixed(0)}%</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
            </div>

            {/* Viz */}
            <div className="lg:col-span-1 flex flex-col gap-6">
               <div className="bg-surface p-4 rounded-lg border border-zinc-800 h-64 flex flex-col">
                 <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4">Score Distribution</h3>
                 <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.entries} layout="vertical" margin={{left: 40}}>
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="strategyId" 
                          tickFormatter={(id) => strategies.find(s => s.id === id)?.name || id.substring(0,4)}
                          stroke="#71717a"
                          tick={{fontSize: 10}}
                          width={60}
                        />
                        <Tooltip 
                           cursor={{fill: '#27272a'}}
                           contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff'}}
                        />
                        <Bar dataKey="totalScore" radius={[0, 4, 4, 0]}>
                          {result.entries.map((entry, index) => {
                             const color = strategies.find(s => s.id === entry.strategyId)?.color || '#fff';
                             return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>

        </div>
      )}
      
      {!result && (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-lg">
           <BarChart2 size={48} className="mb-4 opacity-50" />
           <p>Configure and run a tournament to see rankings.</p>
        </div>
      )}
    </div>
  );
};

export default TournamentBoard;
