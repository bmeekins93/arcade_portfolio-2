import React, { useEffect, useRef } from 'react';

interface MediaPlayerProps {
  gifSrc: string;
  audioSrc: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ gifSrc, audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attempt to ensure playback starts programmatically
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented by browser policy:", error);
          // Optional: You could add a click listener here to document to start audio if autoplay fails
          const startAudio = () => {
            audioRef.current?.play();
            document.removeEventListener('click', startAudio);
          };
          document.addEventListener('click', startAudio);
        });
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-in fade-in duration-700">
      
      {/* Visual Container */}
      <div className="relative group perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur-xl opacity-40 animate-pulse"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
          <img 
            src={gifSrc} 
            alt="Animated Sprite" 
            className="w-full max-w-[300px] md:max-w-[400px] h-auto object-contain mx-auto drop-shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Flashing Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-visible">
             <h2 className="absolute text-5xl md:text-8xl font-black tracking-tighter text-white uppercase text-center whitespace-nowrap animate-[flash-text-1_0.8s_linear_infinite]"
                 style={{ WebkitTextStroke: '2px black' }}>
               GONNA FUCK
             </h2>
             <h2 className="absolute text-5xl md:text-8xl font-black tracking-tighter text-red-500 uppercase text-center whitespace-nowrap animate-[flash-text-2_0.8s_linear_infinite]"
                 style={{ WebkitTextStroke: '2px black' }}>
               YOUR DAY UP
             </h2>
          </div>
        </div>
      </div>

      {/* Audio Element with AutoPlay */}
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        loop 
        autoPlay
        onError={(e) => console.error("Audio error:", e)}
      />
    </div>
  );
};