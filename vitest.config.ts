import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./coverage",
      include: [
        "lib/utils.ts",
        "lib/ai/evaluator.ts",
        "lib/ai/ollama.ts",
        "lib/ai/groq.ts",
        "lib/ai/prompts/lld-phases.ts",
        "lib/ai/prompts/hld-phases.ts",
        "components/ui/button.tsx",
        "components/ui/badge.tsx",
        "components/question/EvaluationFeedback.tsx",
        "components/question/PhaseProgressBar.tsx",
        "components/question/PhaseSubmissionEditor.tsx",
        "app/actions/evaluation.ts",
        "app/actions/progress.ts",
      ],
      exclude: [
        "node_modules/**",
        "app/generated/**",
        "prisma/**",
        ".next/**",
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
