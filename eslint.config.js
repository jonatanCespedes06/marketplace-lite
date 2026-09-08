import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import js from "eslint/js";
import prettier from "eslint-config-prettier";

const files = ["**/*.{ts,tsx,js,jsx}", "!**/*.config.*"];

export default [
  { files, ...js.configs.recommended },
  { files, ...tseslint.configs.recommended },
  {
    files,
    ignores: ["dist/**", "node_modules/**", ".turbo/**", "coverage/**", "*.config.*"],
  },
  {
    files,
    plugins: {
      "@typescript-eslint": tseslint,
      js,
    },
    rules: {
      ...prettier,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "consistent-type-imports": "error",
      "no-explicit-any": "warn",
    },
  },
];