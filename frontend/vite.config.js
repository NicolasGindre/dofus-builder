import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        viteCompression({ algorithm: "gzip" }),
        viteCompression({ algorithm: "brotliCompress" }),
    ],
    assetsInclude: ["**/*.wasm", "**/*.md"],
    build: {
        outDir: "dist",
    },
    server: {
        proxy: {
            "/api": "http://localhost:8081",
        },
    },
});
