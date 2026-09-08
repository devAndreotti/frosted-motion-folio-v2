import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SudoTerminal from "./SudoTerminal";

describe("SudoTerminal", () => {
  it("opens terminal when typing sudo key sequence and processes commands", () => {
    render(
      <ThemeProvider>
        <SudoTerminal />
      </ThemeProvider>
    );

    // Sequence trigger
    fireEvent.keyDown(window, { key: "s" });
    fireEvent.keyDown(window, { key: "u" });
    fireEvent.keyDown(window, { key: "d" });
    fireEvent.keyDown(window, { key: "o" });

    expect(screen.getByRole("dialog", { name: /Terminal/i })).toBeTruthy();
    expect(screen.getByPlaceholderText(/digite um comando/i)).toBeTruthy();

    const input = screen.getByPlaceholderText(/digite um comando/i);
    fireEvent.change(input, { target: { value: "whoami" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByText(/Ricardo A. Gonçalves/i)).toBeTruthy();
  });

  it("handles steins gate easter egg", () => {
    render(
      <ThemeProvider>
        <SudoTerminal />
      </ThemeProvider>
    );

    fireEvent.keyDown(window, { key: "s" });
    fireEvent.keyDown(window, { key: "u" });
    fireEvent.keyDown(window, { key: "d" });
    fireEvent.keyDown(window, { key: "o" });

    const input = screen.getByPlaceholderText(/digite um comando/i);
    fireEvent.change(input, { target: { value: "el psy kongroo" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByText(/1.048596%/i)).toBeTruthy();
    expect(screen.getByText(/Operation Skuld/i)).toBeTruthy();
  });
});
