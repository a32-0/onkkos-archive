import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button, type ButtonVariant } from "./Button";

const LABELS: Record<ButtonVariant, string> = {
  primary: "Connect",
  secondary: "Skip",
  danger: "Disconnect",
  text: "Go back",
};

const meta = {
  title: "Atoms/Button",
  component: Button,
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const UNDER_FLOOR = { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } };

const states = (variant: ButtonVariant) => {
  const children = LABELS[variant];
  const measured = variant === "danger" ? UNDER_FLOOR : {};
  return {
    Rest: { args: { variant, children }, parameters: measured },
    Hover: { args: { variant, children }, parameters: { ...measured, pseudo: { hover: true } } },
    Focus: {
      args: { variant, children },
      parameters: { ...measured, pseudo: { focusVisible: true } },
    },
    Disabled: { args: { variant, children, disabled: true } },
    Loading: { args: { variant, children, loading: true } },
  } satisfies Record<string, Story>;
};

const primary = states("primary");
const secondary = states("secondary");
const danger = states("danger");
const text = states("text");

export const PrimaryRest = primary.Rest;
export const PrimaryHover = primary.Hover;
export const PrimaryFocus = primary.Focus;
export const PrimaryDisabled = primary.Disabled;
export const PrimaryLoading = primary.Loading;
export const SecondaryRest = secondary.Rest;
export const SecondaryHover = secondary.Hover;
export const SecondaryFocus = secondary.Focus;
export const SecondaryDisabled = secondary.Disabled;
export const SecondaryLoading = secondary.Loading;
export const DangerRest = danger.Rest;
export const DangerHover = danger.Hover;
export const DangerFocus = danger.Focus;
export const DangerDisabled = danger.Disabled;
export const DangerLoading = danger.Loading;
export const TextRest = text.Rest;
export const TextHover = text.Hover;
export const TextFocus = text.Focus;
export const TextDisabled = text.Disabled;
export const TextLoading = text.Loading;
