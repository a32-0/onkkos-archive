import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "screens", pattern: "src/screens" },
        { type: "ui", pattern: "src/ui" },
        { type: "domain", pattern: "src/domain" },
        { type: "infra", pattern: "src/infra" },
        { type: "content", pattern: "src/content" },
      ],
      "boundaries/files": [
        { category: "routes", pattern: "src/routes.ts" },
        { category: "proxy", pattern: "src/proxy.ts" },
        { category: "tokens", pattern: "src/ui/tokens.css" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          checkAllOrigins: true,
          policies: [
            { allow: { to: { module: { origin: ["external", "core"] } } } },
            {
              from: { element: { type: ["domain", "ui"] } },
              disallow: { to: { module: { origin: "external", source: ["next", "server-only"] } } },
            },
            {
              from: { element: { type: "domain" } },
              disallow: { to: { module: { origin: "external", source: "react" } } },
            },
            {
              from: { element: { type: "domain" } },
              disallow: { to: { module: { origin: "core" } } },
            },
            {
              from: { element: { type: "app" } },
              allow: {
                to: { element: { type: ["app", "screens", "domain", "infra", "content"] } },
              },
            },
            {
              from: { element: { type: "screens" } },
              allow: { to: { element: { type: ["screens", "ui", "content"] } } },
            },
            {
              from: { element: { type: "screens" } },
              allow: { to: { element: { type: "domain" } }, dependency: { kind: "type" } },
            },
            { from: { element: { type: "ui" } }, allow: { to: { element: { type: "ui" } } } },
            {
              from: { element: { type: "domain" } },
              allow: { to: { element: { type: "domain" } } },
            },
            {
              from: { element: { type: "infra" } },
              allow: { to: { element: { type: ["infra", "domain"] } } },
            },
            {
              from: { element: { type: "content" } },
              allow: { to: { element: { type: "content" } } },
            },
            {
              from: { element: { type: ["app", "screens"] } },
              allow: { to: { file: { categories: "routes" } } },
            },
            {
              from: { element: { type: "app" } },
              allow: { to: { file: { categories: "tokens" } } },
            },
            {
              from: { file: { categories: "proxy" } },
              allow: { to: { element: { type: ["infra", "domain"] } } },
            },
            {
              from: { file: { categories: "proxy" } },
              allow: { to: { file: { categories: "routes" } } },
            },
          ],
        },
      ],
    },
  },
]);
