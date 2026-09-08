import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { CuratedProject } from "@/data/curatedProjects";
import CaseModal, { resolveSwipeDelta } from "./CaseModal";

const FAKE_PROJECT: CuratedProject = {
  id: 999,
  title: "Fake Project",
  image: "a.png",
  images: ["a.png", "b.png", "c.png"],
  technologies: ["React"],
  type: { pt: "Web", en: "Web" },
  cat: "web",
  tint: "#000",
  description: { pt: "desc", en: "desc" },
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
  // The gallery UI (arrows/dots) only renders for images.length > 1, which no
  // curated project uses today (src/data/curatedProjects.ts) -- this exercises
  // the same `advance()` the swipe gesture calls, via the one interaction path
  // that IS reliably testable without fighting framer-motion's drag engine in jsdom.
  it("prev/next arrows cycle through images with wraparound", () => {
    render(
      <LanguageProvider>
        <CaseModal project={FAKE_PROJECT} onClose={vi.fn()} />
      </LanguageProvider>
    );

    const imageSrc = () => screen.getByAltText(/Screenshot \d de Fake Project/).getAttribute("src");
    expect(imageSrc()).toBe("a.png");

    fireEvent.click(screen.getByRole("button", { name: "Próxima imagem" }));
    expect(imageSrc()).toBe("b.png");

    fireEvent.click(screen.getByRole("button", { name: "Imagem anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Imagem anterior" }));
    expect(imageSrc()).toBe("c.png"); // wrapped back to the last image
  });
});
