import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ColorPickerPopover from "./ColorPickerPopover";

const renderPicker = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <ColorPickerPopover />
        <button type="button">outside</button>
      </ThemeProvider>
    </LanguageProvider>
  );

describe("ColorPickerPopover", () => {
  it("keeps the swatches closed until the pill is clicked", () => {
    renderPicker();
    expect(screen.queryByRole("button", { name: "Cor de destaque: Azul" })).toBeNull();

    const trigger = screen.getByRole("button", { name: "Escolher cor de destaque" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Cor de destaque: Azul" })).toBeTruthy();
  });

  it("picking a swatch applies the hue and closes the popover", () => {
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Escolher cor de destaque" }));
    fireEvent.click(screen.getByRole("button", { name: "Cor de destaque: Azul" }));

    expect(screen.queryByRole("button", { name: "Cor de destaque: Azul" })).toBeNull();
    expect(localStorage.getItem("hue")).toBe("blue");
    expect(screen.getByRole("button", { name: "Escolher cor de destaque" }).textContent).toContain("Azul");
  });

  it("closes on Escape and on a click outside", () => {
    renderPicker();
    const trigger = screen.getByRole("button", { name: "Escolher cor de destaque" });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("is a labelled dialog: focus goes to the swatches on open and back to the pill on Escape", () => {
    renderPicker();
    const trigger = screen.getByRole("button", { name: "Escolher cor de destaque" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Escolher cor de destaque" });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);

    fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("picking a swatch also gives focus back to the pill", () => {
    renderPicker();
    const trigger = screen.getByRole("button", { name: "Escolher cor de destaque" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Cor de destaque: Azul" }));
    expect(document.activeElement).toBe(trigger);
  });
});
