import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

  it("lists side projects; the private one has no link", () => {
    renderNow();
    for (const item of NOW_ALSO) {
      const name = screen.getByText(item.name);
      expect(Boolean(name.closest("a"))).toBe(Boolean(item.href));
    }
  });
});
