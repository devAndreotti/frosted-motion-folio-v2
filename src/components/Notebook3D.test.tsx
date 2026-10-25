import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Notebook3D from "./Notebook3D";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { moreProjects } from "@/data/moreProjects";

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
    expect(screen.getByText(`1 / ${moreProjects.length}`)).toBeTruthy();
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
    expect(screen.getByText(`${moreProjects.length} / ${moreProjects.length}`)).toBeTruthy();
  });

  it("opens the current project's screens", () => {
    const onOpen = renderNotebook();
    fireEvent.click(screen.getByRole("button", { name: "Ver as telas" }));
    expect(onOpen).toHaveBeenCalledWith(moreProjects[0]);
  });

  it("remembers the keyboard light level between visits", () => {
    localStorage.setItem("nb.luz", "1");
    renderNotebook();
    const group = screen.getByRole("group", { name: "Luz do teclado" });
    expect(group.querySelector('[aria-pressed="true"]')?.textContent).toBe("Baixa");
    fireEvent.click(screen.getByRole("button", { name: "Alta" }));
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

  it("has no screen switch: the real site opens only with a click on the screen", () => {
    renderNotebook();
    expect(screen.queryByRole("group", { name: "Tela" })).toBeNull();
    expect(screen.getByText(/Clique na tela para abrir o site de verdade/)).toBeTruthy();
  });
});

