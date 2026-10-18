import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { EGG_EVENTS } from "@/lib/eggs";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NOW_ALSO, NOW_PROJECTS, NOW_UPDATED } from "@/data/now";
import NowSection from "./NowSection";

const renderNow = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <NowSection />
      </LanguageProvider>
    </MemoryRouter>
  );

describe("NowSection", () => {
  it("says when the list was last reviewed, as a machine-readable date", () => {
    const { container } = renderNow();
    const stamp = container.querySelector("time");
    expect(stamp?.getAttribute("datetime")).toBe(NOW_UPDATED);
    expect(stamp?.textContent).toMatch(/^Atualizado em .*2026$/);
  });

  it("shows the about card next to every current project", () => {
    renderNow();
    expect(screen.getByText("Sobre mim")).toBeTruthy();
    for (const p of NOW_PROJECTS) expect(screen.getByText(p.title)).toBeTruthy();
  });

  it("links the projects with a site out of the page, and never to a private repo", () => {
    renderNow();
    for (const p of NOW_PROJECTS.filter((x) => x.privateCode && x.href)) {
      const link = screen.getByRole("link", { name: new RegExp(p.title) });
      const card = link.closest(".nc") as HTMLElement;
      expect(link.getAttribute("href")).not.toContain("github.com");
      expect(within(card).getByText("código privado")).toBeTruthy();
    }
  });

  it("opens Memory Apartment's TV in a dialog instead of linking to its site", () => {
    renderNow();
    const project = NOW_PROJECTS.find((x) => x.tv)!;
    expect(project.href).toBeUndefined();
    expect(screen.queryByRole("link", { name: new RegExp(project.title) })).toBeNull();
    const card = screen.getByRole("button", { name: new RegExp(project.title) }).closest(".nc") as HTMLElement;
    expect(within(card).getByText("código privado")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(project.title) }));
    const dialog = screen.getByRole("dialog", { name: /TV de/ });
    expect(within(dialog).getByRole("img", { name: /Tela da TV/ })).toBeTruthy();
    expect(dialog.querySelector("a[href]")).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("draws the Quality Gate checks instead of a screenshot", () => {
    renderNow();
    const card = screen.getByRole("link", { name: /Quality Gate/ }).closest(".nc") as HTMLElement;
    expect(within(card).getByText("Tests & ratchet")).toBeTruthy();
    expect(card.querySelector("img")).toBeNull();
  });

  it("lists side projects; each with details opens a card, the public one links to its repo from inside", () => {
    renderNow();
    for (const item of NOW_ALSO) {
      const name = screen.getByText(item.name);
      expect(Boolean(name.closest("button"))).toBe(Boolean(item.details));
    }
    const repo = NOW_ALSO.find((x) => x.href && x.details)!;
    fireEvent.click(screen.getByRole("button", { name: new RegExp(repo.name) }));
    const link = within(screen.getByRole("dialog")).getByRole("link", { name: /GitHub/ });
    expect(link.getAttribute("href")).toBe(repo.href);
  });

  it("gives each side project its own hover color and opens private ones as a card in their palette", () => {
    renderNow();
    const kali = NOW_ALSO.find((x) => x.name === "Kali Layer")!;
    const button = screen.getByRole("button", { name: /Kali Layer/ });
    expect(button.closest("li")?.style.getPropertyValue("--brand")).toBe(kali.color);

    fireEvent.click(button);
    const card = screen.getByRole("dialog", { name: "Kali Layer" });
    expect(card.style.getPropertyValue("--p-ac")).toBe(kali.color);
    expect(within(card).getByText(kali.details!.features.pt[0])).toBeTruthy();

    fireEvent.click(within(card).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the Cockpit card from its button, with the private footer and the yellow hover color", () => {
    renderNow();
    const cockpit = NOW_ALSO.find((x) => x.name === "Cockpit")!;
    const button = screen.getByRole("button", { name: /Cockpit/ });
    expect(button.closest("li")?.style.getPropertyValue("--brand")).toBe("#eab308");

    fireEvent.click(button);
    const card = screen.getByRole("dialog", { name: "Cockpit" });
    expect(within(card).getByText(cockpit.details!.features.pt[0])).toBeTruthy();
    expect(within(card).getByText("projeto privado: ainda sem página pública.")).toBeTruthy();
    expect(within(card).queryByRole("link")).toBeNull();
  });

  it("tints the popups of Cockpit, Kali Layer and Hyprland only with their own color", () => {
    renderNow();
    const tinted = NOW_ALSO.filter((x) => x.details?.tint).map((x) => x.name).sort();
    expect(tinted).toEqual(["Cockpit", "Kali Layer"]);
    fireEvent.click(screen.getByRole("button", { name: /Cockpit/ }));
    expect(screen.getByRole("dialog", { name: "Cockpit" }).className).toContain("tint");
  });

  it("cuts a long card text with a read-more button that toggles aria-expanded, without opening the TV", () => {
    renderNow();
    const project = NOW_PROJECTS.find((x) => x.tv)!;
    const card = screen.getByRole("button", { name: new RegExp(project.title) }).closest(".nc") as HTMLElement;
    const more = within(card).getByRole("button", { name: "ler mais" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    const text = within(card).getByText(project.pitch.pt);
    expect(text.getAttribute("id")).toBe(more.getAttribute("aria-controls"));
    expect(text.className).not.toContain("open");

    fireEvent.click(more);
    expect(screen.queryByRole("dialog", { name: /TV de/ })).toBeNull();
    expect(within(card).getByRole("button", { name: "ler menos" }).getAttribute("aria-expanded")).toBe("true");
    expect(text.className).toContain("open");

    fireEvent.click(within(card).getByRole("button", { name: "ler menos" }));
    expect(within(card).getByRole("button", { name: "ler mais" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("shows the read-more button only for descriptions long enough to run past four lines", () => {
    renderNow();
    for (const p of NOW_PROJECTS) {
      const card = screen.getByText(p.pitch.pt).closest(".nc") as HTMLElement;
      expect(within(card).queryByRole("button", { name: "ler mais" }) !== null).toBe(p.pitch.pt.length > 220);
    }
  });

  it("shows the portrait for the saved site color", () => {
    localStorage.setItem("hue", "red");
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <NowSection />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(container.querySelector(".about-ph")?.getAttribute("src")).toBe("./profile/red.webp");
    localStorage.clear();
  });

  it("closes the side projects with a link out to the rest of the repositories", () => {
    renderNow();
    const more = screen.getByRole("link", { name: /Ver mais/ });
    expect(more.getAttribute("href")).toBe("https://github.com/devAndreotti?tab=repositories");
    expect(more.closest("li")?.className).toBe("also-more");
  });

  it("opens the same Memory Apartment TV dialog from the TV-typing easter egg event", () => {
    renderNow();
    expect(screen.queryByRole("dialog", { name: /TV de/ })).toBeNull();
    act(() => {
      window.dispatchEvent(new Event(EGG_EVENTS.openTv));
    });
    expect(screen.getByRole("dialog", { name: /TV de/ })).toBeTruthy();
  });
});
