import { createTamagui } from "@tamagui/core";

const config = createTamagui({
  fonts: {},
  shorthands: {},
  themes: {
    night: {
      color: "#005",
    },
    sun: {
      color: "#FA0",
    },
  },
  tokens: {
    color: {
      primary: "#000",
      secondary: "#FFF",
    },
    radius: {},
    size: {},
    space: {},
    zIndex: {},
  },
});

export default config;
