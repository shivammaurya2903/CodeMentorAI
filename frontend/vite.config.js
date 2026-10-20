import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    server: {
      port: 5500,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          // Only proxy backend auth routes; frontend handles /auth/github/success and /auth/github/error
          bypass: (req) => {
            const url = req.url || '';
            if (url.includes('/github/success') || url.includes('/github/error')) {
              return url; // Let Vite handle these frontend routes
            }
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-ui';
              }
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
