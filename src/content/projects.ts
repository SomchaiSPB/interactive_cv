import type { Project } from './types';

export const projects: Project[] = [
  {
    title: 'Backend Reliability Platform',
    summary: 'Stabilized a payment and reconciliation backend by improving idempotency, retry handling, and operator visibility.',
    problem: 'The system needed to process real money flows without losing traceability when services or vendors misbehaved.',
    impact: 'Reduced incident noise and made failure recovery explainable for both engineers and stakeholders.',
    technologies: ['Go', 'PostgreSQL', 'Redis', 'Observability'],
    checkpointId: 'production-black-hole',
  },
  {
    title: 'Integration Orchestration Layer',
    summary: 'Connected several external business systems behind a single operational model.',
    problem: 'Each vendor had different payload rules, retry semantics, and failure modes.',
    impact: 'Kept sync workflows predictable while reducing manual intervention and hidden data drift.',
    technologies: ['HubSpot', 'Xero', 'CCH', 'NetSuite', 'GoCardless'],
    checkpointId: 'integration-swamp',
  },
  {
    title: 'P2P Messenger Prototype',
    summary: 'Explored a WebRTC-based messenger with file sharing and signaling coordination.',
    problem: 'Real-time connectivity and file transfer required a reliable signaling flow and fallback handling.',
    impact: 'Validated the technical shape for a lightweight peer-to-peer user experience.',
    technologies: ['WebRTC', 'P2P', 'Realtime', 'Go'],
    checkpointId: 'webrtc-signal-tower',
  },
  {
    title: 'Video Summaries Pipeline',
    summary: 'Experimented with turning video into searchable text and lightweight story points.',
    problem: 'Raw media was not useful to product teams without extraction and structure.',
    impact: 'Created a foundation for content understanding and downstream knowledge retrieval.',
    technologies: ['Transcription', 'LLM tooling', 'Pipeline design'],
    checkpointId: 'video-observatory',
  },
];

