import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "./Header";

// The hero asks GitHub for the repo count and the contributions API for the
// last year; both are stubbed so the stats row has real numbers to show.
function stubApis() {
  const today = new Date().toISOString().slice(0, 10);
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("github-contributions-api")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ contributions: [{ date: today, count: 1234, level: 4 }] }) });
      }
      if (url.includes("/events/public")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ public_repos: 69 }) });
    })
  );
}

const renderHeader = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    </LanguageProvider>
  );

describe("Header", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    window.matchMedia =
      window.matchMedia ??
      ((query: string) => ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fills the stats row with the live repository and contribution counts", async () => {
    stubApis();
    renderHeader();
    await waitFor(() => {
      expect(screen.getByText("69")).toBeTruthy();
      expect(screen.getByText("1.234")).toBeTruthy();
    });
    for (const label of ["Projetos", "Repositórios", "Contribuições", "Semestre"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it("shows a dash instead of a stale number when GitHub can't be reached", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    renderHeader();
    await waitFor(() => expect(screen.getAllByText("—")).toHaveLength(2));
  });

  it("opens the recruiter summary and closes it again", async () => {
    stubApis();
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /Modo recrutador/ }));

    const dialog = await screen.findByRole("dialog", { name: "Resumo rápido para recrutadores" });
    expect(within(dialog).getByText("Pra olhar primeiro")).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: /Self-Sync Daily/ }).getAttribute("href")).toContain("lovable.app");

    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
