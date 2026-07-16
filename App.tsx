import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  ChevronRight, 
  ExternalLink, 
  Star, 
  GitFork, 
  Linkedin, 
  Mail, 
  Sparkles,
  Command,
  TerminalSquare
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GlitchText from './components/GlitchText';
import GlitchResolveText from './components/GlitchResolveText';
import CustomCursor from './components/CustomCursor';
import { SkillCategory, TerminalLine, GithubRepo } from './types';

const DISCOVERABLE_COMMANDS = ['help', 'about', 'education', 'projects', 'github', 'contact', 'clear'];

const RetroProgressBar: React.FC<{ duration: number; text: string; colors: any }> = ({ duration, text, colors }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration]);

  const totalBlocks = 20;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className={`font-mono text-[10px] sm:text-xs md:text-sm ${colors.text} py-1 flex flex-col sm:flex-row sm:items-center gap-2`}>
      <div className="flex items-center gap-1 shrink-0">
        <span className="animate-pulse">⚡</span>
        <span className="font-bold uppercase tracking-wider">{text}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/40 font-bold">[</span>
        <span className="tracking-normal leading-none select-none font-bold">{bar}</span>
        <span className="text-white/40 font-bold">]</span>
        <span className="font-bold min-w-[4ch] text-right">{progress}%</span>
      </div>
    </div>
  );
};

const SKILLS_DATA: SkillCategory[] = [
  {
    category: "Languages",
    skills: ["JavaScript", "Python", "SQL", "C#"]
  },
  {
    category: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS"]
  },
  {
    category: "Backend & DB",
    skills: ["Node.js", "MongoDB"]
  }
];

const ASCII_LOGO = `
 ____  _____ _   _ ____   ___  
/ ___|| ____| \\ | / ___| / _ \\ 
\\___ \\|  _| |  \\| \\___ \\| | | |
 ___) | |___| |\\  |___) | |_| |
|____/|_____|_| \\_|____/ \\___/ 
                               
`;

const getExactAge = (): string => {
  const birthDate = new Date(2003, 9, 11, 21, 11, 0);
  const now = new Date();
  
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();
  let hours = now.getHours() - birthDate.getHours();
  let minutes = now.getMinutes() - birthDate.getMinutes();
  let seconds = now.getSeconds() - birthDate.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }
  return `${years} years, ${months} months, ${days} days, ${hours}h ${minutes}m ${seconds}s`;
};

const App: React.FC = () => {
  const [terminalTheme, setTerminalTheme] = useState<'green' | 'amber'>('green');
  
  const [outputLines, setOutputLines] = useState<TerminalLine[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'system': false,
    'profile': false,
    'work': false,
    'social': false
  });
  
  const [githubUsername, setGithubUsername] = useState('RealSenso');
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const [isBooted, setIsBooted] = useState(false);
  const [bootStatus, setBootStatus] = useState<'booting' | 'morphing' | 'blank' | 'ready'>('booting');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  
  const [showFileTree, setShowFileTree] = useState(false);

  const terminalBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const [scrollStats, setScrollStats] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollStats({
      scrollTop: target.scrollTop,
      scrollHeight: target.scrollHeight,
      clientHeight: target.clientHeight
    });
  };

  const fetchGithubRepos = async (username: string) => {
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
      if (!response.ok) {
        throw new Error(`GitHub user '${username}' not found or API limit exceeded`);
      }
      const data = await response.json();
      const repositories: GithubRepo[] = data.map((repo: any) => ({
        name: repo.name,
        description: repo.description || "No description provided.",
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language || "Markdown",
        updated_at: new Date(repo.updated_at).toLocaleDateString()
      }));
      setGithubRepos(repositories);
      return repositories;
    } catch (err: any) {
      setRepoError(err.message || "Failed to load github index");
      return null;
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    const diagnosticSteps = [
      "SYSTEM INGRESS: HOST IP INITIALIZED",
      "SENSO-BIOS v4.81 (C) 2026 GENERAL PORTFOLIO",
      "RAM CHECK: 16384KB SYSTEM CACHE - OK",
      "ESTABLISHING CONTEXT: CONNECTING VIRTUAL SYSTEMS",
      "MOUNTING REPOSITORY EXPLORER MODULES",
      "LOADING RETRO PHOSPHOR GRAPHICS SHELL",
      "SYNCHRONIZING RECTIFIER MATRIX ENGINE",
      "SYSTEM BOOT: COMPLETE. READY FOR VISITOR SHELL."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < diagnosticSteps.length) {
        setBootLogs(prev => [...prev, diagnosticSteps[currentStep]]);
        setBootProgress(Math.floor(((currentStep + 1) / diagnosticSteps.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBootStatus('morphing');
          setTimeout(() => {
            setBootStatus('blank');
            setTimeout(() => {
              setBootStatus('ready');
              setIsBooted(true);
              runCommand('help', true);
              fetchGithubRepos(githubUsername);
            }, 500);
          }, 600);
        }, 400);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const scrollActions = () => {
      const el = logContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
      if (terminalBottomRef.current) {
        terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    scrollActions();
    
    const t1 = setTimeout(scrollActions, 50);
    const t2 = setTimeout(scrollActions, 150);
    const t3 = setTimeout(scrollActions, 300);
    const t4 = setTimeout(scrollActions, 500);

    const el = logContainerRef.current;
    let tStats: NodeJS.Timeout;
    if (el) {
      tStats = setTimeout(() => {
        setScrollStats({
          scrollTop: el.scrollTop,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight
        });
      }, 550);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (tStats) clearTimeout(tStats);
    };
  }, [outputLines, isBooted]);

  const focusTerminalInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const changeTheme = (newTheme: 'green' | 'amber') => {
    setTerminalTheme(newTheme);
    const event = new CustomEvent('terminal-theme-change', { detail: newTheme });
    window.dispatchEvent(event);
  };

  const clearTerminal = () => {
    setOutputLines([]);
  };

  const runCommand = (fullCmd: string, silentBoot = false) => {
    const trimmed = fullCmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const timestamp = new Date().toLocaleTimeString();

    if (cmd === 'about' || cmd === 'education') {
      setExpandedFolders(prev => ({ ...prev, profile: true }));
    } else if (cmd === 'projects' || cmd === 'github') {
      setExpandedFolders(prev => ({ ...prev, work: true }));
    } else if (cmd === 'contact') {
      setExpandedFolders(prev => ({ ...prev, social: true }));
    }

    if (cmd === 'clear') {
      clearTerminal();
      return;
    }

    const newLines: TerminalLine[] = [];
    const appendOutput = (text: string, type: 'output' | 'error' | 'success' | 'info' = 'output') => {
      newLines.push({
        id: Math.random().toString(),
        type,
        text,
        timestamp
      });
    };

    let isAsyncCommand = false;

    switch (cmd) {
      case 'help':
        appendOutput("==========================================================================", "info");
        appendOutput("                     ACTIVE DIRECTORY COMMANDS                           ", "success");
        appendOutput("==========================================================================", "info");
        appendOutput("  about          - Read detailed biography and technical skills", "success");
        appendOutput("  education      - Read details of college and academic track", "success");
        appendOutput("  projects       - Fetch live repositories from GitHub API", "success");
        appendOutput("  contact        - Output social links and email address", "success");
        appendOutput("  clear          - Flush terminal console screen", "success");
        appendOutput("\n--- SYSTEM QUICK TIPS --------------------------------------------------", "info");
        appendOutput("  • Press [Tab] or [→] to autocomplete matching commands", "success");
        appendOutput("  • Press [↑] or [↓] to cycle through your command history", "success");
        appendOutput("  • Click any on-screen command name to execute it immediately", "success");
        appendOutput("==========================================================================", "info");
        break;

      case 'ascii':
        appendOutput(ASCII_LOGO, 'success');
        break;

      case 'about':
        appendOutput("==========================================================================", "info");
        appendOutput("                            ENGINEERING BIOGRAPHY                         ", "success");
        appendOutput("==========================================================================", "info");
        appendOutput("Name     : Chinmay Pendam (Senso)", "success");
        appendOutput("Age      : " + getExactAge(), "success");
        appendOutput("Domain   : Full-Stack Devlopment, AI and ML", "success");
      
        appendOutput("\n--- EXECUTIVE SUMMARY ---------------------------------------------------", "info");
        appendOutput("I am an ambitious Full-Stack and AI/ML Engineer currently pursuing my", "output");
        appendOutput("M.Tech in Artificial Intelligence at the prestigious Indian Institute of Science", "output");
        appendOutput("(IISc), Bangalore. I graduated with a Bachelor of Engineering (B.E.) in", "output");
        appendOutput("Information Technology from Datta Meghe College of Engineering in 2025.", "output");
        appendOutput("\nMy focus bridges advanced research in Large Language Models and", "output");
        appendOutput("robust optimizations. Possessing deep expertise in declarative UI pipelines", "output");
        appendOutput("(React/Next/Vite), backend design (Node/SQL), and predictive modeling,", "output");
        appendOutput("I specialize in devloping intelligent neural workloads into high-performance ", "output");
        appendOutput(" web products and other automations", "output");
        appendOutput("\n--- RESEARCH & DEVELOPMENT PILLARS ---------------------------------------", "info");
        appendOutput("   Intelligent Systems  - Theoretical & practical ML, Deep Learning, and neural networks.", "success");
        appendOutput("   Production Full-Stack - Type-safe, concurrent web applications,", "success");
        appendOutput("\n--- TECHNICAL SKILLS MATRIX ----------------------------------------------", "info");
        
        SKILLS_DATA.forEach(cat => {
          appendOutput(`  [+] ${cat.category.padEnd(16)}: ${cat.skills.join(', ')}`, 'output');
        });
        appendOutput("==========================================================================", "info");
        break;

      case 'education':
        appendOutput("--- ACADEMIC TIMELINE -----------------------------------------------------", "info");
        appendOutput(">> MTECH IN ARTIFICIAL INTELLIGENCE | IISc Bangalore", "success");
        appendOutput("   Period: 2026 - 2028 | Focus: LLM, LRM, NLP & Reinforcement Learning", "info");
        appendOutput("\n>> BE IN INFORMATION TECHNOLOGY | Datta Meghe College of Engineering", "success");
        appendOutput("   Period: 2021 - 2025 | Location: Navi Mumbai, India", "info");
        break;

      case 'projects':
      case 'github':
        isAsyncCommand = true;
        break;

      case 'contact':
        appendOutput("Establishing signal path... Direct linkages available:", "info");
        appendOutput("   Email      : official.senso.vt@gmail.com", "success");
        appendOutput("   LinkedIn   : linkedin.com/in/chinmay-pendam-3353893ab", "success");
        appendOutput("\nTo send a transmission, send an email or connect on LinkedIn.", "output");
        break;

      default:
        appendOutput(`Command not recognized: '${cmd}'. Type 'help' to see available directives.`, 'error');
    }

    if (silentBoot) {
      if (isAsyncCommand) {
        const targetUser = 'RealSenso';
        fetchGithubRepos(targetUser);
      } else {
        setOutputLines(prev => [...prev, ...newLines]);
      }
      return;
    }

    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryPointer(-1);

    setIsExecuting(true);
    const duration = Math.floor(Math.random() * 800) + 700; // Between 700ms and 1500ms
    const inputLineId = Math.random().toString();
    const loadingLineId = Math.random().toString();

    setOutputLines(prev => [
      ...prev,
      { id: inputLineId, type: 'input', text: `visitor@senso:~$ ${trimmed}`, timestamp },
      { id: loadingLineId, type: 'loading', text: `SYNCHRONIZING RECTIFIER ENGINE`, duration, timestamp }
    ]);

    setTimeout(() => {
      if (isAsyncCommand) {
        const targetUser = 'RealSenso';
        fetchGithubRepos(targetUser).then(repos => {
          setOutputLines(prev => {
            const cleared = prev.filter(line => line.id !== loadingLineId);
            if (repos && repos.length > 0) {
              return [
                ...cleared,
                { 
                  id: Math.random().toString(), 
                  type: 'success', 
                  text: `>>> LIVE GITHUB REPOSITORIES RETRIEVED FOR '${targetUser.toUpperCase()}'`, 
                  timestamp 
                },
                {
                  id: Math.random().toString(),
                  type: 'info',
                  text: `👉 PROFILE LINK: https://github.com/${targetUser}`,
                  timestamp
                },
                {
                  id: Math.random().toString(),
                  type: 'repos',
                  text: 'Live GitHub Showcase',
                  repos: repos,
                  timestamp
                }
              ];
            } else {
              return [
                ...cleared,
                { 
                  id: Math.random().toString(), 
                  type: 'error', 
                  text: `API Error: Could not sync repositories for '${targetUser}'. Ensure user exists.`, 
                  timestamp 
                }
              ];
            }
          });
          setIsExecuting(false);
          focusTerminalInput();
        });
      } else {
        setOutputLines(prev => {
          const cleared = prev.filter(line => line.id !== loadingLineId);
          return [...cleared, ...newLines];
        });
        setIsExecuting(false);
        focusTerminalInput();
      }
    }, duration);
  };

  const getSuggestion = () => {
    if (!commandInput.trim()) return '';
    const match = DISCOVERABLE_COMMANDS.find(c => c.startsWith(commandInput.toLowerCase()));
    if (match && match !== commandInput.toLowerCase()) {
      return match.slice(commandInput.length);
    }
    return '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextPointer = historyPointer + 1;
        if (nextPointer < commandHistory.length) {
          setHistoryPointer(nextPointer);
          setCommandInput(commandHistory[nextPointer]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const prevPointer = historyPointer - 1;
      if (prevPointer >= 0) {
        setHistoryPointer(prevPointer);
        setCommandInput(commandHistory[prevPointer]);
      } else {
        setHistoryPointer(-1);
        setCommandInput('');
      }
    } else if (e.key === 'Tab' || e.key === 'ArrowRight') {
      const suggestion = getSuggestion();
      if (suggestion) {
        e.preventDefault();
        setCommandInput(commandInput + suggestion);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const matching = DISCOVERABLE_COMMANDS.filter(c => c.startsWith(commandInput.trim().toLowerCase()));
        if (matching.length === 1) {
          setCommandInput(matching[0]);
        }
      }
    }
  };

  const handleFileClick = (commandToRun: string) => {
    runCommand(commandToRun);
    focusTerminalInput();
    setShowFileTree(false); // Auto close mobile sidebar drawer
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const colors = useMemo(() => {
    switch (terminalTheme) {
      case 'amber':
        return {
          glow: 'crt-glow-amber',
          text: 'text-[#ffb000]',
          border: 'border-[#ffb000]',
          borderLight: 'border-[#ffb000]/30',
          bg: 'bg-[#ffb000]/10',
          bgDark: 'bg-[#ffb000]/5',
          accent: 'text-[#ffe099]',
          cursor: 'bg-[#ffb000]',
          shellColor: '#ffb000'
        };
      case 'green':
      default:
        return {
          glow: 'crt-glow-green',
          text: 'text-[#39ff14]',
          border: 'border-[#39ff14]',
          borderLight: 'border-[#39ff14]/30',
          bg: 'bg-[#39ff14]/10',
          bgDark: 'bg-[#39ff14]/5',
          accent: 'text-[#bfff80]',
          cursor: 'bg-[#39ff14]',
          shellColor: '#39ff14'
        };
    }
  }, [terminalTheme]);

  const renderGlitchyWords = (textStr: string, seed: string) => {
    const tokens = textStr.split(/(\s+)/);
    return tokens.map((token, idx) => {
      const cleanToken = token.trim();
      const isWord = cleanToken.length > 2 && /^[a-zA-Z0-9_-]+$/.test(cleanToken);
      const isExcluded = cleanToken.startsWith('==') || cleanToken.startsWith('--') || cleanToken.startsWith('>>') || cleanToken.startsWith('[') || cleanToken.endsWith(']');
      
      if (isWord && !isExcluded) {
        let hash = 0;
        const seedStr = cleanToken + seed + idx;
        for (let j = 0; j < seedStr.length; j++) {
          hash = seedStr.charCodeAt(j) + ((hash << 5) - hash);
        }
        const pct = Math.abs(hash) % 100;
        if (pct < 8) {
          const interval = 6000 + (Math.abs(hash) % 8000);
          return (
            <GlitchText
              key={idx}
              text={cleanToken}
              glowClass=""
              className="inline-block text-inherit font-mono"
              intervalMs={interval}
              glitchChance={0.7}
            />
          );
        }
      }
      return token;
    });
  };

  const renderClickableText = (text: string, seed: string = 'static') => {
    const combinedRegex = /(https?:\/\/[^\s]+|github\.com\/[^\s]+|linkedin\.com\/in\/[^\s]+|twitter\.com\/[^\s]+|ai\.studio\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    
    const parts = text.split(combinedRegex);
    
    return parts.map((part, i) => {
      if (combinedRegex.test(part)) {
        let href = part;
        const isEmail = part.includes('@') && !part.startsWith('http');
        if (isEmail) {
          href = `mailto:${part}`;
        } else if (!part.match(/^https?:\/\//i)) {
          href = `https://${part}`;
        }
        return (
          <a
            key={i}
            href={href}
            target={isEmail ? undefined : "_blank"}
            rel={isEmail ? undefined : "noreferrer"}
            className={`${colors.text} font-bold underline hover:brightness-125 transition-all cursor-none inline`}
            onClick={(e) => e.stopPropagation()}
          >
            <GlitchResolveText text={part} duration={400} continuousGlitch={false} />
          </a>
        );
      }
      return (
        <GlitchResolveText key={i} text={part} duration={500} continuousGlitch={false}>
          <span>
            {renderGlitchyWords(part, seed + '-' + i)}
          </span>
        </GlitchResolveText>
      );
    });
  };

  const renderResponsiveLine = (text: string, type: string, lineId: string) => {
    const trimmed = text.trim();
    
    if (/^={15,}$/.test(trimmed)) {
      return (
        <div className={`my-1.5 h-[2px] border-b-2 border-double ${colors.borderLight} w-full opacity-60`} />
      );
    }
    
    if (/^-{15,}$/.test(trimmed)) {
      return (
        <div className={`my-1.5 border-b border-dashed ${colors.borderLight} w-full opacity-40`} />
      );
    }

    const sectionMatch = text.match(/^---\s+([A-Z0-9\s&🧠⚡💼✉+:\(\)\[\]\/\.-]+?)\s+-*$/i) || 
                         text.match(/^>>\s+([A-Z0-9\s&🧠⚡💼✉+:\(\)\[\]\/\.-]+?)\s+-*$/i);
    if (sectionMatch) {
      const heading = sectionMatch[1].trim();
      return (
        <div className="flex items-center gap-2 my-1.5 font-bold font-mono text-[10px] sm:text-xs text-sky-400 uppercase tracking-wider">
          <span className="shrink-0">{heading}</span>
          <div className={`flex-1 border-b border-dashed ${colors.borderLight} opacity-30`} />
        </div>
      );
    }

    if (text.startsWith('     ') && trimmed.length > 3 && trimmed === trimmed.toUpperCase()) {
      return (
        <div className={`text-center font-bold tracking-widest text-[11px] sm:text-xs md:text-sm py-1 ${colors.text} ${colors.glow}`}>
          {trimmed}
        </div>
      );
    }

    if (text.includes('____') && text.includes('_____')) {
      return (
        <pre className={`text-[6px] xs:text-[7px] sm:text-[10px] md:text-xs font-bold leading-none select-none overflow-x-auto ${colors.text} ${colors.glow} max-w-full block py-2 no-scrollbar`}>
          {text}
        </pre>
      );
    }

    const helpCmdMatch = text.match(/^\s{2,}([a-zA-Z0-9_-]+)\s{2,}-\s+(.*)$/);
    if (helpCmdMatch) {
      const cmdName = helpCmdMatch[1];
      const cmdDesc = helpCmdMatch[2];
      return (
        <div className="grid grid-cols-[10ch_auto_1fr] gap-x-2 md:gap-x-3 items-start my-1 text-[10px] sm:text-xs md:text-sm">
          <button 
            onClick={() => runCommand(cmdName)}
            className={`font-bold text-left ${colors.text} ${colors.glow} cursor-none hover:underline focus:outline-none`}
          >
            {cmdName}
          </button>
          <span className="text-white/30 select-none">-</span>
          <span className="text-white/80 break-words whitespace-pre-wrap">
            {renderClickableText(cmdDesc, lineId + '-desc')}
          </span>
        </div>
      );
    }

    const keyValueMatch = text.match(/^\s*([a-zA-Z0-9\s\[\]\+\-✉💼🧠⚡🗂️🧬🛠️🚀🎓&]{3,22})\s*:\s*(.*)$/);
    if (keyValueMatch) {
      const keyName = keyValueMatch[1].trim();
      const keyValue = keyValueMatch[2];
      return (
        <div className="grid grid-cols-[18ch_auto_1fr] sm:grid-cols-[22ch_auto_1fr] gap-x-1.5 md:gap-x-2.5 items-start my-0.5 text-[10px] sm:text-xs md:text-sm">
          <span className={`font-bold ${colors.text} opacity-90 select-none truncate`} title={keyName}>
            {keyName}
          </span>
          <span className="text-white/30 select-none">:</span>
          <span className="text-white/80 break-words whitespace-pre-wrap">
            {renderClickableText(keyValue, lineId + '-val')}
          </span>
        </div>
      );
    }

    return renderClickableText(text, lineId);
  };

  return (
    <div className={`relative h-screen max-h-screen overflow-hidden font-mono cursor-none ${colors.text} selection:bg-[#39ff14]/30 selection:text-white select-none crt-screen`}>
      <CustomCursor />
      <FluidBackground />

      <AnimatePresence mode="wait">
        {bootStatus === 'blank' ? (
          <div key="blank" className="fixed inset-0 z-50 bg-black cursor-none" />
        ) : bootStatus !== 'ready' ? (
          <motion.div 
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0 } 
            }}
            className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black p-4 md:p-8"
          >
            <motion.div 
              animate={bootStatus === 'morphing' ? {
                maxWidth: '100vw',
                width: '100vw',
                height: '100vh',
                borderRadius: '0px',
                borderWidth: '0px',
                padding: '0px',
                margin: '0px',
                boxShadow: 'none',
                backgroundColor: terminalTheme === 'amber' ? '#060401' : '#010402',
              } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-2xl border ${terminalTheme === 'amber' ? 'border-[#ffb000]/30' : 'border-[#39ff14]/30'} p-6 md:p-8 bg-[#020804]/90 rounded shadow-[0_0_20px_rgba(57,255,20,0.15)] bg-scanlines relative flex flex-col justify-center overflow-hidden`}
            >
              <motion.div
                animate={bootStatus === 'morphing' ? {
                  opacity: 0,
                  scale: 0.9,
                  filter: 'blur(4px)'
                } : {}}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col justify-center p-6 md:p-8"
              >
                <div className="text-center mb-6">
                  <pre className={`text-[7px] md:text-xs font-bold leading-tight select-none ${terminalTheme === 'amber' ? 'text-amber-500 crt-glow-amber' : 'text-emerald-400 crt-glow-green'}`}>
                    {ASCII_LOGO}
                  </pre>
                  <div className={`text-xs font-semibold tracking-wider ${terminalTheme === 'amber' ? 'text-amber-500/80' : 'text-emerald-500/80'} mt-2`}>
                    SECURE DIAGNOSTIC BOOT SHELL
                  </div>
                </div>

                <div className={`h-4 border ${terminalTheme === 'amber' ? 'border-amber-500/30' : 'border-emerald-500/30'} w-full mb-6 relative overflow-hidden rounded`}>
                  <motion.div 
                    className={`h-full ${terminalTheme === 'amber' ? 'bg-[#ffb000]' : 'bg-emerald-500'}`} 
                    style={{ width: `${bootProgress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black select-none">
                    {bootProgress}%
                  </div>
                </div>

                <div className={`text-[10px] md:text-xs font-mono h-48 overflow-y-auto ${terminalTheme === 'amber' ? 'text-amber-500/95 border-amber-500/10' : 'text-emerald-400/95 border-emerald-500/10'} space-y-1 bg-black/60 p-4 border rounded`}>
                  {bootLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className={`${terminalTheme === 'amber' ? 'text-amber-600' : 'text-emerald-600'} font-bold select-none`}>[ok]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {bootProgress < 100 && (
                    <div className="flex gap-2 items-center">
                      <span className={`${terminalTheme === 'amber' ? 'text-amber-500' : 'text-emerald-500'} terminal-cursor select-none`}>█</span>
                      <span className="opacity-70">running system checks...</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {bootStatus === 'morphing' && (
                <div className="absolute inset-0 flex flex-col justify-around pointer-events-none z-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0, opacity: 0.8 }}
                      animate={{ 
                        scaleX: [0, 1.2, 0], 
                        opacity: [0, 1, 0],
                        x: [0, (i % 2 === 0 ? 60 : -60), 0]
                      }}
                      transition={{ 
                        duration: 0.3, 
                        delay: i * 0.02,
                        repeat: 1
                      }}
                      className={`h-[2px] w-full ${terminalTheme === 'amber' ? 'bg-[#ffb000]/30' : 'bg-[#39ff14]/30'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="os"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
            className="p-2 md:p-4 h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden gap-2 md:gap-3 box-border"
          >
            <header className={`w-full border-b ${colors.borderLight} py-1.5 px-2.5 md:py-2 md:px-3 flex flex-row items-center justify-between gap-2 bg-black/40 backdrop-blur rounded border shrink-0`}>
              <div className="flex items-center gap-2 md:gap-3">
                <TerminalSquare className={`w-5 h-5 md:w-6 md:h-6 ${colors.text} shrink-0`} />
                <div className="min-w-0">
                  <h1 className={`text-sm md:text-lg font-bold tracking-wider ${colors.text} truncate`}>
                    <GlitchResolveText text="SENSO" duration={600} continuousGlitch={true} />
                  </h1>
                  <p className="text-[9px] md:text-[10px] text-white/50 font-mono tracking-wider md:tracking-widest truncate hidden sm:block">
                    <GlitchResolveText text="Devloper | Artist | Musician" duration={700} delay={100} continuousGlitch={true} />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFileTree(!showFileTree)}
                  className={`lg:hidden px-2 py-1 text-[9px] md:text-[10px] border tracking-wider font-bold rounded cursor-none transition-all flex items-center gap-1 bg-black/50 ${
                    showFileTree
                      ? `${colors.bg} ${colors.border} ${colors.text}`
                      : 'border-white/10 hover:border-emerald-500/40 text-white/60'
                  }`}
                  title="Toggle Explorer"
                >
                  <Folder className="w-3 h-3" />
                  <span>[ {showFileTree ? 'CLOSE' : 'TREE'} ]</span>
                </button>

                <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-white/10">
                  <span className="text-[9px] text-white/50 tracking-wider hidden sm:inline uppercase mr-1">PHOSPHOR:</span>
                  <button
                    onClick={() => changeTheme('green')}
                    className={`px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] border tracking-wider font-bold rounded cursor-none transition-all ${
                      terminalTheme === 'green'
                        ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]'
                        : 'border-white/10 hover:border-emerald-500/40 text-white/60'
                    }`}
                  >
                    GREEN
                  </button>
                  <button
                    onClick={() => changeTheme('amber')}
                    className={`px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] border tracking-wider font-bold rounded cursor-none transition-all ${
                      terminalTheme === 'amber'
                        ? 'bg-[#ffb000]/20 border-[#ffb000] text-[#ffb000]'
                        : 'border-white/10 hover:border-amber-500/40 text-white/60'
                    }`}
                  >
                    AMBER
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3 items-stretch overflow-hidden relative">
              
              {showFileTree && (
                <div 
                  className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
                  onClick={() => setShowFileTree(false)}
                />
              )}

              <section className={`
                ${showFileTree ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                fixed lg:static top-0 left-0 z-40 h-full lg:h-auto w-72 lg:w-auto
                lg:col-span-1 border ${colors.borderLight} rounded bg-black/95 lg:bg-black/75 p-3 flex flex-col justify-between overflow-y-auto min-h-0 transition-transform duration-300 shadow-[0_0_40px_rgba(0,0,0,0.95)] lg:shadow-none
              `}>
                <div>
                  <div className={`flex items-center justify-between border-b ${colors.borderLight} pb-2 mb-4 text-xs font-bold tracking-widest uppercase`}>
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-sky-400" />
                      <span>File System Tree</span>
                    </div>
                    <button
                      onClick={() => setShowFileTree(false)}
                      className="lg:hidden text-white/40 hover:text-white cursor-none font-bold text-[10px]"
                    >
                      [X]
                    </button>
                  </div>

                  <nav className="space-y-4 font-mono text-xs">
                    <div>
                      <button 
                        onClick={() => toggleFolder('profile')}
                        className="flex items-center gap-1.5 font-bold hover:text-white cursor-none w-full text-left py-1"
                      >
                        {expandedFolders['profile'] ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-500" />}
                        <span><GlitchResolveText text="profile/" duration={500} /></span>
                      </button>
                      
                      {expandedFolders['profile'] && (
                        <div className="pl-6 border-l border-white/10 ml-2 mt-1 space-y-1">
                          <button 
                            onClick={() => handleFileClick('about')}
                            className="flex items-center gap-1.5 text-white/50 hover:text-white py-1 font-mono cursor-none w-full text-left transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                            <span><GlitchResolveText text="about_me.md" duration={500} /></span>
                          </button>
                          <button 
                            onClick={() => handleFileClick('education')}
                            className="flex items-center gap-1.5 text-white/50 hover:text-white py-1 font-mono cursor-none w-full text-left transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />
                            <span><GlitchResolveText text="education.json" duration={500} /></span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <button 
                        onClick={() => toggleFolder('work')}
                        className="flex items-center gap-1.5 font-bold hover:text-white cursor-none w-full text-left py-1"
                      >
                        {expandedFolders['work'] ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-500" />}
                        <span><GlitchResolveText text="work/" duration={500} /></span>
                      </button>
                      
                      {expandedFolders['work'] && (
                        <div className="pl-6 border-l border-white/10 ml-2 mt-1 space-y-1">
                          <button 
                            onClick={() => handleFileClick('projects')}
                            className="flex items-center gap-1.5 text-white/50 hover:text-white py-1 font-mono cursor-none w-full text-left transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                            <span><GlitchResolveText text="projects.json" duration={500} /></span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <button 
                        onClick={() => toggleFolder('social')}
                        className="flex items-center gap-1.5 font-bold hover:text-white cursor-none w-full text-left py-1"
                      >
                        {expandedFolders['social'] ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-500" />}
                        <span><GlitchResolveText text="social/" duration={500} /></span>
                      </button>
                      
                      {expandedFolders['social'] && (
                        <div className="pl-6 border-l border-white/10 ml-2 mt-1 space-y-1">
                          <button 
                            onClick={() => handleFileClick('contact')}
                            className="flex items-center gap-1.5 text-white/50 hover:text-white py-1 font-mono cursor-none w-full text-left transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#39ff14]/80 shrink-0" />
                            <span><GlitchResolveText text="contact.env" duration={500} /></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </nav>
                </div>

                <div className={`mt-6 pt-4 border-t ${colors.borderLight} text-xs font-mono space-y-4`}>
                  <div>
                    <div className={`font-bold ${colors.text} tracking-widest uppercase mb-2 flex items-center gap-1.5 text-[11px]`}>
                      <TerminalIcon className="w-3.5 h-3.5" />
                      <span>Console Commands</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { cmd: 'clear', desc: 'Flush output logs' },
                        { cmd: 'about', desc: 'Bio & tech stack' },
                        { cmd: 'education', desc: 'Academic background' },
                        { cmd: 'projects', desc: 'Sync live repos' },
                        { cmd: 'contact', desc: 'Email & social keys' },
                      ].map(({ cmd, desc }) => (
                        <button
                          key={cmd}
                          onClick={() => handleFileClick(cmd)}
                          className="flex items-center justify-between w-full text-left py-1 text-[10px] text-white/70 hover:text-white hover:bg-white/5 px-1.5 rounded transition-all group cursor-none border border-transparent hover:border-white/5"
                        >
                          <span className="flex items-center gap-1">
                            <ChevronRight className={`w-2.5 h-2.5 text-white/20 group-hover:${colors.text} transition-colors`} />
                            <span className="font-semibold">{cmd}</span>
                          </span>
                          <span className="text-[9px] text-white/40 group-hover:text-white/60">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section 
                onClick={focusTerminalInput}
                className={`lg:col-span-3 border ${colors.border} rounded bg-black/90 p-3 md:p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.8)] relative cursor-text h-full min-h-0 bg-scanlines`}
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none rounded-full" />
                
                <div className="flex flex-1 overflow-hidden relative mb-4">
                  <div 
                    ref={logContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto space-y-3 pr-3 select-text no-scrollbar scroll-smooth"
                  >
                    <AnimatePresence initial={false}>
                      {outputLines.map((line) => (
                        <motion.div
                          key={line.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="font-mono text-[10px] sm:text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words"
                        >
                          {line.type === 'input' && (
                            <div className="font-bold text-[#e9d5ff] bg-purple-950/20 py-2 md:py-2.5 pl-3 pr-2 border-l-2 border-[#bc13fe] rounded-r my-3 whitespace-pre-wrap break-words select-text">
                              {renderResponsiveLine(line.text, line.type, line.id)}
                            </div>
                          )}

                          {line.type === 'output' && (
                            <div className="text-white/80 opacity-90 pl-2.5 md:pl-3 border-l border-white/5">
                              {renderResponsiveLine(line.text, line.type, line.id)}
                            </div>
                          )}

                          {line.type === 'success' && (
                            <div className={`${colors.text} font-medium pl-2.5 md:pl-3 border-l ${colors.borderLight}`}>
                              {renderResponsiveLine(line.text, line.type, line.id)}
                            </div>
                          )}

                          {line.type === 'error' && (
                            <div className="text-red-500 font-bold pl-2.5 md:pl-3 border-l border-red-500/20">
                              {renderResponsiveLine(line.text, line.type, line.id)}
                            </div>
                          )}

                          {line.type === 'info' && (
                            <div className="text-sky-400 font-medium pl-2.5 md:pl-3 border-l border-sky-500/20">
                              {renderResponsiveLine(line.text, line.type, line.id)}
                            </div>
                          )}

                          {line.type === 'loading' && (
                            <div className="pl-2.5 md:pl-3 border-l border-yellow-500/20">
                              <RetroProgressBar duration={line.duration || 1000} text={line.text} colors={colors} />
                            </div>
                          )}

                          {line.type === 'repos' && line.repos && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3 py-1 select-none">
                              {line.repos.map((repo, idx) => (
                                <motion.a
                                  key={repo.name + idx}
                                  href={repo.html_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                                  className={`border ${colors.borderLight} hover:border-white/20 bg-black/40 backdrop-blur-sm rounded p-3 flex flex-col justify-between hover:bg-white/5 transition-all h-36 relative group cursor-none`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                      <div className="flex items-center gap-1.5 font-bold text-white truncate text-[13px] md:text-sm group-hover:text-white/100">
                                        <FolderOpen className={`w-4 h-4 ${colors.text} shrink-0`} />
                                        <span className="truncate group-hover:underline">{repo.name}</span>
                                      </div>
                                      <span className="text-[10px] bg-white/10 text-white/75 px-1.5 py-0.5 rounded font-mono shrink-0">
                                        {repo.language || 'Mixed'}
                                      </span>
                                    </div>

                                    <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed font-mono mb-2">
                                      {repo.description || 'No description provided.'}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] font-mono text-white/40">
                                    <div className="flex items-center gap-2.5">
                                      <span className="flex items-center gap-0.5 hover:text-yellow-400 transition-colors">
                                        <Star className="w-3 h-3 text-yellow-500/80" />
                                        {repo.stargazers_count}
                                      </span>
                                      <span className="flex items-center gap-0.5 hover:text-cyan-400 transition-colors">
                                        <GitFork className="w-3 h-3" />
                                        {repo.forks_count}
                                      </span>
                                    </div>
                                    <span className="flex items-center gap-1 text-white/40 group-hover:text-white/80 transition-colors">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </span>
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={terminalBottomRef} />
                  </div>

                  <div className="flex flex-col items-center justify-between font-mono text-xs select-none ml-2 border-l border-white/5 pl-2 h-full w-4 text-center shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (logContainerRef.current) {
                          logContainerRef.current.scrollBy({ top: -100, behavior: 'smooth' });
                        }
                      }}
                      className={`hover:${colors.text} active:scale-90 transition-all text-white/40 cursor-none pb-1 font-bold`}
                      title="Scroll Up"
                    >
                      ▲
                    </button>

                    <div className="flex-1 flex flex-col justify-around leading-none text-white/20 text-[10px] my-1 font-bold">
                      {Array.from({ length: 14 }).map((_, idx) => {
                        const TRACK_SIZE = 14;
                        const { scrollTop, scrollHeight, clientHeight } = scrollStats;
                        const maxScroll = scrollHeight - clientHeight;
                        const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
                        const thumbIndex = maxScroll > 0 ? Math.min(Math.round(scrollRatio * (TRACK_SIZE - 1)), TRACK_SIZE - 1) : 0;
                        const isThumb = idx === thumbIndex;
                        return (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (logContainerRef.current) {
                                const el = logContainerRef.current;
                                const targetScroll = (idx / (TRACK_SIZE - 1)) * (el.scrollHeight - el.clientHeight);
                                el.scrollTo({ top: targetScroll, behavior: 'smooth' });
                              }
                            }}
                            className={`cursor-none leading-none focus:outline-none select-none transition-colors duration-150 ${isThumb ? colors.text : 'hover:text-white/60'}`}
                          >
                            {isThumb ? '█' : '░'}
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (logContainerRef.current) {
                          logContainerRef.current.scrollBy({ top: 100, behavior: 'smooth' });
                        }
                      }}
                      className={`hover:${colors.text} active:scale-90 transition-all text-white/40 cursor-none pt-1 font-bold`}
                      title="Scroll Down"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <div className={`border-t ${colors.borderLight} pt-3 flex items-center gap-2 text-xs md:text-sm`}>
                  <span className={`font-bold ${colors.text} shrink-0 select-none`}>
                    <span className="hidden sm:inline">visitor@senso:</span>~$
                  </span>
                  
                  <div className="flex-1 relative flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isExecuting}
                      className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-white font-mono placeholder-white/20 select-text cursor-text relative z-10 font-bold"
                      placeholder={isExecuting ? "Processing, please wait..." : "Type a command (e.g. 'help', 'about')..."}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                    
                    {commandInput && getSuggestion() && !isExecuting && (
                      <span className="absolute left-0 pointer-events-none text-white/25 font-mono select-none">
                        <span className="text-transparent">{commandInput}</span>
                        {getSuggestion()}
                      </span>
                    )}
                    
                    {commandInput === '' && !isExecuting && (
                      <span className={`absolute left-0 w-2 h-4 ${colors.cursor} terminal-cursor pointer-events-none opacity-85`} />
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-white/30 hidden sm:inline select-none uppercase">
                    UTF-8 | TS-SHELL
                  </span>
                </div>
              </section>

            </main>

            <footer className={`w-full border-t ${colors.borderLight} py-2 px-3 flex items-center justify-center text-[10px] md:text-[11px] text-white/50 bg-black/30 rounded border shrink-0 font-mono tracking-wide italic`}>
              <GlitchResolveText text="Who I am is where I stand, and where I stand is where I fall." duration={1000} />
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
