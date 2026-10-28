import { test, expect } from "@playwright/test";
async function begin(page: import("@playwright/test").Page) {
  await page.goto("./?no3d");
  await page.getByRole("button", { name: "Begin the trick" }).click();
}
async function answer(
  page: import("@playwright/test").Page,
  yes: boolean,
  index: number,
) {
  await page
    .getByRole("button", {
      name: yes ? "Yes, my number is here" : "No, it isn’t",
      exact: true,
    })
    .click();
  if (index < 6)
    await expect(
      page.getByText(`Card ${index + 1} of 6`, { exact: true }),
    ).toBeVisible();
}
test("all yes, review correction, restart", async ({ page }) => {
  await begin(page);
  for (let i = 1; i <= 6; i++) await answer(page, true, i);
  await expect(page.getByLabel("Your number is 63")).toBeVisible();
  await page.getByRole("button", { name: "Review answers" }).click();
  await answer(page, false, 6);
  await expect(page.getByLabel("Your number is 62")).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Card 1 of 6", { exact: true })).toBeVisible();
});
test("all no recovers", async ({ page }) => {
  await begin(page);
  for (let i = 1; i <= 6; i++) await answer(page, false, i);
  await expect(page.getByText(/Something doesn’t quite add up/)).toBeVisible();
  await page.getByRole("button", { name: "Review answers" }).click();
  await expect(page.getByText("Card 6 of 6", { exact: true })).toBeVisible();
});
test("keyboard chooses 42 and binary switches work", async ({ page }) => {
  await begin(page);
  for (const [i, key] of ["y", "n", "y", "n", "y", "n"].entries()) {
    await page.keyboard.press(key);
    if (i < 5)
      await expect(
        page.getByText(`Card ${i + 2} of 6`, { exact: true }),
      ).toBeVisible();
  }
  await expect(page.getByLabel("Your number is 42")).toBeVisible();
  await page.getByRole("button", { name: "How did that work?" }).click();
  await expect(page.getByRole("switch", { name: "Weight 32" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("switch", { name: "Weight 1", exact: true }).click();
  await expect(page.locator(".binary-value")).toContainText("101011");
});
test("rapid input stays on next card", async ({ page }) => {
  await begin(page);
  await page
    .getByRole("button", { name: "Yes, my number is here" })
    .evaluate((el) => {
      (el as HTMLButtonElement).click();
      (el as HTMLButtonElement).click();
      (el as HTMLButtonElement).click();
    });
  await expect(page.getByText("Card 2 of 6", { exact: true })).toBeVisible();
});
test("mobile lab and no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("./?no3d");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "The lab" }).click();
  await page.getByRole("slider").fill("8");
  await expect(page.getByText("1–255", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Play with 8 cards" }).click();
  await expect(page.getByText("Card 1 of 8", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("normal motion and WebGL unavailable preserve the trick", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Begin the trick" }).click();
  for (let i = 1; i <= 6; i++) await answer(page, true, i);
  await expect(page.getByLabel("Your number is 63")).toBeVisible();
});
test("keyboard focus and screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./?no3d");
  await page.screenshot({
    path: "test-results/opening-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Begin the trick" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Yes, my number is here" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Card 2 of 6", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: "test-results/card-mobile.png",
    fullPage: true,
  });
});

test("explanation aligns cards, bits and the zero exception", async ({
  page,
}) => {
  await page.goto("./?no3d");
  await page.getByRole("button", { name: "The secret", exact: true }).click();
  await expect(page.getByRole("switch")).toHaveCount(6);
  await expect(page.locator(".bit-card-on strong")).toHaveText([
    "32",
    "8",
    "2",
  ]);
  await expect(page.getByRole("table")).toContainText("Follow 42");
  for (const weight of [32, 8, 2])
    await page
      .getByRole("switch", { name: `Weight ${weight}`, exact: true })
      .click();
  await expect(page.locator(".binary-value")).toContainText("000000");
  await expect(
    page.getByText("All switches off:", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toContainText("No*");
  await page
    .getByRole("slider", { name: "Explore the information limit" })
    .fill("6");
  await expect(page.locator(".capacity-summary")).toContainText("64 patterns");
  await page.getByRole("button", { name: "Check my reasoning" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "35 = 32 + 2 + 1" }),
  ).toBeVisible();
  await page.getByText("Show the code · three small functions").click();
  await expect(page.locator("pre").first()).toContainText("(n & weight) !== 0");
});

test("eight-bit explorer stays usable at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("./?no3d");
  await page.getByRole("button", { name: "The lab" }).click();
  await page.getByRole("slider").fill("8");
  await page.getByRole("button", { name: "Explore these bits" }).click();
  await expect(page.getByRole("switch")).toHaveCount(8);
  await expect(page.locator(".binary-value")).toContainText("11111111");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/explanation-mobile.png",
    fullPage: true,
  });
});

test("complete eight-card performance reconstructs 173", async ({ page }) => {
  await page.goto("./?no3d");
  await page.getByRole("button", { name: "The lab" }).click();
  await page.getByRole("slider").fill("8");
  await page.getByRole("button", { name: "Play with 8 cards" }).click();
  for (const [i, weight] of [128, 64, 32, 16, 8, 4, 2, 1].entries()) {
    await page.keyboard.press(173 & weight ? "y" : "n");
    if (i < 7)
      await expect(
        page.getByText(`Card ${i + 2} of 8`, { exact: true }),
      ).toBeVisible();
  }
  await expect(page.getByLabel("Your number is 173")).toBeVisible();
  await expect(page.getByText("8 ANSWERS. ONE POSSIBILITY.")).toBeVisible();
});

test("leaving during a transition cancels the pending performance", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await begin(page);
  await page.getByRole("button", { name: "Yes, my number is here" }).click();
  await page.getByRole("button", { name: "The secret", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Not a lucky guess.",
  );
  await page.getByRole("button", { name: "The trick", exact: true }).click();
  await page.getByRole("button", { name: "Begin the trick" }).click();
  await expect(page.getByText("Card 1 of 6", { exact: true })).toBeVisible();
});

test("desktop explanation and reveal layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await begin(page);
  for (let i = 1; i <= 6; i++) await answer(page, true, i);
  await expect(page.getByLabel("Your number is 63")).toBeVisible();
  await page.screenshot({
    path: "test-results/reveal-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "How did that work?" }).click();
  await page.screenshot({
    path: "test-results/explanation-desktop.png",
    fullPage: true,
  });
});

test("graphics can fail after mounting without losing the experience", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  const supported = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    const supported = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  });
  test.skip(
    !supported,
    "This browser has no WebGL2; unavailable-WebGL behavior is covered separately.",
  );
  await expect(page.locator('canvas[data-ready="true"]')).toBeVisible();
  await page
    .locator("canvas")
    .evaluate((canvas) =>
      (canvas as HTMLCanvasElement)
        .getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext(),
    );
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Begin the trick" }).click();
  await expect(page.getByText("Card 1 of 6", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
