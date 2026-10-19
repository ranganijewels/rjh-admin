import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * ESLint flat config.
 *
 * The project had no linter at all, which is how three separate
 * Rules-of-Hooks violations slipped into the codebase. `next/core-web-vitals`
 * keeps the Next.js conventions; the react-hooks plugin is what actually
 * protects the component logic.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "_archived_legacy_2026-07-04/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    // The admin panel is a big legacy codebase; the no-unused-vars rule is
    // enforced through the compiler instead (Next fails the build on unused
    // imports), so keep the noise down here.
    rules: {
      "no-unused-vars": "off",
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
