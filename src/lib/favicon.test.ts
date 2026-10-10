import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { applyFavicon, faviconSvg, RA_PATH } from "./favicon";

const svgLink = () => document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
const decoded = () => decodeURIComponent(svgLink()?.href.replace("data:image/svg+xml,", "") ?? "");

describe("favicon", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("paints the tile in the theme background and the letters in the accent", () => {
    const svg = faviconSvg({ bg: "hsl(22 80% 8%)", fg: "#f97316" });
    expect(svg).toContain('fill="hsl(22 80% 8%)"');
    expect(svg).toContain('stroke="#f97316"');
    expect(svg).toContain(`<path d="${RA_PATH}" fill="#f97316"/>`);
  });

  it("repaints the SVG icon the page already declares", () => {
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico"><link rel="icon" type="image/svg+xml" href="/favicon.svg">';
    applyFavicon({ bg: "#080808", fg: "#e4e4e7" });
    expect(document.head.querySelectorAll('link[rel="icon"]')).toHaveLength(2);
    expect(decoded()).toBe(faviconSvg({ bg: "#080808", fg: "#e4e4e7" }));
    // the .ico fallback is left alone
    expect(document.head.querySelector<HTMLLinkElement>('link[href="/favicon.ico"]')).not.toBeNull();
  });

  it("adds the SVG icon when the page has none", () => {
    applyFavicon({ bg: "#fcfcfc", fg: "#18181b" });
    expect(decoded()).toContain('fill="#18181b"');
  });

  it("draws the same monogram in the static public/favicon.svg", () => {
    const file = readFileSync(resolve(__dirname, "../../public/favicon.svg"), "utf8");
    expect(file).toContain(RA_PATH);
  });
});
