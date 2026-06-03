import type { SkillGroup } from './types';

export const skills: SkillGroup[] = [
  {
    title: 'Backend',
    items: ['Go', 'gRPC', 'REST APIs', 'Microservices', 'PHP', 'Laravel', 'Java'],
  },
  {
    title: 'Databases & Reporting',
    items: ['PostgreSQL', 'MSSQL', 'Redis', 'Materialized views', 'SQL reporting', 'Ledgers', 'Batch jobs'],
  },
  {
    title: 'Integrations',
    items: ['HubSpot', 'Xero', 'CCH', 'NetSuite', 'GoCardless', 'iCal', 'XML templates'],
  },
  {
    title: 'Infrastructure',
    items: ['Docker', 'AWS', 'RabbitMQ', 'Kafka', 'Jenkins', 'Ansible', 'Linux', 'VPN'],
  },
  {
    title: 'Observability',
    items: ['Prometheus', 'Grafana', 'ELK', 'Logging', 'Metrics', 'Operational debugging'],
  },
  {
    title: 'Security & Policy',
    items: ['OPA', 'Rego', 'Dynamic access control', 'Authorization', 'Policy as code'],
  },
  {
    title: 'AI-assisted Engineering',
    items: ['Analysis', 'Debugging', 'Task decomposition', 'Test planning', 'Documentation', 'Implementation acceleration'],
  },
  {
    title: 'Frontend / Mobile',
    items: ['Astro', 'React', 'TypeScript', 'TailwindCSS', 'Flutter', 'Brotli', 'Meilisearch', 'Sphinx'],
  },
];

