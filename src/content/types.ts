export type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type CheckpointSide = 'left' | 'right' | 'center';

export type Checkpoint = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  summary: string;
  details: string[];
  technologies: string[];
  side: CheckpointSide;
  position: {
    x: number;
    y: number;
  };
};

export type Project = {
  title: string;
  summary: string;
  problem: string;
  impact: string;
  technologies: string[];
  checkpointId?: string;
  link?: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type EducationItem = {
  institution: string;
  program: string;
  period: string;
  notes: string[];
};

