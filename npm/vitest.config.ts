import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      // json-summary drives the coverage badge in CI; text is for local readability.
      reporter: ["text", "json-summary"],
      include: ["src/**/*.ts"],
      // Generated schema and tests aren't meaningful coverage targets.
      exclude: ["src/schema.gen.ts", "src/**/*.test.ts"],
    },
  },
});
