import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { tamaguiPlugin } = require("@tamagui/vite-plugin");

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tamaguiPlugin({
      components: ["@tamagui/core"],
      config: "src/themes/tamagui.config.ts",
    }),
  ],
  test: {
    deps: {
      optimizer: { web: { include: ["@tamagui"] } },
    },
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/setup-tests.ts"],
  },
});
