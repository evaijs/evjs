import { createCsrExampleTest, expect } from "../fixtures";

const test = createCsrExampleTest("basic-plugins");

test.describe("basic-plugins", () => {
  test("renders home page with plugin content", async ({ page, baseURL }) => {
    await page.goto(baseURL);

    await expect(page.getByText("Plugin Example")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("evjs plugin system")).toBeVisible();
  });

  test("HTML contains comment injected by transformHtml plugin", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL);

    // Wait for page to render
    await expect(page.getByText("Plugin Example")).toBeVisible({
      timeout: 10_000,
    });

    // The transformHtml hook injects a comment node into <head>
    // Verify it by reading the raw HTML source
    const html = await page.content();
    expect(html).toContain("Built with evjs");
    expect(html).toMatch(/Built with evjs \| \d+ asset\(s\)/);
  });

  test("page has correct title from template", async ({ page, baseURL }) => {
    await page.goto(baseURL);

    await expect(page).toHaveTitle("ev — Plugin Example");
  });

  test("JS assets are injected and functional", async ({ page, baseURL }) => {
    // The page itself rendering React content proves that JS assets
    // were properly injected by generateHtml
    await page.goto(baseURL);

    await expect(page.getByText("Plugin Example")).toBeVisible({
      timeout: 10_000,
    });

    // Verify the React app mounted into the #app div
    const appDiv = page.locator("#app");
    await expect(appDiv).not.toBeEmpty();
  });
});
