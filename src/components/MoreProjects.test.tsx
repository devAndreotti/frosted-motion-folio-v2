import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MoreProjects, { INITIAL_CARDS } from "./MoreProjects";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { moreProjects } from "@/data/moreProjects";

const renderGallery = (onOpen = vi.fn()) => {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <MoreProjects projects={moreProjects} onOpen={onOpen} />
      </LanguageProvider>
    </MemoryRouter>,
  );
  return onOpen;
};

describe("MoreProjects", () => {
  it("shows the first cards, then all of them with 'see all', and back", () => {
    renderGallery();
    expect(moreProjects.length).toBeGreaterThan(INITIAL_CARDS);
    expect(screen.getAllByRole("listitem")).toHaveLength(INITIAL_CARDS);
    const toggle = screen.getByRole("button", { name: /Ver todos/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getAllByRole("listitem")).toHaveLength(moreProjects.length);
    fireEvent.click(screen.getByRole("button", { name: "Ver menos" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(INITIAL_CARDS);
  });

  it("opens the project of the clicked card, and each card links to its own page", () => {
    const onOpen = renderGallery();
    const card = screen.getByRole("link", { name: `Ver as telas de ${moreProjects[0].title}` });
    expect(card.getAttribute("href")).toBe(`/projetos/${moreProjects[0].slug}/`);
    fireEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith(moreProjects[0]);
  });

  it("leaves a modified click to the link (a new tab), without opening the popup", () => {
    const onOpen = renderGallery();
    fireEvent.click(screen.getByRole("link", { name: `Ver as telas de ${moreProjects[0].title}` }), { ctrlKey: true });
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("renders nothing without projects", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <MoreProjects projects={[]} onOpen={vi.fn()} />
        </LanguageProvider>
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
