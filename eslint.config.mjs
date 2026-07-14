import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "site/**", ".cache/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
    }
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
    }
  },
  {
    files: ["scripts/.agents/**/*.js", "scripts/lib/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      sourceType: "commonjs"
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-redeclare": "off",
      "no-control-regex": "off"
    }
  }
];
