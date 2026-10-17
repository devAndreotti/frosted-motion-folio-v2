import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CASES } from "./cases";

// Reads the disk, like the other data tests: a gallery entry whose file was never uploaded (or was renamed) fails here
// instead of showing a broken picture in the case dialog and on /projetos/<slug>/.
describe("case galleries", () => {
  it("points every gallery picture, cover and portrait at a file that exists in public/", () => {
    const missing: string[] = [];
    for (const c of CASES) {
      const paths = [c.image, ...c.images, ...(c.portrait ? [c.portrait] : [])];
      for (const src of paths) {
        const onDisk = src.startsWith("./projects/") && existsSync(`public/${src.replace(/^\.\//, "")}`);
        if (!onDisk) missing.push(`${c.slug}: ${src}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("starts every gallery with the cover, and has no picture listed twice", () => {
    for (const c of CASES) {
      expect(c.images[0], c.slug).toBe(c.image);
      expect(new Set(c.images).size, c.slug).toBe(c.images.length);
    }
  });
});
