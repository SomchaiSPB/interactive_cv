import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://somchai.dev',
  // Emit /projects.html instead of /projects/index.html so URLs stay slash-free behind nginx.
  build: { format: 'file' },
  trailingSlash: 'never',
  integrations: [react(), tailwind()],
});

