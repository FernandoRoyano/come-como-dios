import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Deshabilitar advertencias para console.warn en desarrollo
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Permitir variables sin usar en desarrollo
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      // Deshabilitar reglas estrictas para imports en Node.js
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    },
  },
];

export default eslintConfig;
