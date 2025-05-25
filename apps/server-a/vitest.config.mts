import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "lcov"],
    },
    // pool: "forks",
    // poolOptions: {
    //   forks: {
    //     singleFork: true,
    //   },
    // },
    setupFiles: ["./tests/vitest-setup.ts"],
  },
});
