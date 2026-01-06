import React from 'react';

interface LaserBeamProps {
  color: string; 
  animation: string; 
  duration: string; 
  delay: string;
  width?: string;
  opacity?: number;
}

const LaserBeam: React.FC<LaserBeamProps> = ({ 
  color, 
  animation, 
  duration, 
  delay, 
  width = '2px',
  opacity = 0.8
}) => (
  <div
    className="absolute top-0 h-[250vh] origin-top transform-gpu mix-blend-screen"
    style={{
      width,
      background: `linear-gradient(to bottom, #fff 0%, ${color} 20%, transparent 90%)`,
      boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
      animation: `${animation} ${duration} ease-in-out infinite alternate`,
      animationDelay: delay,
      opacity,
      left: 0, 
    }}
  />
);

export const LaserBackground = () => {
  const beamCount = 20; 
  const beams = Array.from({ length: beamCount });
  
  return (
    <div className="fixed inset-0 overflow-hidden bg-black z-0 pointer-events-none">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Strobe Lights (Flash in from corners) */}
      <div className="absolute inset-0 z-20 pointer-events-none mix-blend-screen">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_rgba(255,255,255,0.9)_0%,_transparent_60%)] animate-[strobe_4s_infinite_ease-in-out]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,_rgba(255,255,255,0.9)_0%,_transparent_60%)] animate-[strobe_7s_infinite_ease-in-out_1s]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_rgba(255,255,255,0.9)_0%,_transparent_60%)] animate-[strobe_5s_infinite_ease-in-out_2.5s]"></div>
      </div>

      {/* --- Laser Banks --- */}

      {/* Top Left - Blue/Cyan Sweepers */}
      <div className="absolute top-[-5%] left-[-5%] w-0 h-0 z-10">
        {beams.map((_, i) => (
          <LaserBeam
            key={`tl-${i}`}
            color={i % 2 === 0 ? "#06b6d4" : "#3b82f6"} // Cyan/Blue
            animation="laser-spin-cw"
            duration={`${2 + (i % 5) * 0.5}s`}
            delay={`${i * 0.1}s`}
            width={i % 5 === 0 ? '4px' : '2px'}
          />
        ))}
      </div>

      {/* Top Right - Green/Lime Sweepers */}
      <div className="absolute top-[-5%] right-[-5%] w-0 h-0 z-10">
         {beams.map((_, i) => (
          <LaserBeam
            key={`tr-${i}`}
            color={i % 2 === 0 ? "#22c55e" : "#84cc16"} // Green/Lime
            animation="laser-spin-ccw"
            duration={`${2.5 + (i % 5) * 0.5}s`}
            delay={`${i * 0.15}s`}
            width={i % 5 === 0 ? '4px' : '2px'}
          />
        ))}
      </div>

      {/* Top Center - Purple/Pink Wild Chaos */}
      <div className="absolute top-[-10%] left-[50%] w-0 h-0 z-10">
         {beams.map((_, i) => (
          <LaserBeam
            key={`tc-${i}`}
            color={i % 2 === 0 ? "#d946ef" : "#a855f7"} // Fuchsia/Purple
            animation="laser-wild"
            duration={`${1.5 + (i % 10) * 0.2}s`}
            delay={`${i * 0.05}s`}
            width={i % 3 === 0 ? '3px' : '1px'}
            opacity={0.7}
          />
        ))}
      </div>

       {/* Side Right - Red/Orange Shooting Across */}
      <div className="absolute top-[60%] right-[-5%] w-0 h-0 z-10 origin-center rotate-90">
         {beams.map((_, i) => (
          <LaserBeam
            key={`sr-${i}`}
            color={i % 2 === 0 ? "#ef4444" : "#f97316"} 
            animation="laser-spin-cw" // Relative to the rotated container
            duration={`${3 + (i % 5) * 0.5}s`}
            delay={`${i * 0.2}s`}
            width="2px"
          />
        ))}
      </div>
      
       {/* Side Left - Yellow/White Shooting Across */}
      <div className="absolute top-[40%] left-[-5%] w-0 h-0 z-10 origin-center -rotate-90">
         {beams.map((_, i) => (
          <LaserBeam
            key={`sl-${i}`}
            color={i % 2 === 0 ? "#eab308" : "#ffffff"} 
            animation="laser-spin-ccw" 
            duration={`${3.5 + (i % 5) * 0.5}s`}
            delay={`${i * 0.2}s`}
            width="2px"
          />
        ))}
      </div>
    </div>
  );
};