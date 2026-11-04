import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const supabaseServerOnlyRestriction = {
  name: "supabase-server-only",
  files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
  ignores: ["src/server/**"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@supabase/supabase-js",
            message:
              "Import Supabase only from server-only modules under src/server.",
          },
          {
            name: "@supabase/ssr",
            message:
              "Import Supabase only from server-only modules under src/server.",
          },
        ],
        patterns: [
          {
            group: ["@supabase", "@supabase/*"],
            message:
              "Import Supabase only from server-only modules under src/server.",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  supabaseServerOnlyRestriction,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
