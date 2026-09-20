import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { spinIpLimitPlugin } from "./server/spinIpLimitPlugin.ts";

export default defineConfig({
  plugins: [react(), spinIpLimitPlugin()],
});
