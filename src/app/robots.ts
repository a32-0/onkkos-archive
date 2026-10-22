import type { MetadataRoute } from "next";

import { APP } from "@/content/app";
import { ROUTES } from "@/routes";

const PRIVATE = [
  "/api/",
  ROUTES.features,
  ROUTES.system,
  ROUTES.catchUp,
  ROUTES.goals,
  ROUTES.item,
  ROUTES.profile,
  ROUTES.advanced,
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE },
    sitemap: `${APP.url}/sitemap.xml`,
  };
}
