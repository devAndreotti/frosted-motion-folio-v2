import { describe, expect, it } from "vitest";
import { projects } from "./projects";
import { featuredProject, curatedProjects, CATEGORY_FILTERS } from "./curatedProjects";

const VALID_CATEGORIES = new Set(CATEGORY_FILTERS.map((f) => f.key).filter((k) => k !== "all"));

describe("curatedProjects", () => {
  it("resolves the featured project against a real entry in the full project list", () => {
    expect(projects.some((p) => p.id === featuredProject.id)).toBe(true);
    expect(featuredProject.title).toBeTruthy();
    expect(featuredProject.long.length).toBeGreaterThan(featuredProject.description.length);
    expect(featuredProject.points.length).toBeGreaterThan(0);
  });

  it("resolves every curated project against a real entry, with no duplicates and a valid category", () => {
    const ids = curatedProjects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(featuredProject.id);

    for (const project of curatedProjects) {
      expect(projects.some((p) => p.id === project.id)).toBe(true);
      expect(VALID_CATEGORIES.has(project.cat)).toBe(true);
      expect(project.points.length).toBeGreaterThan(0);
    }
  });
});
