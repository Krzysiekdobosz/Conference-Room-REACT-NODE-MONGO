import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The demo build is published to GitHub Pages under /<repo-name>/.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'demo' ? '/Conference-Room-REACT-NODE-MONGO/' : '/',
  test: {
    environment: 'jsdom',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
}));
