import { defineConfig } from "orval";

export default defineConfig({
  mira: {
    input: {
      target: "./mira-api.yaml",
    },
    hooks: {
      afterAllFilesWrite: "node ./scripts/mark-generated-openapi.mjs",
    },
    output: {
      target: "./src/api/mira.ts",
      schemas: "./src/api/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
    },
  },
});
