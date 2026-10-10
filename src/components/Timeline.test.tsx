import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Timeline, { rulerSpans } from "./Timeline";

const renderTimeline = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <Timeline />
      </ThemeProvider>
    </LanguageProvider>
  );

describe("Timeline", () => {
  it("lists the earlier chapters in a scrollable region, oldest first", () => {
    renderTimeline();
    expect(screen.getByText("Como cheguei até aqui.")).toBeTruthy();
    const past = screen.getByRole("region", { name: "Capítulos anteriores" });
    const chapters = within(past).getAllByRole("listitem");
    expect(chapters.map((li) => within(li).getByRole("heading").textContent)).toEqual(["Curso técnico", "Faculdade", "Primeiros projetos reais"]);
    expect(chapters[0].textContent).toContain("Cap. 01 · 2021");
    // reachable from the keyboard, so it can be scrolled without a mouse
    expect(past.getAttribute("tabindex")).toBe("0");
  });

  it("gives the current chapter its own card, with what I work with and the availability", () => {
    renderTimeline();
    const now = screen.getByRole("article", { name: "Full Stack & IA aplicada" });
    expect(within(now).getByText("Hoje")).toBeTruthy();
    expect(within(now).getByText("Cap. 04 · você está aqui")).toBeTruthy();
    expect(within(now).getByText("Disponível para novos projetos")).toBeTruthy();
    expect(within(now).getByText("IA aplicada")).toBeTruthy();
    expect(within(now).getByText(/cases \+ \d+ no GitHub/)).toBeTruthy();
  });

  it("draws one ruler segment per earlier chapter, as long as it lasted", () => {
    renderTimeline();
    const segments = [...screen.getByTestId("timeline-ruler").querySelectorAll<HTMLElement>(".tl-seg")];
    expect(segments).toHaveLength(3);
    expect(segments.map((s) => s.style.flexGrow)).toEqual(rulerSpans(["2021", "2023", "2024", "Hoje"], new Date().getFullYear()).map(String));
    expect(segments[2].textContent).toContain("Hoje");
  });
});

describe("rulerSpans", () => {
  it("measures each chapter until the next one, the last until this year", () => {
    expect(rulerSpans(["2021", "2023", "2024", "Hoje"], 2026)).toEqual([2, 1, 2]);
  });

  it("never gives a chapter less than a year, so it stays visible", () => {
    expect(rulerSpans(["2024", "2024", "Hoje"], 2024)).toEqual([1, 1]);
  });
});
