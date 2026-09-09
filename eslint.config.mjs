import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next/dev/**",
      "out/**",
      "build/**",
      "dist/**",
    ],
  },
  ...nextCoreWebVitals,
]

export default config
