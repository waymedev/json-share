import { config } from "@vue/test-utils";
import { afterEach, beforeAll, vi } from "vitest";

// Global test setup
beforeAll(() => {
  // Mock global objects if needed
  // For example, mocking window.matchMedia which is not implemented in happy-dom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});

// Vue Test Utils global config
config.global.stubs = {
  // Stub global components if needed
};
