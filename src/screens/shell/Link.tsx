"use client";

import NextLink, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

import { Wait } from "./Wait";

function LinkWait() {
  return useLinkStatus().pending ? <Wait /> : null;
}

export function Link({ children, ...props }: ComponentProps<typeof NextLink>) {
  return (
    <NextLink {...props}>
      {children}
      <LinkWait />
    </NextLink>
  );
}
