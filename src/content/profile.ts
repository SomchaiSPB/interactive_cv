import type { LinkItem } from './types';

export const profile = {
  name: 'Denis Gaivoronskii',
  role: 'VP of Engineering / Go Backend Engineer / Team Lead',
  headline: 'Backend Odyssey',
  pitch:
    'Engineering leader and Go backend engineer focused on backend systems, data pipelines, complex integrations, financial reconciliation, and production debugging at SUPO.',
  summary:
    'Hands-on VP Engineering building resilient backend platforms, SQL-heavy reporting systems, and vendor integrations where correctness and operability matter more than architecture theater.',
  company: 'SUPO',
  targetDomain: 'somchai.dev',
  links: {
    github: 'https://github.com/SomchaiSPB',
    linkedin: 'https://www.linkedin.com/in/denis-gaivoronskii/',
    email: 'mailto:thekrisphuket@gmail.com',
    website: 'https://somchai.dev',
  } satisfies Record<'github' | 'linkedin' | 'email' | 'website', string>,
  quickFacts: [
    'SUPO backend systems',
    'CCH + NetSuite integrations',
    'MSSQL reporting and reconciliation',
    'Go, PostgreSQL, AWS, gRPC',
  ],
  ctaLinks: [
    { label: 'Explore Journey', href: '/#journey' },
    { label: 'View Classic CV', href: '/cv' },
    { label: 'GitHub', href: 'https://github.com/SomchaiSPB', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/denis-gaivoronskii/', external: true },
  ] satisfies LinkItem[],
};

