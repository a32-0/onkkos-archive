import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { APP } from "@/content/app";
import "@/ui/tokens.css";

import { fontVariables } from "./fonts";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: { default: APP.name, template: `%s · ${APP.name}` },
  description: APP.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
