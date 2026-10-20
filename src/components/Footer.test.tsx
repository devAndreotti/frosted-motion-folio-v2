import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders footer contact elements and copyright", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <MemoryRouter>
            <Footer />
          </MemoryRouter>
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Ricardo A. Gonçalves/i)).toBeTruthy();
    // the bottom bar is only the copyright and "back to top": no stack line, no "Uses" link
    expect(screen.queryByText(/feito com React/)).toBeNull();
    expect(screen.getByRole("button", { name: /voltar ao topo|back to top/i })).toBeTruthy();
  });

  it("lists Instagram and X with the other direct contacts", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <MemoryRouter>
            <Footer />
          </MemoryRouter>
        </ThemeProvider>
      </LanguageProvider>
    );

    const byHref = (href: string) => screen.getAllByRole("link").find((a) => a.getAttribute("href") === href);
    expect(byHref("https://www.instagram.com/ricardo.agonc")?.textContent).toContain("@ricardo.agonc");
    expect(byHref("https://x.com/devAndreotti")?.textContent).toContain("@devAndreotti");
  });
});
