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
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react'],
            // Feature chunks
            'feature-chat': [
              './src/components/chat/ChatWidget.jsx',
              './src/components/chat/ChatMessage.jsx',
              './src/components/chat/ChatInput.jsx',
              './src/components/chat/AnswerModeSelector.jsx',
              './src/components/chat/ContextSelector.jsx',
            ],
            'feature-review': [
              './src/components/review/ReviewWorkspace.jsx',
              './src/components/review/ScoreCard.jsx',
              './src/components/review/IssueList.jsx',
              './src/components/review/IssueCard.jsx',
              './src/components/review/RefactoredCode.jsx',
            ],
            'feature-github': [
              './src/components/github/RepositoryList.jsx',
              './src/components/github/RepositoryCard.jsx',
              './src/components/github/FileTree.jsx',
              './src/components/github/ArchitectureViewer.jsx',
              './src/components/github/GithubConnect.jsx',
            ],
            'feature-code': [
              './src/components/code/CodeEditor.jsx',
              './src/components/code/CodeViewer.jsx',
              './src/components/code/LanguageSelector.jsx',
            ],
            'feature-fixes': [
              './src/components/fixes/DiffViewer.jsx',
            ],
          },
        },
      },
    },
  };
});
