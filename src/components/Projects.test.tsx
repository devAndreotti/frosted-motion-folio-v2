import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { featuredProject, curatedProjects } from "@/data/curatedProjects";
import Projects, { OTHERS_COUNT } from "./Projects";

const renderProjects = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <Projects />
      </ThemeProvider>
    </LanguageProvider>
  );

describe("Projects", () => {
  it("renders the main case, the ranked rows and the link to the rest", () => {
    renderProjects();
    expect(screen.getByRole("heading", { name: featuredProject.title })).toBeTruthy();
    for (const p of curatedProjects) expect(screen.getByText(p.title)).toBeTruthy();
    expect(screen.getByRole("link", { name: `Ver os outros ${OTHERS_COUNT} no GitHub` })).toBeTruthy();
  });

  it("shows how many projects each filter keeps", () => {
    renderProjects();
    const all = curatedProjects.length + 1;
    expect(screen.getByRole("button", { name: "Todos" }).textContent).toContain(String(all));
  });

  it("a filter that leaves out the main case hides it and keeps the row numbers", () => {
    renderProjects();
    const mobile = curatedProjects.find((p) => p.cat === "mobile")!;
    const rank = String(curatedProjects.indexOf(mobile) + 2).padStart(2, "0");

    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(screen.queryByRole("heading", { name: featuredProject.title })).toBeNull();
    const row = screen.getByRole("button", { name: `Abrir case: ${mobile.title}` });
    expect(within(row).getByText(rank)).toBeTruthy();
  });

  it("opens the case study from the main case and closes it", () => {
    renderProjects();
    fireEvent.click(screen.getByRole("button", { name: /Abrir case$/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(featuredProject.long.pt)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
