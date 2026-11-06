import { describe, expect, it } from "vitest";
import { storeSettingsWriteSchema } from "@/lib/store-settings-schema";

describe("storeSettingsWriteSchema", () => {
  it("uppercases currency and accepts zero fees", () => {
    expect(
      storeSettingsWriteSchema.parse({
        storeName: "Drolly",
        contactPhone: null,
        contactEmail: null,
        currency: "usd",
        deliveryFeeMinor: 0,
        minimumOrderMinor: 0,
      }),
    ).toMatchObject({
      currency: "USD",
      deliveryFeeMinor: 0,
    });
  });

  it("rejects a negative delivery fee", () => {
    expect(
      storeSettingsWriteSchema.safeParse({
        storeName: "Drolly",
        currency: "USD",
        deliveryFeeMinor: -1,
        minimumOrderMinor: 0,
      }).success,
    ).toBe(false);
  });
});
