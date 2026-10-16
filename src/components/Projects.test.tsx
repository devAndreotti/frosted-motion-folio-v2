import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { featuredProject, curatedProjects } from "@/data/curatedProjects";
import { moreProjects } from "@/data/moreProjects";
import Projects, { OTHERS_COUNT } from "./Projects";

// the popup lives in the address, so the section sits under the same routes as the app
const renderProjects = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Projects />} />
            <Route path="/projetos/:slug" element={<Projects />} />
          </Routes>
        </ThemeProvider>
      </LanguageProvider>
    </MemoryRouter>
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
    expect(screen.getByRole("button", { name: /^Todos/ }).textContent).toContain(String(all));
  });

  it("a filter that leaves out the main case hides it and keeps the row numbers", () => {
    renderProjects();
    const mobile = curatedProjects.find((p) => p.cat === "mobile")!;
    const rank = String(curatedProjects.indexOf(mobile) + 2).padStart(2, "0");

    fireEvent.click(screen.getByRole("button", { name: /^Mobile/ }));
    expect(screen.queryByRole("heading", { name: featuredProject.title })).toBeNull();
    const row = screen.getByRole("link", { name: new RegExp(mobile.title) });
    expect(within(row).getByText(rank)).toBeTruthy();
  });

  it("opens the case study from the main case and closes it", async () => {
    renderProjects();
    fireEvent.click(screen.getByRole("link", { name: /^Abrir case$/ }));
    const dialog = await screen.findByRole("dialog", {}, { timeout: 5000 });
    expect(within(dialog).getByText(featuredProject.long.pt)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("a ranked row links to its own page and opens the popup there", async () => {
    renderProjects();
    const row = screen.getByRole("link", { name: new RegExp(curatedProjects[0].title) });
    expect(row.getAttribute("href")).toBe(`/projetos/${curatedProjects[0].slug}/`);
    fireEvent.click(row);
    expect(await screen.findByRole("dialog", {}, { timeout: 5000 })).toBeTruthy();
  });

  it("a modified click on a row leaves it to the browser (new tab), without the popup", () => {
    renderProjects();
    fireEvent.click(screen.getByRole("link", { name: new RegExp(curatedProjects[0].title) }), { metaKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("a shared link opens the popup of its project, and closing it goes back to the list", async () => {
    const card = moreProjects[0];
    renderProjects(`/projetos/${card.slug}/`);
    const dialog = await screen.findByRole("dialog", {}, { timeout: 5000 });
    expect(within(dialog).getByRole("heading", { name: card.title })).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
