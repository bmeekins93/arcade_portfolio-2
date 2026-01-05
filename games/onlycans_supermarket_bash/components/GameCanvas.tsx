import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MatchScene } from '../game/MatchScene';
import { MainMenuScene } from '../game/MainMenuScene';
import { CharacterSelectScene } from '../game/CharacterSelectScene';
import { WorldSelectScene } from '../game/WorldSelectScene';
import { PreloadScene } from '../game/PreloadScene';
import { WORLD } from '../game/constants';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!gameRef.current && containerRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: WORLD.width,
        height: WORLD.height,
        parent: containerRef.current,
        backgroundColor: '#111316',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: { debug: false },
        },

        scene: [PreloadScene, MainMenuScene, CharacterSelectScene, WorldSelectScene, MatchScene],
        banner: false,
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="game-container"
      ref={containerRef}
      className="rounded-lg overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 w-full max-w-[1000px] aspect-video"
    />
  );
};