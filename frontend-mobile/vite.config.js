// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'

const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        mkcert()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: { https: true },
    build: {
        chunkSizeWarningLimit: 1000
    }
})