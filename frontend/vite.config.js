import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { webpPlugin } from './scripts/viteWebPPlugin.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webpPlugin({
      quality: 85,
      extensions: ['.jpg', '.jpeg', '.png'],
      inputDirs: ['src/assets', 'public']
    })
  ],
  server: {
    port: 3001,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'false'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  css: {
    devSourcemap: true
  }
});
