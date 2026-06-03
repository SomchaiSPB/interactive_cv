import type { Project } from './types';

export const projects: Project[] = [
  {
    title: 'SUPO Platform',
    summary: 'Core backend platform for operational workflows, reconciliation, and reporting at SUPO.',
    problem: 'The platform had to keep multiple business streams consistent while handling finance-grade correctness and complex operational flows.',
    whatBuilt:
      'Go services, MSSQL-backed domain logic, background jobs, reporting models, and operational tooling for internal teams.',
    stack: ['Go', 'MSSQL', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Kafka', 'gRPC', 'REST', 'Docker', 'AWS'],
    status: 'Active internal platform',
    visibility: 'internal',
    checkpointId: 'production-black-hole',
  },
  {
    title: 'CCH / NetSuite Integration',
    summary: 'Complex vendor integration layer for finance and operations with heavy MSSQL domain logic.',
    problem: 'Vendor payloads, scheduling, and business rules had to stay consistent despite legacy constraints and edge cases.',
    whatBuilt:
      'Integration services, XML template handling, dynamic policy checks, MSSQL queries, and workflow orchestration for CCH and NetSuite flows.',
    stack: ['Go', 'MSSQL', 'NetSuite', 'CCH', 'XML', 'OPA/Rego', 'REST', 'RabbitMQ'],
    status: 'Shipping / maintained',
    visibility: 'internal',
    checkpointId: 'integration-swamp',
  },
  {
    title: 'WebRTC Messenger / File Share',
    summary: 'Peer-to-peer messenger and file sharing prototype using Flutter and Go signaling.',
    problem: 'The client needed lightweight P2P coordination without turning the stack into a heavy realtime framework.',
    whatBuilt:
      'Flutter client, Go signaling backend, connection negotiation flow, and file transfer experimentation around WebRTC.',
    stack: ['Flutter', 'Go', 'WebRTC', 'Signaling', 'P2P'],
    status: 'Prototype complete',
    visibility: 'public',
    checkpointId: 'webrtc-signal-tower',
  },
  {
    title: 'Video-to-Text / Story Point Extraction',
    summary: 'Video analysis tooling that turns recordings into text and story-level summaries.',
    problem: 'Raw video was hard to search, reuse, or feed into product workflows without extraction and structure.',
    whatBuilt:
      'Transcription, segmentation, summary generation, and retrieval-oriented analysis pipelines for video content.',
    stack: ['Go', 'Text extraction', 'Transcription', 'Pipeline design'],
    status: 'Experimental prototype',
    visibility: 'private',
    checkpointId: 'video-observatory',
  },
  {
    title: 'OCR Telegram Bot',
    summary: 'Telegram bot for OCR-oriented workflows and quick text extraction from images.',
    problem: 'Users needed a lightweight way to extract text from screenshots and photos without switching tools.',
    whatBuilt:
      'Telegram bot flow, OCR integration, result formatting, and fast image-to-text handling for everyday use.',
    stack: ['Go', 'Telegram Bot API', 'OCR', 'Docker'],
    status: 'Shipped utility',
    visibility: 'public',
  },
  {
    title: 'Infrastructure / VPN / Linux Tooling',
    summary: 'Personal infrastructure experiments and utility tooling for Linux, networking, and deployment workflows.',
    problem: 'Local environments and self-hosted systems needed repeatable setup, secure access, and less manual effort.',
    whatBuilt:
      'Scripts, VPN experiments, Linux tooling, Ansible helpers, and deployment utilities for small infrastructure tasks.',
    stack: ['Linux', 'VPN', 'Ansible', 'Docker', 'SSH', 'Bash'],
    status: 'Ongoing experiments',
    visibility: 'private',
  },
];

