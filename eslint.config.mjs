import js from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import promisePlugin from "eslint-plugin-promise";
import * as regexpPlugin from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import * as jsoncParser from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

const tsFiles = ["sources/**/*.ts", "tests/**/*.ts"];
const jsFiles = ["*.{js,mjs,cjs}", "scripts/**/*.{js,mjs,cjs}"];
const codeFiles = [...tsFiles, ...jsFiles];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.pnp.*",
      ".yarn/**",
      "artifacts/**",
      "bundles/**",
      "coverage/**",
      "dist/**",
      "lib/**",
      "*.tgz",
    ],
  },
  {
    files: ["**/*.json"],
    languageOptions: {
      parser: jsoncParser,
    },
  },
  {
    ...packageJson.configs.recommended,
    files: ["**/package.json"],
    rules: {
      ...packageJson.configs.recommended.rules,
      "package-json/no-redundant-files": "off",
      "package-json/no-redundant-publishConfig": "off",
      "package-json/require-attribution": "off",
      "package-json/require-sideEffects": "off",
      "package-json/require-type": "off",
      "package-json/sort-collections": "off",
    },
    settings: {
      packageJson: {
        enforceForPrivate: false,
      },
    },
  },
  {
    ...js.configs.recommended,
    files: jsFiles,
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: tsFiles,
  })),
  {
    files: tsFiles,
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      "no-redeclare": "error",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-var": "warn",
      "object-shorthand": "error",
      "prefer-const": "warn",
      "prefer-template": "error",
    },
  },
  {
    files: codeFiles,
    plugins: {
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "import/no-cycle": "error",
      "import/no-deprecated": "warn",
      "import/no-unresolved": "error",
    },
  },
  {
    files: codeFiles,
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-exports": "off",
      "perfectionist/sort-named-imports": "off",
    },
  },
  {
    ...unicorn.configs.recommended,
    files: codeFiles,
    rules: {
      ...unicorn.configs.recommended.rules,
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      "unicorn/import-style": "off",
      "unicorn/no-array-method-this-argument": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-array-sort": "warn",
      "unicorn/no-null": "off",
      "unicorn/no-nested-ternary": "warn",
      "unicorn/prefer-single-call": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    ...sonarjs.configs.recommended,
    files: codeFiles,
    rules: {
      ...sonarjs.configs.recommended.rules,
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-nested-functions": "warn",
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/no-unused-vars": "off",
      "sonarjs/todo-tag": "warn",
    },
  },
  {
    ...regexpPlugin.configs["flat/recommended"],
    files: codeFiles,
  },
  {
    ...promisePlugin.configs["flat/recommended"],
    files: codeFiles,
  },
  {
    files: ["sources/**/*.{ts,js,mjs,cjs}", "scripts/**/*.{js,mjs,cjs}"],
    plugins: {
      security,
    },
    rules: {
      "security/detect-non-literal-regexp": "warn",
      "security/detect-object-injection": "off",
      "security/detect-unsafe-regex": "error",
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
    },
  }
);
