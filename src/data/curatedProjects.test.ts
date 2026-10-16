import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projects } from "./projects";
import { featuredProject, curatedProjects, CATEGORY_FILTERS } from "./curatedProjects";

const VALID_CATEGORIES = new Set(CATEGORY_FILTERS.map((f) => f.key).filter((k) => k !== "all"));

describe("curatedProjects", () => {
  it("resolves the featured project against a real entry in the full project list", () => {
    expect(projects.some((p) => p.id === featuredProject.id)).toBe(true);
    expect(featuredProject.title).toBeTruthy();
    expect(featuredProject.long.pt.length).toBeGreaterThan(featuredProject.description.pt.length);
    expect(featuredProject.long.en.length).toBeGreaterThan(featuredProject.description.en.length);
    expect(featuredProject.points.pt.length).toBeGreaterThan(0);
    expect(featuredProject.points.en.length).toBe(featuredProject.points.pt.length);
  });

  it("resolves every curated project against a real entry, with no duplicates and a valid category", () => {
    const ids = curatedProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(featuredProject.id);

    for (const project of curatedProjects) {
      expect(projects.some((p) => p.id === project.id)).toBe(true);
      expect(VALID_CATEGORIES.has(project.cat)).toBe(true);
      expect(project.points.pt.length).toBeGreaterThan(0);
      expect(project.points.en.length).toBe(project.points.pt.length);
      expect(project.images.length).toBeGreaterThan(0);
    }
  });

  it("points every cover, gallery shot and portrait at a file that exists in public/", () => {
    const missing: string[] = [];
    for (const project of [featuredProject, ...curatedProjects]) {
      const paths = [project.image, ...project.images, ...(project.portrait ? [project.portrait] : [])];
      for (const src of paths) if (!existsSync(`public/${src.replace(/^\.\//, "")}`)) missing.push(`${project.title}: ${src}`);
    }
    expect(missing).toEqual([]);
  });

  it("keeps the cover as the first picture of the gallery", () => {
    for (const project of [featuredProject, ...curatedProjects]) expect(project.images[0]).toBe(project.image);
  });
});

