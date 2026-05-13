import { defineConfig } from "@solidjs/start/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  server: {
    preset: "cloudflare-durable",
    experimental: {
      websocket: true,
    },
  },
  vite: {
    plugins: [vanillaExtractPlugin()],
  },
}).addRouter({
  name: "ws",
  type: "http",
  handler: "./src/ws.ts",
  target: "server",
  base: "/ws",
});
