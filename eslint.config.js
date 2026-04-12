// @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  {
    ignores: ["eslint.config.js", "prettier.config.js", "vite.config.ts"],
  },
  ...tanstackConfig,
  {
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      "simple-import-sort": simpleImportSort,
    },
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
    },
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "import/no-default-export": "error",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-unused-vars": "warn",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^react$", "^next"],
            ["^@"],
            ["^[a-z]"],
            ["^~"],
            ["^\\./", "^\\.\\./"],
          ],
        },
      ],
    },
  },
];
