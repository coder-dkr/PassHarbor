import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server : {
    proxy : {
      '/api' :{ 
        target : 'https://pass-harbor-api.vercel.app',
        changeOrigin: true,
        secure: true,
        ws: true   }
     },
  }
})
