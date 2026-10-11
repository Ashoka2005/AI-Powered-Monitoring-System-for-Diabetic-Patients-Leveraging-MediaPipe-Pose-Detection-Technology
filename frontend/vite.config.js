import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command, mode }) => {
  const isHttps = process.env.HTTPS === 'true' || process.argv.includes('--https');

  return {
    plugins: [
      react(),
      isHttps ? basicSsl() : null,
    ].filter(Boolean),
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
