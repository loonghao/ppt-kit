import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
  // Support GitHub Pages base path via environment variable
  const basePath = process.env.VITE_BASE_PATH || '/'
  
  // Check if certs exist
  const certKeyPath = resolve(__dirname, '.cert/localhost.key')
  const certPath = resolve(__dirname, '.cert/localhost.crt')
  const hasCerts = existsSync(certKeyPath) && existsSync(certPath)
  
  return {
    base: basePath,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      https: isDev && hasCerts ? {
        key: readFileSync(certKeyPath),
        cert: readFileSync(certPath),
      } : undefined,
      allowedHosts: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
})
