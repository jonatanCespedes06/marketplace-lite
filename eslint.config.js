import tseslint from "typescript-eslint";
import js from "@eslint/js";

const files = ["**/*.{ts,tsx,js,jsx}", "!**/*.config.*"];

export default [
  { ignores: ["**/dist/**", "node_modules/**", ".turbo/**", "coverage/**", "*.config.*"] },
  { files, ...js.configs.recommended },
  ...tseslint.configs.recommended,
  {
    files,
    ignores: ["**/dist/**", "node_modules/**", ".turbo/**", "coverage/**", "*.config.*"],
  },
  {
    files,
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];