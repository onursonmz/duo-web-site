import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "coverage/**",
      "discovery/**",
      "duosis_web_sitesi_planlamasi/**",
      "evidence/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-recommended"],
  {
    files: ["**/*.{ts,mts,astro}"],
    rules: {
      // Kullanılmayan değişkenler hata; "_" öneki bilinçli kaçış.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Yapılandırma dosyaları ve testler Node ortamında çalışır.
    // `globals` paketi eklemek yerine yalnızca gerçekten kullanılan
    // global'ler tanımlanıyor (bağımlılık disiplini).
    files: ["tests/**/*.ts", "*.config.ts", "*.config.mjs", "eslint.config.js"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  prettier
);
