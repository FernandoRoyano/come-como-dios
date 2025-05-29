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
      // Deshabilitar reglas de variables no utilizadas
      "@typescript-eslint/no-unused-vars": "off",
      // Deshabilitar reglas de expresiones no utilizadas
      "@typescript-eslint/no-unused-expressions": "off",
      // Deshabilitar reglas estrictas para imports en Node.js
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    },
    ignorePatterns: ["src/generated/prisma/**/*"], // Ignorar archivos generados por Prisma
  },
];

export default eslintConfig;
