import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_ROOT = path.resolve(__dirname, "../..");

function walk(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("client source guards", () => {
  it("does not put service-role or secret keys in NEXT_PUBLIC values", () => {
    const files = walk(SRC_ROOT);
    const hits: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (
        /NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE/.test(source) ||
        /NEXT_PUBLIC_[A-Z0-9_]*SECRET/.test(source)
      ) {
        hits.push(path.relative(SRC_ROOT, file).replaceAll("\\", "/"));
      }
    }

    expect(hits).toEqual([]);
  });
});
