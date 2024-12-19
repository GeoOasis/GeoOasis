import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { VitePWA } from "vite-plugin-pwa";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

const cesiumSource = "node_modules/cesium/Build/Cesium";

const cesiumBaseUrl = "cesiumStatic";

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`)
    },
    plugins: [
        vue(),
        wasm(),
        topLevelAwait(),
        viteStaticCopy({
            targets: [
                { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl }
            ]
        }),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                maximumFileSizeToCacheInBytes: 2097152 * 3,
                globPatterns: ["**/*.{js,wasm,css,html,json,png,jpg,xml,svg}"]
            },
            devOptions: {
                enabled: false
            }
        })
    ],
    optimizeDeps: {
        exclude: ["rust-wasm-heatmap"]
    }
});
