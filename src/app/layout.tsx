import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { APP } from "@/content/app";
import { isDemoSite } from "@/infra/edition";
import "@/ui/tokens.css";

import { fontVariables } from "./fonts";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP.url),
  applicationName: APP.name,
  title: { default: APP.name, template: `%s · ${APP.name}` },
  description: APP.summary,
  openGraph: {
    type: "website",
    siteName: APP.name,
    title: APP.name,
    description: APP.summary,
    url: "/",
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: APP.name, description: APP.summary },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: APP.ground,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={styles.body}>
        {children}
        {isDemoSite() && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
