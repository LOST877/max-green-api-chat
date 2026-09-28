import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any sub-path (e.g. GitHub Pages).
  base: './',
  // Listen on 0.0.0.0 so the dev server is reachable from outside a Docker container.
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 5173, strictPort: true },
});
