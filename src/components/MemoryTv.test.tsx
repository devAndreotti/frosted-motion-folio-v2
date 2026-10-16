import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MemoryTv from "./MemoryTv";
import * as audio from "@/lib/tvAudio";

vi.mock("@/lib/tvAudio", () => ({
  loadTvSounds: vi.fn(() => Promise.resolve()),
  startTvHum: vi.fn(),
  stopTvHum: vi.fn(),
  closeTvAudio: vi.fn(),
  tvClick: vi.fn(),
  tvClunk: vi.fn(),
}));

const renderTv = () =>
  render(
    <LanguageProvider>
      <MemoryTv />
    </LanguageProvider>
  );
const screenEl = () => screen.getByRole("img", { name: /Tela da TV/ });
const next = () => screen.getAllByRole("button", { name: "Próximo canal" })[1];

describe("MemoryTv", () => {
  beforeEach(() => {
    // jsdom has no canvas: the noise stays off, the rest of the TV is what these tests look at
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    localStorage.clear();
    vi.clearAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it("starts on the under-construction error screen, with no picture", () => {
    renderTv();
    expect(screenEl().getAttribute("aria-label")).toBe("Tela da TV: ERRO · EM CONSTRUÇÃO");
    expect(screen.getByText("EM CONSTRUÇÃO")).toBeTruthy();
    expect(screenEl().querySelector("img")).toBeNull();
    expect(screen.getByText("CH 03 · ERRO · EM CONSTRUÇÃO")).toBeTruthy();
  });

  it("changes channel with the + key, the dial and the − key, and wraps around", () => {
    renderTv();
    fireEvent.click(next());
    expect(screenEl().getAttribute("aria-label")).toBe("Tela da TV: A PONTE");
    expect((screenEl().querySelector("img.mtv-bg") as HTMLImageElement).getAttribute("src")).toBe("./now/tv/ponte.webp");
    expect(screen.queryByText("EM CONSTRUÇÃO")).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Próximo canal" })[0]); // the dial
    expect(screenEl().getAttribute("aria-label")).toBe("Tela da TV: ERRO · EM CONSTRUÇÃO");
    fireEvent.click(screen.getByRole("button", { name: "Canal anterior" }));
    expect(screenEl().getAttribute("aria-label")).toBe("Tela da TV: A PONTE");
  });

  it("turns the dial a step per change, and flashes the screen on every one", () => {
    renderTv();
    const dial = screen.getAllByRole("button", { name: "Próximo canal" })[0];
    expect(dial.style.transform).toBe("rotate(0deg)");
    fireEvent.click(next());
    expect(dial.style.transform).toBe("rotate(72deg)");
    expect(screenEl().className).toContain("za");
    fireEvent.click(next());
    expect(screenEl().className).toContain("zb");
  });

  it("wobbles the antenna and fills the screen with static when the antenna is touched", () => {
    renderTv();
    fireEvent.click(screen.getByRole("button", { name: "Ajustar a antena" }));
    expect(screen.getByRole("button", { name: "Ajustar a antena" }).className).toContain("wa");
    expect(screenEl().className).toContain("hit-ant");
    expect(audio.tvClick).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Ajustar a antena" }));
    expect(screen.getByRole("button", { name: "Ajustar a antena" }).className).toContain("wb");
  });

  it("jolts the picture and thunks when the screen is hit, and the jolt wears off", () => {
    vi.useFakeTimers();
    renderTv();
    fireEvent.click(screen.getByRole("button", { name: "Bater na TV" }));
    expect(screenEl().className).toContain("hit-tap");
    expect(audio.tvClunk).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screenEl().className).not.toContain("hit-");
    vi.useRealTimers();
  });

  it("hums while the TV is on with sound, clicks on the keys, and goes quiet when switched off", () => {
    renderTv();
    expect(audio.startTvHum).toHaveBeenCalled();
    fireEvent.click(next());
    expect(audio.tvClick).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Ligar ou desligar a TV" }));
    expect(audio.tvClunk).toHaveBeenCalled();
    expect(audio.stopTvHum).toHaveBeenCalled();
  });

  it("mutes from its own button and remembers the choice", () => {
    renderTv();
    const snd = screen.getByRole("button", { name: /SOM · LIGADO/ });
    expect(snd.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(snd);
    expect(screen.getByRole("button", { name: /SOM · DESLIGADO/ }).getAttribute("aria-pressed")).toBe("false");
    expect(localStorage.getItem("tv.sound")).toBe("0");
    vi.mocked(audio.tvClick).mockClear();
    fireEvent.click(next());
    expect(audio.tvClick).not.toHaveBeenCalled();
  });

  it("starts muted for a visitor who muted it before", () => {
    localStorage.setItem("tv.sound", "0");
    renderTv();
    expect(screen.getByRole("button", { name: /SOM · DESLIGADO/ })).toBeTruthy();
    expect(audio.startTvHum).not.toHaveBeenCalled();
  });

  describe("power", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("switches off and on again, and a channel key wakes it up", () => {
      renderTv();
      const power = screen.getByRole("button", { name: "Ligar ou desligar a TV" });
      expect(power.getAttribute("aria-pressed")).toBe("true");
      fireEvent.click(power);
      expect(power.getAttribute("aria-pressed")).toBe("false");
      expect(screenEl().className).toContain("off");
      fireEvent.click(power);
      expect(screenEl().className).toContain("on");
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screenEl().className).not.toContain(" on");
      fireEvent.click(power);
      fireEvent.click(next());
      expect(power.getAttribute("aria-pressed")).toBe("true");
      expect(screenEl().className).not.toContain("off");
    });
  });
});
