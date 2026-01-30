import { dirname } from "path";
import { fileURLToPath } from "url";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "public/**",
      "node_modules/**",
      "docs/**",
      ".git/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["jest.setup.js"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": typescriptEslint,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["src/utils/apm/apmManager.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
