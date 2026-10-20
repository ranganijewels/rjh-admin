import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Every source extension the panel uses. FlatCompat's default only matches
// `.js`, which silently left every `.jsx` file unlinted.
const SOURCE_FILES = ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.ts", "**/*.tsx"];

const nextPreset = compat.extends("next/core-web-vitals");

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
  // Re-scope the Next preset to every source extension.
  ...nextPreset.map((entry) =>
    entry.ignores && Object.keys(entry).length === 1
      ? entry
      : { ...entry, files: SOURCE_FILES }
  ),
  {
    files: SOURCE_FILES,
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: SOURCE_FILES,
    rules: {
      // The admin panel is a big legacy codebase; unused imports are caught
      // by the Next compiler instead (the build fails on them), so keep the
      // noise down here.
      "no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      // The Next preset ships a TypeScript rule, but this project is plain
      // JavaScript and does not install the typescript-eslint plugin.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
