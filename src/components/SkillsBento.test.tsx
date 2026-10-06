import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { projects } from "@/data/projects";
import { countProjectsUsing } from "@/lib/stackCounts";
import SkillsBento from "./SkillsBento";

const renderBento = () =>
  render(
    <LanguageProvider>
      <SkillsBento />
    </LanguageProvider>
  );

const tileOf = (name: string) => screen.getByText(name, { exact: true }).closest("div.rounded-2xl") as HTMLElement;

describe("SkillsBento", () => {
  it("shows the three usage tiers", () => {
    renderBento();
    for (const title of ["Uso diário", "Confortável", "Aprendendo"]) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });

  it("daily tiles carry the real number of portfolio projects", () => {
    renderBento();
    const react = countProjectsUsing(projects, ["React"]);
    expect(tileOf("React").textContent).toContain(String(react));
  });

  it("an area filter fades tools outside it and toggles back to all", () => {
    renderBento();
    const dados = screen.getByRole("button", { name: /^Dados/ });

    fireEvent.click(dados);
    expect(dados.getAttribute("aria-pressed")).toBe("true");
    expect(tileOf("React").className).toContain("opacity-20");
    expect(tileOf("Supabase").className).not.toContain("opacity-20");

    fireEvent.click(dados);
    expect(dados.getAttribute("aria-pressed")).toBe("false");
    expect(tileOf("React").className).not.toContain("opacity-20");
  });
});
