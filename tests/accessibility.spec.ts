import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("main stages have no detected WCAG A/AA violations", async ({ page }) => {
  async function check(stage: string) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      `${stage}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
  await page.goto("./?no3d");
  await check("introduction");
  await page.getByRole("button", { name: "Begin the trick" }).click();
  await check("answering");
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("y");
    if (i < 5)
      await expect(
        page.getByText(`Card ${i + 2} of 6`, { exact: true }),
      ).toBeVisible();
  }
  await expect(page.getByLabel("Your number is 63")).toBeVisible();
  await check("reveal");
  await page.getByRole("button", { name: "How did that work?" }).click();
  await check("explanation");
  await page.getByRole("button", { name: "The lab" }).click();
  await check("lab");
  await page.getByRole("button", { name: "About the project" }).click();
  await check("about");
});
