import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Projects from "./Projects";

describe("Projects", () => {
  it("renders curated and full project lists", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <Projects />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("Self-Sync Daily")).toBeTruthy();
    expect(screen.getByText("Todos")).toBeTruthy();
  });
});
