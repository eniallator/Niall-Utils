import { defineConfig, mergeConfig } from "vitest/config";
import process from "node:process";

const baseConfig = defineConfig({
  test: {
    watch: false,
    isolate: true,
    passWithNoTests: true,
    environment: "jsdom",
    coverage: {
      statements: 100,
      functions: 100,
      branches: 100,
      lines: 100,
      perFile: true,
      autoUpdate: true,
      enabled: true,
      reporter: ["text-summary"],
      include: ["src/**/*"],
    },
  },
});

const ciConfig = defineConfig({
  test: {
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,
  },
});

export default mergeConfig(
  baseConfig,
  process.env.NODE_ENV === "ci" ? ciConfig : {}
);
