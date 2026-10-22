import type { MetadataRoute } from "next";

import { APP } from "@/content/app";
import { ROUTES } from "@/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: APP.url, changeFrequency: "monthly", priority: 1 },
    { url: `${APP.url}${ROUTES.connect}`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
