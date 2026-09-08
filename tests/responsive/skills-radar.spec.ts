import { test, expect } from "@playwright/test";

// Regression for a real clipping bug: the radar SVG used to carry literal
// width/height="340" attributes, which bypassed viewBox-based scaling and
// overflowed its glass column on any narrow screen. This must hold at
// every viewport, not just phones -- the fix (a responsive Tailwind width
// class) should never let the SVG exceed its container anywhere.
test("SkillsRadar SVG never exceeds its container's width", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#skills");
  await section.scrollIntoViewIfNeeded();
  await section.getByRole("button", { name: "Radar", exact: true }).click();

  const svg = section.getByRole("img", { name: /Radar de proficiência/ });
  await expect(svg).toBeVisible();

  const svgBox = await svg.boundingBox();
  const containerBox = await section.locator(".glass.rounded-3xl").boundingBox();

  expect(svgBox).not.toBeNull();
  expect(containerBox).not.toBeNull();
  expect(svgBox!.width).toBeLessThanOrEqual(containerBox!.width + 1);
  expect(svgBox!.width).toBeGreaterThan(0);
});
