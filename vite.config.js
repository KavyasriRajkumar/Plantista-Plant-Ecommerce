import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Plantista client.
// Uses the standard React plugin; no extra aliasing needed since we
// keep imports relative and shallow within src/.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
