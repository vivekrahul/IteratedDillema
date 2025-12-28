import { useState, useEffect } from 'react';
import { Code, Swords, Trophy, Info, Plus } from 'lucide-react';
import { Strategy } from './types';
import { DEFAULT_STRATEGIES } from './constants';
import StrategyEditor from './components/StrategyEditor';
import MatchViewer from './components/MatchViewer';
import TournamentBoard from './components/TournamentBoard';

type View = 'editor' | 'match' | 'tournament';

function App() {
  // --- State ---
  const [strategies, setStrategies] = useState<Strategy[]>(() => {
    // Load from local storage or defaults
    const saved = localStorage.getItem('id_strategies');
    return saved ? JSON.parse(saved) : DEFAULT_STRATEGIES;
  });

  const [activeView, setActiveView] = useState<View>('match');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('id_strategies', JSON.stringify(strategies));
  }, [strategies]);

  // --- Handlers ---
  const handleSaveStrategy = (updatedStrategy: Strategy) => {
    setStrategies(prev => {
      const exists = prev.find(s => s.id === updatedStrategy.id);
      if (exists) {
        return prev.map(s => s.id === updatedStrategy.id ? updatedStrategy : s);
      }
      return [...prev, updatedStrategy];
    });
    setSelectedStrategyId(updatedStrategy.id);
  };

  const handleDeleteStrategy = (id: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      setStrategies(prev => prev.filter(s => s.id !== id));
      if (selectedStrategyId === id) setSelectedStrategyId(null);
    }
  };

  const createNewStrategy = () => {
    setSelectedStrategyId(null);
    setActiveView('editor');
  };

  // --- Render ---
  return (
    <div className="min-h-screen flex text-zinc-300 font-sans selection:bg-primary/30">
      
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 bg-black border-r border-zinc-800 flex flex-col flex-shrink-0 z-20">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-center lg:justify-start gap-3 h-16">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/40">
            ID
          </div>
          <span className="hidden lg:block font-bold text-white tracking-tight">Iterated<span className="text-zinc-500">Dilemma</span></span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
          
          <button 
            onClick={() => setActiveView('match')}
            className={`flex items-center gap-3 p-3 rounded-md transition-all group ${activeView === 'match' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'}`}
          >
            <Swords size={20} className={activeView === 'match' ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'} />
            <span className="hidden lg:block font-medium">Arena</span>
          </button>

          <button 
            onClick={() => setActiveView('tournament')}
            className={`flex items-center gap-3 p-3 rounded-md transition-all group ${activeView === 'tournament' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'}`}
          >
            <Trophy size={20} className={activeView === 'tournament' ? 'text-amber-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
            <span className="hidden lg:block font-medium">Tournament</span>
          </button>

          <div className="my-4 border-t border-zinc-800 mx-2"></div>
          
          <div className="px-3 pb-2 hidden lg:block text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Strategies
          </div>

          <div className="flex-1 overflow-y-auto px-1 custom-scrollbar space-y-1">
             <button 
               onClick={createNewStrategy}
               className={`w-full flex items-center gap-3 p-3 rounded-md transition-all group border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 ${activeView === 'editor' && !selectedStrategyId ? 'bg-zinc-800 border-solid border-zinc-600' : ''}`}
             >
                <Plus size={20} className="text-zinc-400 group-hover:text-white" />
                <span className="hidden lg:block text-sm font-medium text-zinc-400 group-hover:text-white">New Strategy</span>
             </button>

             {strategies.map(s => (
               <button
                 key={s.id}
                 onClick={() => { setSelectedStrategyId(s.id); setActiveView('editor'); }}
                 className={`w-full flex items-center gap-3 p-2 lg:px-3 lg:py-2 rounded-md transition-all group relative overflow-hidden ${activeView === 'editor' && selectedStrategyId === s.id ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900'}`}
               >
                 <div className="w-1 absolute left-0 top-1 bottom-1 rounded-r" style={{backgroundColor: s.color}}></div>
                 <Code size={16} className={`ml-2 flex-shrink-0 ${activeView === 'editor' && selectedStrategyId === s.id ? 'text-zinc-300' : 'text-zinc-600'}`} />
                 <span className="hidden lg:block text-sm truncate">{s.name}</span>
               </button>
             ))}
          </div>

        </nav>

        <div className="p-4 border-t border-zinc-800 text-center lg:text-left">
           <a href="https://en.wikipedia.org/wiki/Prisoner%27s_dilemma" target="_blank" rel="noreferrer" className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center justify-center lg:justify-start gap-2">
             <Info size={14} />
             <span className="hidden lg:inline">About Game Theory</span>
           </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#09090b] h-screen overflow-hidden flex flex-col">
        {/* Top Bar / Breadcrumb logic could go here */}
        
        <div className="flex-1 overflow-auto p-4 lg:p-8">
           <div className="max-w-6xl mx-auto h-full">
             
             {activeView === 'editor' && (
               <StrategyEditor 
                 strategy={strategies.find(s => s.id === selectedStrategyId)}
                 onSave={handleSaveStrategy}
                 onDelete={handleDeleteStrategy}
                 onCancel={() => setActiveView('match')}
               />
             )}

             {activeView === 'match' && (
               <MatchViewer strategies={strategies} />
             )}

             {activeView === 'tournament' && (
               <TournamentBoard strategies={strategies} />
             )}

           </div>
        </div>
      </main>

    </div>
  );
}

export default App;