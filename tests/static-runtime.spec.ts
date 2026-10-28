import { test, expect } from "@playwright/test";

test("core, explanation and lab work offline without third-party requests", async ({
  page,
  context,
}) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.hostname !== "127.0.0.1")
      externalRequests.push(url.origin);
  });
  await page.goto("./?no3d");
  await page.getByRole("button", { name: "Begin the trick" }).waitFor();
  // Once the static assets are loaded, the experience must need no connection.
  await context.setOffline(true);
  await page.getByRole("button", { name: "Begin the trick" }).click();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press(["y", "n", "y", "n", "y", "n"][i]);
    if (i < 5)
      await expect(
        page.getByText(`Card ${i + 2} of 6`, { exact: true }),
      ).toBeVisible();
  }
  await expect(page.getByLabel("Your number is 42")).toBeVisible();
  await page.getByRole("button", { name: "How did that work?" }).click();
  await page.getByRole("switch", { name: "Weight 1", exact: true }).click();
  await expect(page.locator(".binary-value")).toContainText("101011");
  await page.getByRole("button", { name: "The lab" }).click();
  await page.getByRole("slider").fill("8");
  await expect(page.getByText("1–255", { exact: true })).toBeVisible();
  expect(externalRequests).toEqual([]);
});
