const prettierTargets = [
  "**/*.{js,mjs,cjs,ts,tsx,json,md,yml,yaml,scss,css,html}",
];

export default {
  "apps/backend/src/**/*.ts": [
    "pnpm exec eslint --config apps/backend/eslint.config.mjs --fix",
  ],
  "apps/audio-processor/src/**/*.ts": [
    "pnpm exec eslint --config apps/audio-processor/eslint.config.mjs --fix",
  ],
  ...Object.fromEntries(
    prettierTargets.map((pattern) => [pattern, ["pnpm exec prettier --write"]]),
  ),
};
