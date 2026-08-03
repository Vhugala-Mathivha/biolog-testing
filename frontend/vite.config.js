import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This fix solves the "process is not defined" error
    'process.env': {}
  },
  server: {
    port: 3000, // This makes it run on the same port CRA used to use
  }
})