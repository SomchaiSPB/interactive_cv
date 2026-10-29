import type { Project } from './types';

// Facts confirmed by Denis on 2026-10-30. The client group is not named until the CEO approves.
export const projects: Project[] = [
  {
    title: 'Found up to 30% of lost gross profit',
    summary: 'Profit analytics for accounting practices: which contracts quietly lose money, and why.',
    problem: 'Firms billed fixed fees but could not see which contracts were eaten by write-offs.',
    whatBuilt:
      'Architected and built the whole backend from zero as the only engineer: data model, ingestion from practice-management systems, queues, profitability analytics.',
    result: 'Clients found losses on their contracts and recovered up to 30% of gross profit.',
    stack: ['Go', 'PostgreSQL', 'MSSQL', 'Kubernetes'],
    status: 'In production',
    visibility: 'internal',
    checkpointId: 'finance-automation',
  },
  {
    title: 'Halved manual bank reconciliation',
    summary: 'Bank-feed transactions matched to CCH invoices for an accounting group with 50+ offices in the UK and Ireland.',
    problem: 'A team of 30–40 people matched bank transactions to invoices by hand.',
    whatBuilt:
      'Reconciliation engine with match predictions, partial and reversed payments, a data audit against CCH’s MSSQL, and consolidated Xero + CCH reporting. Reverse-engineered dozens of undocumented CCH tables. Led the team at its peak of 10 engineers.',
    result: 'Manual reconciliation effort cut roughly in half, and reconciliation runs faster. The client is happy.',
    stack: ['CCH', 'Xero', 'GoCardless', 'Go', 'MSSQL'],
    status: 'In production',
    visibility: 'internal',
    checkpointId: 'finance-automation',
  },
  {
    title: 'tldw.cloud — ask your video anything',
    summary: 'Upload a long recording, ask a question, get an answer that links to the exact moment.',
    problem: 'Hours of meetings and lectures are hard to search, reuse or trust a summary of.',
    whatBuilt:
      'Solo, end to end: upload and link ingestion, transcription, visual analysis, chapters, chat with cited timestamps, accounts and plans, hosting.',
    result: 'Running in private beta; public launch once payments are connected.',
    stack: ['Go', 'PostgreSQL', 'Docker'],
    status: 'Private beta',
    visibility: 'public',
    links: [{ label: 'tldw.cloud', href: 'https://tldw.cloud', external: true }],
    image: { src: '/work/tldw.webp', alt: 'tldw.cloud conversation: video chapters, an answer with timestamped citations, and the transcript' },
    checkpointId: 'tldw',
  },
  {
    title: 'Zapros.ge — request first, offers next',
    summary: 'Reverse rental marketplace for Tbilisi: people describe what they need, owners send offers.',
    problem: 'Renters scroll stale listings for days; owners cannot see real demand.',
    whatBuilt:
      'Solo, end to end: API and web app in three languages, request and offer flows, chat, Telegram and email notifications, admin with roles and audit log, CI/CD and hosting.',
    result: 'From first commit to production-ready in about a month. Launching once payments are connected.',
    stack: ['Go', 'PostgreSQL', 'React', 'TypeScript'],
    status: 'Pre-launch',
    visibility: 'public',
    links: [{ label: 'zapros.ge', href: 'https://zapros.ge', external: true }],
    image: { src: '/work/zapros.webp', alt: 'Zapros.ge home page: request first, offers next — housing and car rental in Georgia' },
    checkpointId: 'zapros',
  },
];
