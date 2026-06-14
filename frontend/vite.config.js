import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api -> backend (cổng 4000) để frontend gọi cùng origin khi dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
