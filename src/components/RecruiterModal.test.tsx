import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { contact } from "@/data/personal";
import RecruiterModal from "./RecruiterModal";

describe("RecruiterModal", () => {
  it("renders candidate information and quick case links", () => {
    const handleClose = vi.fn();
    render(
      <LanguageProvider>
        <ThemeProvider>
          <MemoryRouter>
            <RecruiterModal onClose={handleClose} />
          </MemoryRouter>
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/Ricardo A. Gonçalves/i)).toBeTruthy();
    expect(screen.getByText(/Git Wizard Commander/i)).toBeTruthy();
    expect(screen.getByText(/Gold Portfolio Analyzer/i)).toBeTruthy();
    expect(screen.getByText(/Cook App/i)).toBeTruthy();
  });

  it("renders resume download link when contact.resume is set", () => {
    const handleClose = vi.fn();
    render(
      <LanguageProvider>
        <ThemeProvider>
          <MemoryRouter>
            <RecruiterModal onClose={handleClose} />
          </MemoryRouter>
        </ThemeProvider>
      </LanguageProvider>
    );

    const resumeLink = screen.getByRole("link", { name: /currículo|résumé/i });
    expect(resumeLink).toBeTruthy();
    expect(resumeLink.getAttribute("href")).toBe(contact.resume);
    expect(resumeLink.getAttribute("target")).toBe("_blank");
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <LanguageProvider>
        <ThemeProvider>
          <MemoryRouter>
            <RecruiterModal onClose={handleClose} />
          </MemoryRouter>
        </ThemeProvider>
      </LanguageProvider>
    );

    const closeButton = screen.getByRole("button", { name: /fechar|close/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
