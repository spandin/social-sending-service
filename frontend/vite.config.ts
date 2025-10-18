import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), basicSsl()],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
});
