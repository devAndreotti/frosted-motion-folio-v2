import { afterEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DEBUG_CLASS, setDebugOn } from "@/lib/debugOverlay";
import DebugOverlay from "./DebugOverlay";

const renderOverlay = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <DebugOverlay />
      </ThemeProvider>
    </LanguageProvider>
  );

describe("DebugOverlay", () => {
  afterEach(() => {
    document.documentElement.classList.remove(DEBUG_CLASS);
  });

  it("renders nothing while debug mode is off", () => {
    renderOverlay();
    expect(screen.queryByRole("status", { name: "Painel de depuração" })).toBeNull();
  });

  it("shows viewport, theme, language and load time once debug mode is on", () => {
    renderOverlay();
    act(() => setDebugOn(true));
    const panel = screen.getByRole("status", { name: "Painel de depuração" });
    expect(panel.textContent).toContain(`${window.innerWidth} × ${window.innerHeight}`);
    expect(panel.textContent).toContain("escuro");
    expect(panel.textContent).toContain("PT");
    expect(panel.textContent).toContain("carregamento");
  });

  it("turns off with Escape", () => {
    renderOverlay();
    act(() => setDebugOn(true));
    expect(screen.getByRole("status", { name: "Painel de depuração" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("status", { name: "Painel de depuração" })).toBeNull();
    expect(document.documentElement.classList.contains(DEBUG_CLASS)).toBe(false);
  });

  it("follows the viewport size when the window is resized", () => {
    renderOverlay();
    act(() => setDebugOn(true));
    const originalWidth = window.innerWidth;
    window.innerWidth = 777;
    fireEvent(window, new Event("resize"));
    expect(screen.getByRole("status", { name: "Painel de depuração" }).textContent).toContain("777 ×");
    window.innerWidth = originalWidth;
  });
});
