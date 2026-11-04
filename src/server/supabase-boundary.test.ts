import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_ROOT = path.resolve(__dirname, "..");
const SUPABASE_IMPORT =
  /from\s+['"]@supabase\/[^'"]+['"]|require\(\s*['"]@supabase\/[^'"]+['"]\s*\)/;

function walk(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("Supabase access boundary", () => {
  it("does not import Supabase packages outside src/server", () => {
    const files = walk(SRC_ROOT);
    const violations: string[] = [];

    for (const file of files) {
      const relative = path.relative(SRC_ROOT, file).replaceAll("\\", "/");
      if (relative.startsWith("server/")) {
        continue;
      }

      const source = readFileSync(file, "utf8");
      if (SUPABASE_IMPORT.test(source)) {
        violations.push(relative);
      }
    }

    expect(violations).toEqual([]);
  });
});
