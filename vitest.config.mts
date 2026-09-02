import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: "v8",
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./"),
    },
  },
})
