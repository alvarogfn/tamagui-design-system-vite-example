import {
  queries,
  Queries,
  render as nativeRender,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { TamaguiProvider } from "@tamagui/core";
import { ReactElement } from "react";
import config from "../themes/tamagui.config";

const render = <
  Q extends Queries = typeof queries,
  Container extends DocumentFragment | Element = HTMLElement,
  BaseElement extends DocumentFragment | Element = Container,
>(
  ui: ReactElement,
  renderOptions?: RenderOptions<Q, Container, BaseElement>
): RenderResult<Q, Container, BaseElement> =>
  nativeRender(<TamaguiProvider config={config}>{ui}</TamaguiProvider>, {
    ...renderOptions,
  });

export * from "@testing-library/react";
export { render };
