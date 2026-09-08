import { test, expect, type Page } from "@playwright/test";

// One section id per top-level <section>/<header>/<footer> composed in
// src/pages/Index.tsx -- walking all of them catches overflow that only
// shows up once a section's own content/animation has mounted, not just
// on initial load.
const SECTION_IDS = ["header", "marquee", "projects", "skills", "timeline", "github-activity", "contact"];

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  // +1px tolerance for sub-pixel rounding from the responsive layout math
  // (e.g. the heatmap's week-column fit) -- real bugs overflow by much more.
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

test("no section causes horizontal overflow at this viewport", async ({ page }) => {
  await page.goto("");
  expect(await hasHorizontalOverflow(page)).toBe(false);

  for (const id of SECTION_IDS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(150); // let the section's enter animation settle
    expect(await hasHorizontalOverflow(page), `overflow detected after scrolling to #${id}`).toBe(false);
  }
});

// The GitHub activity feed and contribution heatmap hit real, unauthenticated
// external APIs (see home/github-activity.spec.ts, which itself only asserts
// "real cards OR the graceful fallback") -- a rate-limited 403 from those is
// an expected, already-handled condition, not an app bug, so it's filtered
// out here rather than failing the whole responsive suite on it.
const IGNORED_CONSOLE_PATTERN = /Failed to load resource.*403|api\.github\.com|github-contributions-api/i;

test("no console or runtime errors during a full scroll through the page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !IGNORED_CONSOLE_PATTERN.test(msg.text())) errors.push(msg.text());
  });

  await page.goto("");
  for (const id of SECTION_IDS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
  }

  expect(errors, errors.join("\n")).toEqual([]);
});
