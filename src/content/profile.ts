import type { LinkItem } from './types';

// Tone: short and punchy, like the title screen. Facts confirmed by Denis on 2026-10-30.
export const profile = {
  name: 'Denis Gaivoronskii',
  brand: 'Somchai.dev',
  role: 'Software engineer for hire',
  headline: 'From business problem to working product',
  pitch:
    'A shop, a service from scratch, or your systems finally talking to each other. I learn how your business works — then build it and ship it.',
  summary:
    'Building software since 2018. Architected an accounting-automation platform from zero, grew it to a team of 10 and still lead it. On the side I ship my own products end to end.',
  company: 'SUPO',
  targetDomain: 'somchai.dev',
  links: {
    github: 'https://github.com/SomchaiSPB',
    linkedin: 'https://www.linkedin.com/in/denis-gaivoronskii/',
    email: 'mailto:info@somchai.dev',
    telegram: 'https://t.me/s0mchai',
    website: 'https://somchai.dev',
  } satisfies Record<'github' | 'linkedin' | 'email' | 'telegram' | 'website', string>,
  emailAddress: 'info@somchai.dev',
  telegramHandle: '@s0mchai',
  quickFacts: ['Shops & services from scratch', 'Bank, payment & accounting integrations', 'Zero to production', 'Since 2018'],
  services: [
    {
      title: 'Shops & services from scratch',
      summary: 'Online shop, booking, marketplace, internal tool. Smallest useful version first, in production early, built to grow.',
    },
    {
      title: 'Integrations',
      summary: 'Banks, payments, accounting, CRM — wired together so nobody copies data by hand. Done it with Xero, CCH and GoCardless.',
    },
    {
      title: 'Rescue & automation',
      summary: 'A stuck project or a manual process in, something that runs on its own out.',
    },
  ],
  // Title-screen menu; the first item is the default cursor position.
  ctaLinks: [
    { label: 'Press start', href: '/play' },
    { label: 'Hire me', href: '/contact' },
    { label: 'See the work', href: '/#work' },
  ] satisfies LinkItem[],
};
