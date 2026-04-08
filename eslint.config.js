//  @ts-check

import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import { tanstackConfig } from "@tanstack/eslint-config";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  ...tanstackConfig,
  {
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      "simple-import-sort": simpleImportSort,
    },
  },
  {
    languageOptions: {
      parser: tseslintParser,
    },
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
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
  {
    ignores: ["eslint.config.js", "prettier.config.js"],
  },
];
