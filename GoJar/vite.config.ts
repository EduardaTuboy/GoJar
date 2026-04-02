import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  optimizeDeps: {
    include: ['apexcharts', 'react-apexcharts']
  },
  server: {
    // Adicione esta parte de headers:
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    }
  },
})
