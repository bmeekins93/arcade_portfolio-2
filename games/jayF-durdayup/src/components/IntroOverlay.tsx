import React from 'react';

interface IntroOverlayProps {
  onStart: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onStart }) => {
  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 drop-shadow-lg">
          Dwayne Loop
        </h1>
        <p className="text-lg text-indigo-200/80 font-light">
          Turn up your volume for the full experience
        </p>
      </div>

      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg hover:shadow-indigo-500/50"
      >
        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
        <span className="relative flex items-center gap-3">
          <svg 
            className="w-6 h-6 fill-current" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Enter Experience
        </span>
      </button>
    </div>
  );
};