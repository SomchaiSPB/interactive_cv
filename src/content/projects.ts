import type { Project } from './types';

// Draft copy — final wording and numbers pending from Denis.
export const projects: Project[] = [
  {
    title: 'Financial automation for an accounting group',
    summary: 'Integrations and reconciliation across practice-management, accounting, banking and payment systems.',
    problem: 'Staff matched bank transactions, direct-debit payments and invoices by hand across several systems.',
    whatBuilt:
      'Two-way integrations with CCH, Xero and GoCardless (Atlar next) and a reconciliation engine that links clients, payments and invoices with accounting-grade correctness. Led the engineering team as VP Engineering.',
    result: 'A large share of manual reconciliation work automated, freeing staff time across the company.',
    stack: ['Go', 'PostgreSQL', 'MSSQL', 'React', 'Kubernetes'],
    status: 'In production',
    visibility: 'internal',
    checkpointId: 'finance-automation',
  },
  {
    title: 'tldw.cloud — ask your video anything',
    summary: 'Turns long recordings into direct answers you can verify against exact moments in the source.',
    problem: 'Hours of meetings and lectures are hard to search, reuse or trust a summary of.',
    whatBuilt:
      'Built solo end to end: video upload and link ingestion, transcription, visual analysis, chat with cited moments, accounts, plans and usage limits, landing page and production hosting.',
    result: 'Live product, open by invite.',
    stack: ['Go', 'PostgreSQL', 'Docker'],
    status: 'Live',
    visibility: 'public',
    links: [{ label: 'tldw.cloud', href: 'https://tldw.cloud', external: true }],
    image: { src: '/work/tldw.webp', alt: 'tldw.cloud conversation: video chapters, an answer with timestamped citations, and the transcript' },
    checkpointId: 'tldw',
  },
  {
    title: 'Zapros.ge — rental marketplace',
    summary: 'Reverse marketplace for renting homes and cars in Tbilisi: people post a request, owners send offers.',
    problem: 'Renters waste days scrolling listings; owners cannot see real demand.',
    whatBuilt:
      'Built solo end to end: API and web app in three languages, request and offer flows, in-app chat, Telegram and email notifications, operator admin with roles and audit log, production deployment.',
    result: 'Live at zapros.ge.',
    stack: ['Go', 'PostgreSQL', 'React', 'TypeScript'],
    status: 'Live',
    visibility: 'public',
    links: [{ label: 'zapros.ge', href: 'https://zapros.ge', external: true }],
    image: { src: '/work/zapros.webp', alt: 'Zapros.ge home page: request first, offers next — housing and car rental in Georgia' },
    checkpointId: 'zapros',
  },
];
