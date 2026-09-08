import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ContributionHeatmap from "./ContributionHeatmap";

const SAMPLE_DAYS = [
  { date: "2026-08-01", count: 0, level: 0 },
  { date: "2026-08-02", count: 3, level: 2 },
  { date: "2026-08-03", count: 8, level: 4 },
];

function mockContributionsApi(contributions: unknown[] | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      contributions === null
        ? Promise.reject(new Error("network down"))
        : Promise.resolve({ ok: true, json: () => Promise.resolve({ contributions }) })
    )
  );
}

describe("ContributionHeatmap", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // jsdom doesn't implement ResizeObserver — the heatmap uses it to fit
    // however many weeks the container width allows.
    const win = window as unknown as { ResizeObserver?: unknown };
    win.ResizeObserver =
      win.ResizeObserver ??
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders one cell per contribution day once the fetch resolves", async () => {
    mockContributionsApi(SAMPLE_DAYS);
    render(
      <ThemeProvider>
        <ContributionHeatmap />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("contribution-day")).toHaveLength(SAMPLE_DAYS.length);
    });
  });

  it("renders nothing when the contributions API is unreachable", async () => {
    mockContributionsApi(null);
    const { container } = render(
      <ThemeProvider>
        <ContributionHeatmap />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="contribution-heatmap"]')).toBeNull();
    });
  });

  it("serves from the session cache without hitting the network again", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    sessionStorage.setItem("github-contributions-cache-v2", JSON.stringify({ fetchedAt: Date.now(), days: SAMPLE_DAYS }));

    render(
      <ThemeProvider>
        <ContributionHeatmap />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("contribution-day")).toHaveLength(SAMPLE_DAYS.length);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
