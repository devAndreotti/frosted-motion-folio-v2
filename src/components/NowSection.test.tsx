import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NOW_ALSO, NOW_PROJECTS } from "@/data/now";
import NowSection from "./NowSection";

const renderNow = () =>
  render(
    <LanguageProvider>
      <NowSection />
    </LanguageProvider>
  );

describe("NowSection", () => {
  it("shows the about card next to every current project", () => {
    renderNow();
    expect(screen.getByText("Sobre mim")).toBeTruthy();
    for (const p of NOW_PROJECTS) expect(screen.getByText(p.title)).toBeTruthy();
  });

  it("links private projects to their public site, never to a repo", () => {
    renderNow();
    for (const p of NOW_PROJECTS.filter((x) => x.privateCode)) {
      const card = screen.getByRole("link", { name: new RegExp(p.title) });
      expect(card.getAttribute("href")).not.toContain("github.com");
      expect(within(card).getByText("código privado")).toBeTruthy();
    }
  });

  it("draws the Quality Gate checks instead of a screenshot", () => {
    renderNow();
    const card = screen.getByRole("link", { name: /Quality Gate/ });
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

  it("shows the portrait for the saved site color", () => {
    localStorage.setItem("hue", "red");
    const { container } = render(
      <ThemeProvider>
        <LanguageProvider>
          <NowSection />
        </LanguageProvider>
      </ThemeProvider>
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
});
