import { afterEach, describe, expect, it } from "vitest";
import { trackImageLoading } from "./imageLoad";

let stop: (() => void) | undefined;
afterEach(() => {
  stop?.();
  document.body.innerHTML = "";
});

const addImg = (src = "x.webp") => {
  const img = document.createElement("img");
  img.setAttribute("src", src);
  document.body.appendChild(img);
  return img;
};

describe("trackImageLoading", () => {
  it("marks a picture as loaded when it fires load, and clears the failed mark", () => {
    stop = trackImageLoading();
    const img = addImg();
    img.dispatchEvent(new Event("error"));
    expect(img.hasAttribute("data-err")).toBe(true);
    img.dispatchEvent(new Event("load"));
    expect(img.hasAttribute("data-ld")).toBe(true);
    expect(img.hasAttribute("data-err")).toBe(false);
  });

  it("marks a picture as failed when it fires error", () => {
    stop = trackImageLoading();
    const img = addImg();
    img.dispatchEvent(new Event("error"));
    expect(img.hasAttribute("data-err")).toBe(true);
    expect(img.hasAttribute("data-ld")).toBe(false);
  });

  it("settles pictures that were already done before it started", () => {
    const done = addImg("a.webp");
    const broken = addImg("b.webp");
    const pending = addImg("c.webp");
    Object.defineProperty(done, "complete", { value: true });
    Object.defineProperty(done, "naturalWidth", { value: 800 });
    Object.defineProperty(broken, "complete", { value: true });
    Object.defineProperty(broken, "naturalWidth", { value: 0 });
    Object.defineProperty(pending, "complete", { value: false });
    stop = trackImageLoading();
    expect(done.hasAttribute("data-ld")).toBe(true);
    expect(broken.hasAttribute("data-err")).toBe(true);
    expect(pending.hasAttribute("data-ld") || pending.hasAttribute("data-err")).toBe(false);
  });

  it("stops listening once the cleanup runs", () => {
    stop = trackImageLoading();
    stop();
    const img = addImg();
    img.dispatchEvent(new Event("load"));
    expect(img.hasAttribute("data-ld")).toBe(false);
  });
});
