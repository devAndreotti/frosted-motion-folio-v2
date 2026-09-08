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
});
