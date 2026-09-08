import { describe, expect, it } from "vitest";
import { strings, ACTIVITY_TEXT_EN } from "./i18n";
import type { Lang } from "./i18n.types";

const LANGS: Lang[] = ["pt", "en"];

describe("i18n dictionaries", () => {
  it.each(LANGS)("%s: every template function returns a non-empty string with the interpolated value", (lang) => {
    const t = strings[lang];

    expect(t.nav.reposLabel(42)).toContain("42");
    expect(t.header.photoAlt("Test Name")).toContain("Test Name");
    expect(t.header.projectAlt("Test Project")).toContain("Test Project");
    expect(t.projects.moreProjects(7)).toContain("7");
    expect(t.projects.viewDetailsAria("Some Project")).toContain("Some Project");
    expect(t.caseModal.dialogAria("Some Project")).toContain("Some Project");
    expect(t.caseModal.imageAlt("Some Project", 2)).toContain("Some Project");
    expect(t.caseModal.imageAlt("Some Project", 2)).toContain("2");
    expect(t.activity.updated("5 min")).toContain("5 min");
    expect(t.footer.localTime("10:00")).toContain("10:00");
    expect(t.footer.copyright("Test Name")).toContain("Test Name");
    expect(t.colorPicker.hueLabel("Blue")).toContain("Blue");
  });

  it.each(LANGS)("%s: heatmapTooltip pluralizes correctly for 0, 1, and many contributions", (lang) => {
    const t = strings[lang];

    expect(t.activity.heatmapTooltip(0, "Jan 1")).toContain("Jan 1");
    expect(t.activity.heatmapTooltip(1, "Jan 1")).toContain("1");
    expect(t.activity.heatmapTooltip(5, "Jan 1")).toContain("5");
    // The zero-count and one-count phrasing must differ from the multi-count phrasing (singular/plural or "no contributions").
    expect(t.activity.heatmapTooltip(0, "Jan 1")).not.toBe(t.activity.heatmapTooltip(5, "Jan 1"));
  });

  it("ACTIVITY_TEXT_EN covers every pt phrase mapEvent can produce", () => {
    const ptPhrases = ["Fez push", "Abriu um PR", "Fez merge de um PR", "Deu estrela", "Criou a branch", "Criou a tag", "Criou o repositório", "Abriu uma issue", "Fechou uma issue"];
    for (const phrase of ptPhrases) {
      expect(ACTIVITY_TEXT_EN[phrase]).toBeTruthy();
    }
  });
});
