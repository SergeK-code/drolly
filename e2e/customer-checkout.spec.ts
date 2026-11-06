import { expect, test } from "@playwright/test";

const email = process.env.E2E_CUSTOMER_EMAIL;
const password = process.env.E2E_CUSTOMER_PASSWORD;

test.describe("customer checkout smoke", () => {
  test.skip(!email || !password, "Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD");

  test("browse catalog, add to cart, place a COD order, and view it", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const addToCart = page.getByRole("button", { name: "Add to cart" }).first();
    await expect(addToCart).toBeVisible();
    await addToCart.click();
    await expect(page.getByText(/added to cart/i)).toBeVisible();

    await page.getByRole("link", { name: /^Cart/ }).click();
    await page.getByRole("link", { name: "Checkout" }).click();

    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByRole("heading", { name: "Checkout" }),
    ).toBeVisible();

    if (await page.getByLabel("Recipient").isVisible()) {
      await page.getByLabel("Recipient").fill("E2E Customer");
      await page.getByLabel("Phone").fill("0500000000");
      await page.getByLabel("Address").fill("12 Market Street");
      await page.getByLabel("Area").fill("Center");
    }

    await page.getByRole("button", { name: "Place cash-on-delivery order" }).click();
    await expect(page).toHaveURL(/\/account\/orders\//, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Order" })).toBeVisible();
  });
});
