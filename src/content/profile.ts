import type { LinkItem } from './types';

export const profile = {
  name: 'Denis Gaivoronskii',
  role: 'VP of Engineering / Go Backend Engineer / Team Lead',
  headline: 'Backend Odyssey',
  pitch:
    'I build backend systems that survive production pressure: payments, integrations, reconciliation, observability, and the team structures that keep delivery moving.',
  summary:
    'A hands-on engineering leader with a Go-first backend background, production incident experience, and a track record of improving reliability in data-heavy systems.',
  cvLink: '/cv',
  links: {
    github: 'https://github.com/denis-gaivoronskii',
    linkedin: 'https://www.linkedin.com/in/denis-gaivoronskii/',
    email: 'mailto:denis.gaivoronskii@example.com',
  } satisfies Record<'github' | 'linkedin' | 'email', string>,
  quickFacts: [
    'Go backend systems',
    'Distributed integrations',
    'PostgreSQL / Redis / AWS',
    'Reconciliation and reliability',
  ],
  ctaLinks: [
    { label: 'Explore Journey', href: '/#journey' },
    { label: 'View Classic CV', href: '/cv' },
    { label: 'GitHub', href: 'https://github.com/denis-gaivoronskii', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/denis-gaivoronskii/', external: true },
  ] satisfies LinkItem[],
};

