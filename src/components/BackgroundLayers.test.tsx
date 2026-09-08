import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { buildHueTheme } from "@/lib/theme";
import BackgroundLayers, { tokensFor } from "./BackgroundLayers";

describe("tokensFor", () => {
  it("mirrors buildHueTheme's gradient/glow tokens for the given hue+mode", () => {
    const expected = buildHueTheme("blue").dark;
    const result = tokensFor("blue", "dark");
    expect(result).toEqual({ bg: expected.bg, glow1: expected.glow1, glow2: expected.glow2, glow3: expected.glow3 });
  });
});

const HueSwitcher = () => {
  const { setHue } = useTheme();
  return (
    <button type="button" onClick={() => setHue("blue")}>
      switch to blue
    </button>
  );
};

function queryLayers(): HTMLElement[] {
  const host = document.querySelector('div[aria-hidden="true"]') as HTMLElement;
  return [...host.querySelectorAll(":scope > div")] as HTMLElement[];
}

describe("BackgroundLayers", () => {
  it("renders two stacked layers with matching content and exactly one visible on mount", () => {
    render(
      <ThemeProvider>
        <BackgroundLayers />
      </ThemeProvider>
    );
    const layers = queryLayers();
    expect(layers).toHaveLength(2);
    expect(layers[0].style.background).toBe(layers[1].style.background);
    expect([layers[0].style.opacity, layers[1].style.opacity].sort()).toEqual(["0", "1"]);
  });

  it("crossfades to a new hue: the visible layer's gradient changes, the other keeps the old one and goes hidden", async () => {
    render(
      <ThemeProvider>
        <BackgroundLayers />
        <HueSwitcher />
      </ThemeProvider>
    );
    const before = queryLayers();
    const initialGradient = before[0].style.background;

    fireEvent.click(screen.getByRole("button", { name: "switch to blue" }));

    await waitFor(() => {
      const layers = queryLayers();
      const visible = layers.find((l) => l.style.opacity === "1");
      const hidden = layers.find((l) => l.style.opacity === "0");
      expect(visible).toBeDefined();
      expect(hidden).toBeDefined();
      expect(visible!.style.background).not.toBe(initialGradient);
      expect(hidden!.style.background).toBe(initialGradient);
    });
  });
});
