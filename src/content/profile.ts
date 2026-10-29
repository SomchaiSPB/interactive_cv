import type { LinkItem } from './types';

// Draft copy — final wording pending from Denis.
export const profile = {
  name: 'Denis Gaivoronskii',
  brand: 'Somchai.dev',
  role: 'Software engineer for hire · VP Engineering',
  headline: 'From business problem to working product',
  pitch:
    'Need an online shop, a service built from scratch, or an integration between the systems you already use? I learn how your business works, then build it and take it to production.',
  summary:
    'Years of building backend-heavy products. As VP of Engineering at an accounting-services company I automate financial workflows across CCH, Xero and GoCardless. I also build and run my own products end to end.',
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
  quickFacts: ['Online shops & services', 'Payment & accounting integrations', 'MVP to production', 'Long-term support'],
  services: [
    {
      title: 'Shops and services from scratch',
      summary: 'An online shop, booking system, marketplace or internal tool — scoped small, launched fast, built to grow.',
    },
    {
      title: 'Integrations',
      summary: 'Connect payments, banks, accounting and CRM systems so data stops being copied by hand.',
    },
    {
      title: 'Rescue and automation',
      summary: 'Take over a stuck project or a manual process and turn it into something that runs on its own.',
    },
  ],
  // Title-screen menu; the first item is the default cursor position.
  ctaLinks: [
    { label: 'Press start', href: '/play' },
    { label: 'Hire me', href: '/contact' },
    { label: 'See the work', href: '/#work' },
  ] satisfies LinkItem[],
};
