// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' //<---- use this for vue3
//import { createVuePlugin as vue } from "vite-plugin-vue2"; //<--- use this for vue2

const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                compatConfig: { MODE: 2 }
            }
        }
    })],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            vue: '@vue/compat'
        },
  },
})