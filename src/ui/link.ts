import type { AnchorHTMLAttributes, ComponentType } from "react";

export type LinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>;
