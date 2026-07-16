export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  extendedDescription?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
  featured?: boolean;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'repos' | 'loading';
  text: string;
  duration?: number;
  timestamp?: string;
  repos?: GithubRepo[];
}

export interface GithubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}
