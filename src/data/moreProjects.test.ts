import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projects } from "./projects";
import { featuredProject, curatedProjects } from "./curatedProjects";
import { moreProjects } from "./moreProjects";

describe("moreProjects", () => {
  it("resolves every gallery project against projects.ts, with no duplicates and none of the curated ones", () => {
    const ids = moreProjects.map((p) => p.id);
    const curated = [featuredProject, ...curatedProjects].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const project of moreProjects) {
      expect(projects.some((p) => p.id === project.id)).toBe(true);
      expect(curated).not.toContain(project.id);
    }
  });

  it("has bilingual text and no 'what I did' list", () => {
    for (const project of moreProjects) {
      expect(project.description.pt.length).toBeGreaterThan(10);
      expect(project.description.en.length).toBeGreaterThan(10);
      expect(project.type.pt).toBeTruthy();
      expect(project.type.en).toBeTruthy();
      expect(project.points.pt).toEqual([]);
    }
  });

  it("points the cover and the gallery at photos that exist on disk", () => {
    for (const project of moreProjects) {
      expect(project.image).toBe(project.images[0]);
      for (const src of project.images) expect(existsSync(`public/${src.replace("./", "")}`), src).toBe(true);
    }
  });
});
