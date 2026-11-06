import { describe, expect, it } from "vitest";
import { profileWriteSchema } from "@/lib/profile-schema";

describe("profileWriteSchema", () => {
  it("accepts a name and optional phone", () => {
    expect(
      profileWriteSchema.parse({
        fullName: "Ada",
        phone: "0500000000",
      }),
    ).toEqual({
      fullName: "Ada",
      phone: "0500000000",
    });
  });

  it("rejects a client-supplied role field", () => {
    expect(
      profileWriteSchema.safeParse({
        fullName: "Ada",
        phone: null,
        role: "admin",
      }).success,
    ).toBe(false);
  });
});
