import { tamaguiPlugin } from "@tamagui/vite-plugin";
import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  docs: {
    autodocs: true,
  },
  env: (config) => ({
    ...config,
    TAMAGUI_TARGET: "web",
  }),
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  viteFinal: (config, { configType }) => {
    config.define = {
      ...config.define,
      "process.env.NODE_ENV":
        configType === "PRODUCTION" ? "production" : "development",
      "process.env.STORYBOOK": true,
    };

    config.plugins!.push(
      tamaguiPlugin({
        config: "/src/themes/tamagui.config.ts",
      }),
      tsconfigPaths()
    );

    return config;
  },
};
export default config;
