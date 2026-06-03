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
  connectedTo?: string[];
  interactionRadius?: number;
  unlockedByDefault?: boolean;
  pathOrder?: number;
  branchOf?: string;
};

export type Project = {
  title: string;
  summary: string;
  problem: string;
  whatBuilt: string;
  stack: string[];
  status: string;
  visibility: 'public' | 'private' | 'internal';
  checkpointId?: string;
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
