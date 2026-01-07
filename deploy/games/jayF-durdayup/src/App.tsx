import { useState } from 'react';
import { MediaPlayer } from './components/MediaPlayer';
import { LaserBackground } from './components/LaserBackground';
import { IntroOverlay } from './components/IntroOverlay';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white font-sans bg-black">
      <LaserBackground />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {!hasStarted ? (
          <IntroOverlay onStart={() => setHasStarted(true)} />
        ) : (
          <MediaPlayer
            gifSrc="animated_sprite_transparent.gif"
            audioSrc="assets/audio/Dwayne.mp3"
          />
        )}
      </main>

      <footer className="absolute bottom-4 text-xs text-white/30 text-center w-full z-10">
        <p>Built with React & Tailwind</p>
      </footer>
    </div>
  );
}