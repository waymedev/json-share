import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { viteEnvs } from "vite-envs";
import { defineConfig } from "vitest/config";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteEnvs({
      /*
       * Uncomment the following line if `.env` is gitignored in your project.
       * This enables you to use another file for declaring your variables.
       */
      declarationFile: ".env.example",

      /*
       * This is completely optional.
       * It enables you to define environment
       * variables that are computed at build time.
       */
      computedEnv: async ({ resolvedConfig /*declaredEnv, dotEnvLocal*/ }) => {
        const path = await import("path");
        const fs = await import("fs/promises");

        const packageJson = JSON.parse(
          await fs.readFile(
            path.join(resolvedConfig.root, "package.json"),
            "utf-8"
          )
        );

        /*
         * Here you can define any arbitrary value they will be available
         * in `import.meta.env` and it's type definitions.
         * You can also compute defaults for variable declared in `.env` files.
         */
        return {
          BUILD_TIME: Date.now(),
          VERSION: packageJson.version,
        };
      },
    }),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx,vue}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/setup.ts"],
    },
  },
});
