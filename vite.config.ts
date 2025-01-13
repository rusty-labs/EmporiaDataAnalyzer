import { defineConfig } from 'vite';
import { ghPages } from 'vite-plugin-gh-pages';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/EmporiaDataAnalyzer/', // Adjust base URL if required
  plugins: [ghPages()],
});
