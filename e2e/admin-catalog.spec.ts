import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe("admin catalog smoke", () => {
  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");

  test("sign in, create a product, archive it, and update an order if one exists", async ({
    page,
  }) => {
    await page.goto("/sign-in?returnTo=%2Fadmin");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Store admin")).toBeVisible();
    await page.getByRole("link", { name: "Products" }).click();
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    await page.getByRole("button", { name: "New product" }).click();
    const name = `E2E product ${Date.now()}`;
    await page.getByLabel("Name").fill(name);
    const category = page.getByLabel("Category");
    const options = category.locator("option");
    const count = await options.count();
    if (count > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await category.selectOption(value);
      }
    }
    await page.getByLabel("Price (minor units)").fill("1500");
    await page.getByLabel("Stock").fill("4");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page.getByText("Product created.")).toBeVisible();

    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Deactivate" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Deactivate" }).click();
    await expect(page.getByText("Product deactivated.")).toBeVisible();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    const orderLink = page.getByRole("link").filter({ hasNotText: "Orders" }).nth(0);
    if (await page.getByText("No orders yet.").isVisible()) {
      return;
    }
    await orderLink.click();
    const status = page.getByLabel("Next status");
    if (await status.isVisible()) {
      const statusCount = await status.locator("option").count();
      if (statusCount > 1) {
        const value = await status.locator("option").nth(1).getAttribute("value");
        if (value) {
          await status.selectOption(value);
          await page.getByRole("button", { name: "Update status" }).click();
          await page.getByRole("button", { name: "Update", exact: true }).click();
          await expect(page.getByText("Order status updated.")).toBeVisible();
        }
      }
    }
  });
});
