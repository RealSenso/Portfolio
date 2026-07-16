import React, { useEffect, useState } from 'react';

const FluidBackground: React.FC = () => {
  const [theme, setTheme] = useState<'green' | 'amber'>('green');

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && (customEvent.detail === 'green' || customEvent.detail === 'amber')) {
        setTheme(customEvent.detail);
      }
    };
    
    window.addEventListener('terminal-theme-change' as any, handleThemeChange);
    return () => {
      window.removeEventListener('terminal-theme-change' as any, handleThemeChange);
    };
  }, []);

  const bgTint = theme === 'amber' ? 'bg-[#060401]' : 'bg-[#010402]';

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${bgTint} transition-colors duration-500`}>
      <div className="absolute inset-0 pointer-events-none z-0 bg-scanlines opacity-5" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-crt-vignette" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-noise opacity-[0.03]" />
    </div>
  );
};

export default FluidBackground;
