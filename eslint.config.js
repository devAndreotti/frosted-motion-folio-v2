import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist",
      "dist-vps",
      ".wrangler",
      "coverage",
      "scripts/**",
      ".quality-gate/**",
      ".codex/**",
      ".claude/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      sonarjs,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // react-hooks 7 trouxe as regras do React Compiler para o recommended. O projeto não usa o compiler e os
      // pontos apontados (refs lidos no render de animações, setState em efeito de sincronização) funcionam:
      // ficam como aviso, igual ao sonarjs, em vez de reescrever 24 componentes só pela regra.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      ...Object.fromEntries(
        Object.entries(sonarjs.configs.recommended.rules).map(([rule]) => [rule, "warn"])
      ),
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
