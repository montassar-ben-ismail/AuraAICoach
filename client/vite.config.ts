import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


const rootDir = path.dirname(fileURLToPath(import.meta.url));


export default defineConfig(({ mode }) => {
  
    const portdev=parseInt(process.env.PORTDEV||'3000',10)
    const portbuild=parseInt(process.env.PORTBUILD||'4173',10)
    return {
      server: {
        port: portdev,
        host: '0.0.0.0',
      },
      preview:{
        port:portbuild,
        host:'0.0.0.0'
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(rootDir, 'src'),
        }
      }
    };
});
