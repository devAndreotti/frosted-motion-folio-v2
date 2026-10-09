import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders footer contact elements and copyright", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <Footer />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Ricardo A. Gonçalves/i)).toBeTruthy();
  });

  it("lists Instagram and X with the other direct contacts", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <Footer />
        </ThemeProvider>
      </LanguageProvider>
    );

    const byHref = (href: string) => screen.getAllByRole("link").find((a) => a.getAttribute("href") === href);
    expect(byHref("https://www.instagram.com/ricardo.agonc")?.textContent).toContain("@ricardo.agonc");
    expect(byHref("https://x.com/devAndreotti")?.textContent).toContain("@devAndreotti");
  });
});
