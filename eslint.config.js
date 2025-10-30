import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "*.config.js", "*.config.ts"],
  },
  ...pluginVue.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/require-prop-types": "off",
      "vue/max-attributes-per-line": "off",
    },
  },
];
