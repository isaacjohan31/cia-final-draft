import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // load env variables to pick up PORT if needed
    const env = loadEnv(mode, process.cwd(), '');
    const backendPort = env.SERVER_PORT || env.PORT || '5069';

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    target: `http://localhost:${backendPort}`,
                    changeOrigin: true,
                }
            }
        }
    };
});
