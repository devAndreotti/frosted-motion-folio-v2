import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import GithubActivityFeed from "./GithubActivityFeed";

function mockGithubApi(events: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("/events/public")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(events) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ public_repos: 30 }) });
    })
  );
}

describe("GithubActivityFeed", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // jsdom implements neither of these — <Skeleton> uses matchMedia to pick
    // its bone color for the current color scheme, and ResizeObserver to
    // measure the container it's skinning.
    window.matchMedia =
      window.matchMedia ??
      ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }));
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

  it("renders the section header and nav controls", () => {
    mockGithubApi([]);
    render(
      <ThemeProvider>
        <GithubActivityFeed />
      </ThemeProvider>
    );
    expect(screen.getByText("O que ando fazendo no GitHub")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Atividade anterior" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Próxima atividade" })).toBeTruthy();
  });

  it("renders real events as cards, most recent first, once the fetch resolves", async () => {
    mockGithubApi([
      { id: "1", type: "PushEvent", repo: { name: "devAndreotti/self-sync-daily" }, created_at: new Date().toISOString(), payload: { commits: [{ message: "fix: bug" }] } },
      { id: "2", type: "WatchEvent", repo: { name: "someone/their-repo" }, created_at: new Date().toISOString(), payload: {} },
    ]);
    render(
      <ThemeProvider>
        <GithubActivityFeed />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("devAndreotti/self-sync-daily")).toBeTruthy();
      expect(screen.getByText("someone/their-repo")).toBeTruthy();
    });
  });

  it("shows a friendly fallback when there is no usable activity", async () => {
    mockGithubApi([{ id: "1", type: "ForkEvent", repo: { name: "x/y" }, created_at: new Date().toISOString(), payload: {} }]);
    render(
      <ThemeProvider>
        <GithubActivityFeed />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sem atividade pública recente/)).toBeTruthy();
    });
  });

  it("serves from the session cache without hitting the network again", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    sessionStorage.setItem(
      "github-activity-feed-cache-v2",
      JSON.stringify({
        fetchedAt: Date.now(),
        publicRepos: 30,
        items: [{ id: "cached", kind: "push", repo: "devAndreotti/cached-repo", text: "Fez push", detail: "from cache", time: new Date().toISOString() }],
      })
    );

    render(
      <ThemeProvider>
        <GithubActivityFeed />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("devAndreotti/cached-repo")).toBeTruthy();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls back to the empty state when the GitHub API is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down")))
    );

    render(
      <ThemeProvider>
        <GithubActivityFeed />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sem atividade pública recente/)).toBeTruthy();
    });
  });
});
