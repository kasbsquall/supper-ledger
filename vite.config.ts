import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// The live site is served from https://<user>.github.io/supper-ledger/
export default defineConfig({
  base: "/supper-ledger/",
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts", "relay/**/*.test.ts"],
  },
});
