import { defineConfig } from "rolldown";

// One ES module for Cloudflare Workers: npm run relay:build, then upload relay/dist/worker.js.
export default defineConfig({
  input: "relay/worker.ts",
  platform: "neutral",
  output: { file: "relay/dist/worker.js", format: "esm" },
});
