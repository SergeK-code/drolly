import { describe, expect, it } from "vitest";
import { cx } from "@/lib/ui/cx";

describe("cx", () => {
  it("joins truthy class names", () => {
    expect(cx("a", false, undefined, "b")).toBe("a b");
  });
});
