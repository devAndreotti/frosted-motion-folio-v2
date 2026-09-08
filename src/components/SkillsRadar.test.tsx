import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SkillsRadar from "./SkillsRadar";

describe("SkillsRadar", () => {
  it("renders radar svg component with core skills", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <SkillsRadar />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText("TypeScript")).toBeTruthy();
  });
});
