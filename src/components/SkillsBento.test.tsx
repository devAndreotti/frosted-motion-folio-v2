import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { projects } from "@/data/projects";
import { countProjectsUsing, projectsUsing } from "@/lib/stackCounts";
import SkillsBento from "./SkillsBento";

const renderBento = () =>
  render(
    <LanguageProvider>
      <SkillsBento />
    </LanguageProvider>
  );

const tileOf = (name: string) => screen.getByText(name, { exact: true }).closest(".tile, .chp") as HTMLElement;

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

  it("counts Git in public repositories once the GitHub number is known", () => {
    render(
      <LanguageProvider>
        <SkillsBento repoCount={69} />
      </LanguageProvider>
    );
    expect(tileOf("Git").textContent).toContain("69");
    expect(tileOf("Git").textContent).toContain("repositórios no GitHub");
  });

  it("names the project on a chip used by exactly one of them", () => {
    renderBento();
    const used = projectsUsing(projects, ["n8n"]);
    expect(used).toHaveLength(1);
    expect(tileOf("n8n").textContent).toContain(used[0].title);
  });

  it("an area filter fades tools outside it and toggles back to all", () => {
    renderBento();
    const dados = screen.getByRole("button", { name: /^Dados/ });

    fireEvent.click(dados);
    expect(dados.getAttribute("aria-pressed")).toBe("true");
    expect(tileOf("React").className).toContain("off");
    expect(tileOf("Supabase").className).not.toContain("off");

    fireEvent.click(dados);
    expect(dados.getAttribute("aria-pressed")).toBe("false");
    expect(tileOf("React").className).not.toContain("off");
  });
});
