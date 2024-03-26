import { TamaguiProvider, TamaguiProviderProps, Theme } from "@tamagui/core";
import { PropsWithChildren } from "react";
import appConfig from "./tamagui.config";

type ThemeProviderProps = PropsWithChildren<TamaguiProviderProps>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <TamaguiProvider config={appConfig} {...props}>
      <Theme>{children}</Theme>
    </TamaguiProvider>
  );
}
