import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    tailwindcss(),
    react(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom/vitest"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/*.a11y.test.{ts,tsx}"],
    reporters: ["default", "junit"],
    outputFile: "./junit.xml",
    coverage: {
      provider: "v8",
      reporter: ["text", "cobertura", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
