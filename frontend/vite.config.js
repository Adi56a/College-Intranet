import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // server: {
  //   host: '172.16.1.62',   // Replace with your system's IP address
  //   port: 5173,            // Set the desired port
  //   strictPort: true,      // Ensure that the port is strictly used (if 5173 is taken, it will fail)
  // },
})
4