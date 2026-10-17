import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { CuratedProject } from "@/data/curatedProjects";
import CaseModal, { resolveSwipeDelta } from "./CaseModal";

const FAKE_PROJECT: CuratedProject = {
  id: 999,
  slug: "fake-project",
  title: "Fake Project",
  image: "a.png",
  images: ["a.png", "b.png", "c.png"],
  technologies: ["React"],
  type: { pt: "Web", en: "Web" },
  cat: "web",
  tint: "#000",
  description: { pt: "desc", en: "desc" },
  tagline: { pt: "linha", en: "line" },
  long: { pt: "long pt", en: "long en" },
  points: { pt: ["ponto"], en: ["point"] },
};

describe("resolveSwipeDelta", () => {
  it("does nothing on a small, slow drag", () => {
    expect(resolveSwipeDelta(20, 50)).toBe(0);
  });

  it("advances forward on a large leftward offset", () => {
    expect(resolveSwipeDelta(-80, 0)).toBe(1);
  });

  it("goes back on a large rightward offset", () => {
    expect(resolveSwipeDelta(80, 0)).toBe(-1);
  });

  it("advances forward on a fast leftward flick even with a short offset", () => {
    expect(resolveSwipeDelta(-10, -800)).toBe(1);
  });

  it("goes back on a fast rightward flick even with a short offset", () => {
    expect(resolveSwipeDelta(10, 800)).toBe(-1);
  });
});

describe("CaseModal gallery navigation", () => {
  // Exercises the same `advance()` the swipe gesture calls, via the one interaction
  // path that is reliably testable without fighting framer-motion's drag engine in jsdom.
  it("prev/next arrows cycle through images with wraparound", () => {
    render(
      <LanguageProvider>
        <CaseModal project={FAKE_PROJECT} onClose={vi.fn()} />
      </LanguageProvider>
    );

    // the picture is addressed from the site base ("/a.png" in tests), so compare the file name
    const imageSrc = () => screen.getByAltText(/Screenshot \d de Fake Project/).getAttribute("src")?.replace(/^\//, "");
    expect(imageSrc()).toBe("a.png");

    fireEvent.click(screen.getByRole("button", { name: "Próxima imagem" }));
    expect(imageSrc()).toBe("b.png");

    fireEvent.click(screen.getByRole("button", { name: "Imagem anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Imagem anterior" }));
    expect(imageSrc()).toBe("c.png"); // wrapped back to the last image
  });
});

describe("CaseModal gallery autoplay", () => {
  const renderModal = (project: CuratedProject = FAKE_PROJECT) =>
    render(
      <LanguageProvider>
        <CaseModal project={project} onClose={vi.fn()} />
      </LanguageProvider>
    );
  // the picture is addressed from the site base ("/a.png" in tests), so compare the file name
    const imageSrc = () => screen.getByAltText(/Screenshot \d de Fake Project/).getAttribute("src")?.replace(/^\//, "");
  const tick = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("turns to the next picture every 2 seconds and wraps around", () => {
    renderModal();
    expect(imageSrc()).toBe("a.png");
    tick(1999);
    expect(imageSrc()).toBe("a.png");
    tick(1);
    expect(imageSrc()).toBe("b.png");
    tick(2000);
    expect(imageSrc()).toBe("c.png");
    tick(2000);
    expect(imageSrc()).toBe("a.png");
  });

  it("restarts the countdown on a manual move, instead of turning again right after it", () => {
    renderModal();
    tick(1500);
    fireEvent.click(screen.getByRole("button", { name: "Próxima imagem" }));
    expect(imageSrc()).toBe("b.png");
    tick(1999);
    expect(imageSrc()).toBe("b.png");
    tick(1);
    expect(imageSrc()).toBe("c.png");
  });

  it("jumps to a picture from the dots and marks the current one", () => {
    renderModal();
    const dots = screen.getAllByRole("button", { name: /Ir para a imagem/ });
    expect(dots).toHaveLength(3);
    fireEvent.click(dots[2]);
    expect(imageSrc()).toBe("c.png");
    expect(dots[2].getAttribute("aria-current")).toBe("true");
    expect(dots[0].getAttribute("aria-current")).toBeNull();
  });

  it("layers every picture on the stage and exposes only the current one", () => {
    renderModal();
    const layers = Array.from(document.querySelectorAll<HTMLImageElement>(".dlg-img"));
    expect(layers).toHaveLength(3);
    expect(layers.filter((img) => img.classList.contains("on"))).toHaveLength(1);
    expect(layers.filter((img) => img.getAttribute("aria-hidden") === "true")).toHaveLength(2);
    expect(document.querySelectorAll(".dlg-bg")).toHaveLength(3);
    tick(2000);
    expect(layers[1].classList.contains("on")).toBe(true);
    expect(layers[0].classList.contains("on")).toBe(false);
  });

  it("fills one bar per picture: done behind, running on the current one", () => {
    renderModal();
    tick(2000);
    const bars = Array.from(document.querySelectorAll(".dlg-seg i"));
    expect(bars.map((bar) => bar.className)).toEqual(["done", "run", ""]);
    expect(document.querySelector(".dlg-count")?.textContent).toBe("2 / 3");
  });

  it("shows the current bar full, not running, while the pointer holds the gallery", () => {
    renderModal();
    fireEvent.mouseEnter(document.querySelector(".dlg-gallery") as HTMLElement);
    expect(document.querySelector(".dlg-seg i")?.className).toBe("done");
  });

  it("holds still while the pointer is over the gallery, and goes on when it leaves", () => {
    renderModal();
    const media = document.querySelector(".dlg-gallery") as HTMLElement;
    fireEvent.mouseEnter(media);
    tick(6000);
    expect(imageSrc()).toBe("a.png");
    fireEvent.mouseLeave(media);
    tick(2000);
    expect(imageSrc()).toBe("b.png");
  });

  it("holds still while a control inside the gallery has the keyboard focus", () => {
    renderModal();
    const next = screen.getByRole("button", { name: "Próxima imagem" });
    fireEvent.focus(next);
    tick(6000);
    expect(imageSrc()).toBe("a.png");
    fireEvent.blur(next, { relatedTarget: document.body });
    tick(2000);
    expect(imageSrc()).toBe("b.png");
  });

  it("can be paused and resumed with its own button", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Pausar a troca automática de imagens" }));
    tick(6000);
    expect(imageSrc()).toBe("a.png");
    const resume = screen.getByRole("button", { name: "Retomar a troca automática de imagens" });
    expect(resume.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(resume);
    tick(2000);
    expect(imageSrc()).toBe("b.png");
  });

  it("does not move by itself for a visitor who asked for less motion, but still answers clicks", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    renderModal();
    tick(10000);
    expect(imageSrc()).toBe("a.png");
    expect(screen.queryByRole("button", { name: /troca automática/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Próxima imagem" }));
    expect(imageSrc()).toBe("b.png");
  });

  it("has no gallery controls, and no timer, for a project with one picture", () => {
    renderModal({ ...FAKE_PROJECT, images: ["a.png"] });
    expect(screen.queryByRole("button", { name: "Próxima imagem" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Imagens do projeto" })).toBeNull();
    tick(10000);
    expect(imageSrc()).toBe("a.png");
  });
});

