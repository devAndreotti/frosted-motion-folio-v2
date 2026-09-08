import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Timeline from "./Timeline";

describe("Timeline", () => {
  it("renders trajectory timeline section", () => {
    render(
      <LanguageProvider>
        <ThemeProvider>
          <Timeline />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("Como cheguei até aqui")).toBeTruthy();
    expect(screen.getByText("Trajetória")).toBeTruthy();
  });
});
