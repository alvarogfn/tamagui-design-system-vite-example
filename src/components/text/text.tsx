import { StyledText } from "./text.styles";
import { TextProps } from "./text.types";

export const Text = ({ children, ...props }: TextProps) => (
  <StyledText {...props}>{children}</StyledText>
);
