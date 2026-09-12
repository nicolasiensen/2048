import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/2048/",
  test: {
    environment: "jsdom",
  },
});
