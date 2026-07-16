import React, { useEffect, useState } from 'react';

interface GlitchResolveTextProps {
  text: string;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
  continuousGlitch?: boolean;
  children?: React.ReactNode;
}

const GlitchResolveText: React.FC<GlitchResolveTextProps> = ({
  text,
  duration = 500,
  delay = 0,
  onComplete,
  continuousGlitch = false,
  children,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const charsList = 'XYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  useEffect(() => {
    setIsResolved(false);
    let timeoutId: NodeJS.Timeout;
    let frameId: number;
    let glitchIntervalId: NodeJS.Timeout;

    const startAnimation = () => {
      const startTime = Date.now();
      const length = text.length;

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const resolvedCount = Math.floor(progress * length);

        let currentStr = '';
        for (let i = 0; i < length; i++) {
          if (i < resolvedCount) {
            currentStr += text[i];
          } else if (text[i] === ' ' || text[i] === '\n') {
            currentStr += text[i];
          } else {
            currentStr += charsList[Math.floor(Math.random() * charsList.length)];
          }
        }

        setDisplayText(currentStr);

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          setDisplayText(text);
          setIsResolved(true);
          if (onComplete) onComplete();

          if (continuousGlitch && length > 2) {
            glitchIntervalId = setInterval(() => {
              if (Math.random() > 0.15) return;

              let count = 0;
              const maxSteps = 3;
              const glitchStepInterval = setInterval(() => {
                if (count >= maxSteps) {
                  setDisplayText(text);
                  clearInterval(glitchStepInterval);
                  return;
                }

                const chars = text.split('');
                const numToGlitch = Math.floor(chars.length / 5) + 1;
                for (let k = 0; k < numToGlitch; k++) {
                  const idx = Math.floor(Math.random() * chars.length);
                  if (chars[idx] !== ' ' && chars[idx] !== '\n') {
                    chars[idx] = charsList[Math.floor(Math.random() * charsList.length)];
                  }
                }
                setDisplayText(chars.join(''));
                count++;
              }, 80);
            }, 6000 + Math.random() * 6000);
          }
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
      if (glitchIntervalId) clearInterval(glitchIntervalId);
    };
  }, [text, duration, delay, continuousGlitch]);

  if (isResolved && children) {
    return <>{children}</>;
  }

  return <span className="font-mono tracking-wide">{displayText}</span>;
};

export default GlitchResolveText;
