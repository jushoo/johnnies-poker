import { defineConfig } from "@solidjs/start/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    plugins: [vanillaExtractPlugin()],
  },
});
