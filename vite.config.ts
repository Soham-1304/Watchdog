import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.FIGMA ? Number(process.env.PORT) : 5173,
    host: process.env.FIGMA ? (process.env.FIGMA_DEV_SERVER_HOST || "0.0.0.0") : undefined,
    strictPort: Boolean(process.env.FIGMA),
    proxy: {
      '/api/v1': {
        target: process.env.CUTAWAY_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
