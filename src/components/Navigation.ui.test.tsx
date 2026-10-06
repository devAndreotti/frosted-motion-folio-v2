import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navigation from "./Navigation";

const renderNav = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </LanguageProvider>
  );

describe("Navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    window.matchMedia =
      window.matchMedia ??
      ((query: string) => ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }));
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
      observe() {}
      disconnect() {}
    };
  });

  it("shows the RA monogram and every section link", () => {
    renderNav();
    expect(screen.getByText("RA")).toBeTruthy();
    for (const label of ["Início", "Projetos", "Stack", "Trajetória", "Contato"]) {
      expect(screen.getAllByRole("button", { name: label }).length).toBeGreaterThan(0);
    }
  });

  it("switches the language from the PT | EN pill", () => {
    renderNav();
    const group = screen.getAllByRole("group", { name: "Idioma" })[0];
    fireEvent.click(within(group).getByRole("button", { name: "EN" }));
    expect(screen.getAllByRole("button", { name: "Projects" }).length).toBeGreaterThan(0);
    expect(within(screen.getAllByRole("group", { name: "Language" })[0]).getByRole("button", { name: "EN" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("opens the mobile sheet with links, language and colors, and closes on Escape", () => {
    renderNav();
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const sheet = screen.getByTestId("mobile-menu");
    expect(within(sheet).getByRole("button", { name: /Trajetória/ })).toBeTruthy();
    expect(within(sheet).getAllByRole("button", { name: /^Cor de destaque:/ })).toHaveLength(7);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("mobile-menu")).toBeNull();
  });
});
