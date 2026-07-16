import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [theme, setTheme] = useState<'green' | 'amber' | 'cyberpunk'>('green');
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 450, mass: 0.15 }; 
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const clickable = target.closest('button') || 
                        target.closest('a') || 
                        target.closest('[data-hover="true"]');
      setIsHovering(!!clickable);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });

    const handleThemeChange = (e: CustomEvent) => {
      if (e.detail && (e.detail === 'green' || e.detail === 'amber' || e.detail === 'cyberpunk')) {
        setTheme(e.detail);
      }
    };
    window.addEventListener('terminal-theme-change' as any, handleThemeChange);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('terminal-theme-change' as any, handleThemeChange);
    };
  }, [mouseX, mouseY]);

  const getThemeColors = () => {
    switch (theme) {
      case 'amber':
        return 'bg-[#ffb000] border-[#ffb000] shadow-[0_0_8px_#ffb000]';
      case 'cyberpunk':
        return 'bg-[#ff007f] border-[#ff007f] shadow-[0_0_8px_#ff007f]';
      case 'green':
      default:
        return 'bg-[#39ff14] border-[#39ff14] shadow-[0_0_8px_#39ff14]';
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center hidden md:flex will-change-transform"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.div
        className={`w-3 h-5 border ${getThemeColors()} opacity-85`}
        animate={{
          scale: isHovering ? 1.35 : 1,
          rotate: isHovering ? 90 : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
      />
    </motion.div>
  );
};

export default CustomCursor;
