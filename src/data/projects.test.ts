import { describe, expect, it } from "vitest";
import { projects } from "./projects";
import { CASES, caseBySlug } from "./cases";

describe("project slugs", () => {
  it("gives every project a lowercase slug, unique across the list", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("gives every case a page of its own, with a slug nobody else uses", () => {
    const slugs = CASES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(CASES.length).toBeGreaterThan(0);
    for (const c of CASES) expect(caseBySlug(c.slug)).toBe(c);
  });

  it("finds no case for an unknown or missing slug", () => {
    expect(caseBySlug("nao-existe")).toBeUndefined();
    expect(caseBySlug(undefined)).toBeUndefined();
  });
});
