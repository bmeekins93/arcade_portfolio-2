import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { CHARACTERS } from './game/constants';
import { CharacterBase } from './game/types';

const App: React.FC = () => {
  const [p1, setP1] = useState<CharacterBase>(CHARACTERS[0]);
  const [p2, setP2] = useState<CharacterBase>(CHARACTERS[1]);

  useEffect(() => {
    const handleMatchStart = (e: any) => {
      if (e.detail) {
        setP1(e.detail.p1);
        setP2(e.detail.p2);
      }
    };

    window.addEventListener('match-started', handleMatchStart);
    return () => window.removeEventListener('match-started', handleMatchStart);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
      <header className="mb-6 text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500 italic uppercase drop-shadow-sm">
          OnlyCans
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-slate-400 tracking-wide">
          Super Market Bash
        </h2>
      </header>

      <main className="w-full flex flex-col items-center gap-6">
        <GameCanvas />

        <div className="w-full max-w-[1000px] bg-slate-900/50 p-6 rounded-lg border border-slate-800 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-mono">
            {/* Player 1 Controls */}
            <div className="space-y-3">
              <h3
                className="font-bold text-lg border-b pb-1 flex justify-between items-center"
                style={{ borderColor: '#' + p1.color.toString(16), color: '#' + p1.color.toString(16) }}
              >
                <span>PLAYER 1 ({p1.name})</span>
                <span className="text-xs opacity-60">WASD Layout</span>
              </h3>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex justify-between"><span className="text-slate-500">Move</span> <span>A / D</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Jump</span> <span>W</span></li>
                <li className="flex justify-between"><span className="text-slate-500">{p1.moveNames.jab}</span> <span>J</span></li>
                <li className="flex justify-between"><span className="text-slate-500">{p1.moveNames.special}</span> <span>L</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Block</span> <span>K</span></li>
              </ul>
            </div>

            {/* Player 2 Controls */}
            <div className="space-y-3">
              <h3
                className="font-bold text-lg border-b pb-1 flex justify-between items-center"
                style={{ borderColor: '#' + p2.color.toString(16), color: '#' + p2.color.toString(16) }}
              >
                <span>PLAYER 2 ({p2.name})</span>
                <span className="text-xs opacity-60">Arrows Layout</span>
              </h3>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex justify-between"><span className="text-slate-500">Move</span> <span>← / →</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Jump</span> <span>↑</span></li>
                <li className="flex justify-between"><span className="text-slate-500">{p2.moveNames.jab}</span> <span>P</span></li>
                <li className="flex justify-between"><span className="text-slate-500">{p2.moveNames.special}</span> <span>I</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Block</span> <span>O</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex gap-4">
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-bold">H</span> Toggle Hitboxes
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-bold">R</span> Restart Match
            </div>
            <div>
              Prototype v1.0 • Built with Phaser 3 & React
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;