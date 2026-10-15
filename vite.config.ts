import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app.html'),
          estadisticas: path.resolve(__dirname, 'estadisticas.html'),
          normatividad: path.resolve(__dirname, 'normatividad.html'),
          recomendaciones: path.resolve(__dirname, 'recomendaciones.html'),
          decisiones: path.resolve(__dirname, 'toma-de-decisiones.html'),
          login: path.resolve(__dirname, 'login.html'),
          panelAdmin: path.resolve(__dirname, 'panel-admin.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
