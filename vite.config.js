import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite configuration for a React project.
export default defineConfig({
  base: './',
  plugins: [react()],
});
