import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // 在 Node 环境下跑
    globals: true, // 支持 describe/it/globals
    onConsoleLog: (log) => {
      console.log(log);
      return true;
    }, // 直推 console.log
    coverage: {
      provider: "v8",
    },
  },
});
