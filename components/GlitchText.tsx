import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  glowClass?: string;
  intervalMs?: number;
  glitchChance?: number;
  randomDelay?: boolean;
}

const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  className = '', 
  glowClass = 'crt-glow-green',
  intervalMs = 4500,
  glitchChance = 1.0,
  randomDelay = true
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startInterval = () => {
      interval = setInterval(() => {
        if (Math.random() > glitchChance) return;
        
        setIsGlitching(true);
        let count = 0;
        const maxGlitchSteps = 4;
        
        const glitchInterval = setInterval(() => {
          if (count >= maxGlitchSteps) {
            setDisplayText(text);
            setIsGlitching(false);
            clearInterval(glitchInterval);
            return;
          }

          const chars = text.split('');
          const glitchChars = ['0', '1', '_', '$', '>', '[', ']', '#', 'X', '%'];
          
          for (let i = 0; i < Math.floor(chars.length / 4) + 1; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            if (chars[randomIndex] !== ' ') {
              chars[randomIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
          }
          
          setDisplayText(chars.join(''));
          count++;
        }, 70);

      }, intervalMs);
    };

    if (randomDelay) {
      const delayTimeout = setTimeout(() => {
        startInterval();
      }, Math.random() * 3000);
      return () => {
        clearTimeout(delayTimeout);
        if (interval) clearInterval(interval);
      };
    } else {
      startInterval();
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [text, intervalMs, glitchChance, randomDelay]);

  return (
    <motion.span 
      className={`font-mono relative tracking-wider select-none ${glowClass} ${className}`}
      animate={isGlitching ? {
        x: [0, -2, 2, -1, 0],
        opacity: [1, 0.85, 0.95, 0.9, 1]
      } : {}}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {displayText}
    </motion.span>
  );
};

export default GlitchText;
