'use client';

import { useState } from 'react';
import { Lock, CheckCircle2, PlayCircle, Star } from 'lucide-react';

export interface Level {
  id: number;
  title: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed';
  x: number; // percentage (0-100)
  expectedOutput?: string;
  task?: string;
}

export function LevelMap({ levels, onSelectLevel }: { levels: Level[], onSelectLevel: (level: Level) => void }) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // SVG Path generation for the connecting line
  const generatePath = () => {
    let d = '';
    levels.forEach((level, index) => {
      const y = index * 120 + 60;
      if (index === 0) {
        d += `M ${level.x}% ${y}`;
      } else {
        const prevY = (index - 1) * 120 + 60;
        // Cubic bezier curve for a smooth path
        d += ` C ${level.x}% ${prevY + 60}, ${level.x}% ${y - 60}, ${level.x}% ${y}`;
      }
    });
    return d;
  };

  return (
    <div className="relative w-full h-full overflow-y-auto bg-[#0a0a0c] p-10 flex flex-col items-center select-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #15151a 0%, #050505 100%)' }}>
      
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-yellow-500 font-mono text-xs font-bold">XP: 100</span>
      </div>

      <h2 className="text-2xl font-black font-mono tracking-widest text-zinc-200 mb-8 mt-4">CAMPAIGN_MODE</h2>

      <div className="relative w-full max-w-md" style={{ height: `${levels.length * 120}px` }}>
        
        {/* The Connection Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path 
            d={generatePath()} 
            fill="none" 
            stroke="#3f3f46" // zinc-700
            strokeWidth="4"
            strokeDasharray="8 8"
            className="animate-[dash_30s_linear_infinite]"
          />
        </svg>

        {/* The Level Nodes */}
        {levels.map((level, index) => {
          const isLocked = level.status === 'locked';
          const isCompleted = level.status === 'completed';
          const isUnlocked = level.status === 'unlocked';

          return (
            <div 
              key={level.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
              style={{ top: `${index * 120 + 60}px`, left: `${level.x}%` }}
              onMouseEnter={() => setHoveredNode(level.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => !isLocked && onSelectLevel(level)}
            >
              {/* Node Button */}
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-2xl ${
                isCompleted ? 'bg-emerald-500/20 border-emerald-500 hover:scale-110 shadow-emerald-500/50' : 
                isUnlocked ? 'bg-blue-500/20 border-blue-500 hover:scale-110 shadow-blue-500/50 animate-pulse' : 
                'bg-zinc-800/50 border-zinc-700 opacity-50'
              }`}>
                {isCompleted && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                {isUnlocked && <PlayCircle className="w-8 h-8 text-blue-400" />}
                {isLocked && <Lock className="w-6 h-6 text-zinc-500" />}
              </div>

              {/* Tooltip / Label */}
              <div className={`absolute left-20 whitespace-nowrap bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-lg transition-all duration-300 pointer-events-none ${
                hoveredNode === level.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                <div className="font-mono text-sm font-bold text-zinc-200">{`Lvl ${level.id}: ${level.title}`}</div>
                <div className="font-mono text-[10px] text-zinc-400 mt-1">{isLocked ? 'LOCKED' : level.description}</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
