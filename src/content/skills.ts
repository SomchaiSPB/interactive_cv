import type { SkillGroup } from './types';

export const skills: SkillGroup[] = [
  {
    title: 'Backend',
    items: ['Go', 'gRPC', 'REST APIs', 'Microservices', 'Domain modeling'],
  },
  {
    title: 'Data',
    items: ['PostgreSQL', 'Redis', 'Reporting models', 'Reconciliation', 'Batch jobs'],
  },
  {
    title: 'Cloud',
    items: ['AWS', 'Docker', 'Observability', 'Retry design', 'Operational tooling'],
  },
  {
    title: 'Leadership',
    items: ['Team lead', 'Hiring', 'Delivery planning', 'Mentoring', 'Architecture review'],
  },
  {
    title: 'Applied AI',
    items: ['AI-assisted development', 'Summaries', 'Automation', 'Prompting', 'Review workflows'],
  },
];

