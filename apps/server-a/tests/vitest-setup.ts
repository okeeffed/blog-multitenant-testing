// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "../src/mocks/node";

// Start server before all tests
beforeAll(() => {
  server.listen({
    // If you wanted to, you could set warn here in dev mode
    onUnhandledRequest: "bypass",
  });
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});
