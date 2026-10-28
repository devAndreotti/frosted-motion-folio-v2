import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Notebook3D from "./Notebook3D";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { moreProjects } from "@/data/moreProjects";

const pad = (n: number) => String(n).padStart(2, "0");
const count = (i: number) => screen.getByText(`${pad(i)} / ${pad(moreProjects.length)}`, { selector: ".nb3d-count" });

const renderNotebook = (onOpen = vi.fn()) => {
  render(
    <LanguageProvider>
      <Notebook3D projects={moreProjects} onOpen={onOpen} />
    </LanguageProvider>,
  );
  return onOpen;
};

describe("Notebook3D", () => {
  afterEach(() => localStorage.clear());

  it("starts on the first project, with the still picture standing in for the 3D (no WebGL here)", () => {
    renderNotebook();
    expect(count(1)).toBeTruthy();
    expect(screen.getByText(moreProjects[0].title, { selector: ".nb3d-n" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /notebook Lenovo LOQ/ })).toBeTruthy();
  });

  it("steps through the projects with the arrows and the keyboard, wrapping at both ends", () => {
    renderNotebook();
    fireEvent.click(screen.getByRole("button", { name: "Próximo projeto" }));
    expect(screen.getByText(moreProjects[1].title, { selector: ".nb3d-n" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Projeto anterior" }));
    fireEvent.keyDown(screen.getByRole("region", { name: /notebook em 3D/ }), { key: "ArrowLeft" });
    const last = moreProjects[moreProjects.length - 1];
    expect(screen.getByText(last.title, { selector: ".nb3d-n" })).toBeTruthy();
    expect(count(moreProjects.length)).toBeTruthy();
  });

  it("opens the current project's screens", () => {
    const onOpen = renderNotebook();
    fireEvent.click(screen.getByRole("button", { name: "Ver as telas" }));
    expect(onOpen).toHaveBeenCalledWith(moreProjects[0]);
  });

  it("jumps straight to a project from its thumbnail", () => {
    renderNotebook();
    const third = moreProjects[2];
    const thumb = screen.getByRole("button", { name: `Projeto 3: ${third.title}` });
    fireEvent.click(thumb);
    expect(screen.getByText(third.title, { selector: ".nb3d-n" })).toBeTruthy();
    expect(thumb.getAttribute("aria-current")).toBe("true");
    expect(count(3)).toBeTruthy();
  });

  it("steps the keyboard light like Fn+Space and remembers it between visits", () => {
    localStorage.setItem("nb.luz", "1");
    renderNotebook();
    fireEvent.click(screen.getByRole("button", { name: "Luz do teclado: Baixa" }));
    expect(screen.getByRole("button", { name: "Luz do teclado: Alta" })).toBeTruthy();
    expect(localStorage.getItem("nb.luz")).toBe("2");
  });

  it("closes and opens the lid from its button, and turns the key sounds off for good", () => {
    renderNotebook();
    fireEvent.click(screen.getByRole("button", { name: "Fechar a tampa" }));
    expect(screen.getByRole("button", { name: "Abrir a tampa" })).toBeTruthy();
    const soundButton = screen.getByRole("button", { name: "Som das teclas" });
    expect(soundButton.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(soundButton);
    expect(soundButton.getAttribute("aria-pressed")).toBe("false");
    expect(localStorage.getItem("nb.som")).toBe("0");
  });

  it("has no screen switch, and lists the gestures for a touch screen", () => {
    renderNotebook();
    expect(screen.queryByRole("group", { name: "Tela" })).toBeNull();
    expect(screen.getByText("Mexa nele")).toBeTruthy();
    expect(screen.getByText("Gira o notebook")).toBeTruthy();
  });

  it("links to the project's site when it has one", () => {
    renderNotebook();
    const first = moreProjects.find((p) => p.liveUrl);
    if (!first) return;
    while (!screen.queryByText(first.title, { selector: ".nb3d-n" })) fireEvent.click(screen.getByRole("button", { name: "Próximo projeto" }));
    expect(screen.getByRole("link", { name: /Abrir o site/ }).getAttribute("href")).toBe(first.liveUrl);
  });

  it("displays tap to 3D button on mobile and activates 3D on tap", () => {
    renderNotebook();
    const tapBtn = screen.getByRole("button", { name: "Tocar para ver em 3D" });
    expect(tapBtn).toBeTruthy();
    fireEvent.click(tapBtn);
    expect(screen.queryByRole("button", { name: "Tocar para ver em 3D" })).toBeNull();
  });

  it("does not display tap to 3D button on desktop", () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(min-width: 1024px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    try {
      renderNotebook();
      expect(screen.queryByRole("button", { name: "Tocar para ver em 3D" })).toBeNull();
    } finally {
      window.matchMedia = original;
    }
  });
});

