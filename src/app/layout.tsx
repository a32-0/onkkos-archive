import type { ReactNode } from "react";

import "@/ui/tokens.css";

import { fontVariables } from "./fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
