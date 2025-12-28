import React, { useState, useEffect } from 'react';
import { Strategy } from '../types';
import { BOILERPLATE_CODE } from '../constants';
import { Save, Play, RefreshCw, Trash2 } from 'lucide-react';

interface StrategyEditorProps {
  strategy?: Strategy;
  onSave: (strategy: Strategy) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const StrategyEditor: React.FC<StrategyEditorProps> = ({ strategy, onSave, onDelete, onCancel }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState(BOILERPLATE_CODE);
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (strategy) {
      setName(strategy.name);
      setCode(strategy.code);
      setColor(strategy.color);
    } else {
      setName('');
      setCode(BOILERPLATE_CODE);
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  }, [strategy]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      id: strategy ? strategy.id : crypto.randomUUID(),
      name,
      code,
      color,
      isBuiltIn: strategy?.isBuiltIn || false
    });
  };

  return (
    <div className="h-full flex flex-col bg-surface rounded-lg border border-zinc-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
          <h2 className="text-lg font-bold text-white">
            {strategy ? 'Edit Strategy' : 'New Strategy'}
          </h2>
        </div>
        <div className="flex gap-2">
           {strategy && !strategy.isBuiltIn && (
            <button 
              onClick={() => onDelete(strategy.id)}
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
              title="Delete Strategy"
            >
              <Trash2 size={18} />
            </button>
          )}
           <button 
              onClick={onCancel}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
          >
            <Save size={16} />
            Save Strategy
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 flex gap-4 border-b border-zinc-800">
        <div className="flex-1">
          <label className="block text-xs font-mono text-zinc-500 mb-1 uppercase tracking-wider">Strategy Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-primary placeholder-zinc-600"
            placeholder="e.g., Grudger 2.0"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-1 uppercase tracking-wider">Color</label>
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-0 right-0 p-2 z-10">
          <button 
            onClick={() => setCode(BOILERPLATE_CODE)}
            className="p-1.5 bg-zinc-800 rounded text-zinc-400 hover:text-white text-xs border border-zinc-700"
            title="Reset to Template"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-[#0d0d0d] text-zinc-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
          placeholder="// Write your strategy code here..."
        />
        <div className="bg-zinc-900 text-xs text-zinc-500 p-2 border-t border-zinc-800 flex justify-between">
           <span>Language: JavaScript (Strict Sandbox)</span>
           <span>Return: 'C' (Cooperate) or 'D' (Defect)</span>
        </div>
      </div>
    </div>
  );
};

export default StrategyEditor;
