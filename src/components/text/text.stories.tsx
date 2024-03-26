import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./text";

export default {
  args: {
    children: "Olá, mundo!",
  },
  argTypes: {
    children: {
      description: "Conteúdo do texto",
    },
  },
  component: Text,
  title: "Components/Text",
} satisfies Meta<typeof Text>;

type Story = StoryObj<typeof Text>;

export const StoryDefault: Story = {
  name: "Default",
  render: ({ children, ...props }) => <Text {...props}>{children}</Text>,
};
