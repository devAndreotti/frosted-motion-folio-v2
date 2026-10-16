import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EGG_EVENTS } from "@/lib/eggs";
import SudoTerminal from "./SudoTerminal";

const runCommand = (command: string) => {
  const input = screen.getByPlaceholderText(/digite um comando/i);
  fireEvent.change(input, { target: { value: command } });
  fireEvent.submit(input.closest("form")!);
};

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

  it("opens from the Konami easter egg event and runs sudo hire ricardo", () => {
    render(
      <ThemeProvider>
        <SudoTerminal />
      </ThemeProvider>
    );
    expect(screen.queryByRole("dialog", { name: /Terminal/i })).toBeNull();
    act(() => {
      window.dispatchEvent(new Event(EGG_EVENTS.openTerminal));
    });
    expect(screen.getByRole("dialog", { name: /Terminal/i })).toBeTruthy();

    runCommand("sudo hire ricardo");
    expect(screen.getByText("> contratação aprovada [ OK ]")).toBeTruthy();
    expect(screen.getByText("contato direto: devandreotti@gmail.com")).toBeTruthy();
  });

  it("answers any other sudo command with a permission hint", () => {
    render(
      <ThemeProvider>
        <SudoTerminal />
      </ThemeProvider>
    );
    act(() => {
      window.dispatchEvent(new Event(EGG_EVENTS.openTerminal));
    });
    runCommand("sudo rm -rf /");
    expect(screen.getByText(/permissão negada/)).toBeTruthy();
    expect(screen.queryByText("> contratação aprovada [ OK ]")).toBeNull();
  });

  it("lists sudo hire ricardo in help", () => {
    render(
      <ThemeProvider>
        <SudoTerminal />
      </ThemeProvider>
    );
    act(() => {
      window.dispatchEvent(new Event(EGG_EVENTS.openTerminal));
    });
    runCommand("help");
    expect(screen.getByText("sudo hire ricardo")).toBeTruthy();
  });
});
