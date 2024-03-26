import { Text } from "./text";

import { render, screen } from "../../__tests__/setup";

describe("[Components]: Text", () => {
  it("renders without crash", () => {
    render(<Text>Hello World</Text>);
    const component = screen.getByText("Hello World");
    expect(component).toBeDefined();
  });
});
