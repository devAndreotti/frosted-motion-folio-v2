import { describe, expect, it } from "vitest";
import { lastYear, summarize, toWeeks } from "./contributions";
import type { ContributionDay } from "@/hooks/useGithubContributions";

const day = (date: string, count: number): ContributionDay => ({ date, count, level: count === 0 ? 0 : 1 });

describe("summarize", () => {
  it("adds up contributions, active days and the longest consecutive run", () => {
    const days = [day("2026-01-01", 2), day("2026-01-02", 0), day("2026-01-03", 1), day("2026-01-04", 4), day("2026-01-05", 1), day("2026-01-06", 0)];
    expect(summarize(days)).toEqual({ total: 8, activeDays: 4, longestStreak: 3 });
  });

  it("is all zeros for no data", () => {
    expect(summarize([])).toEqual({ total: 0, activeDays: 0, longestStreak: 0 });
  });
});

describe("lastYear", () => {
  it("keeps only the 365 days ending today, dropping future days", () => {
    const days = [day("2025-01-01", 1), day("2025-10-07", 1), day("2026-10-06", 1), day("2026-10-07", 0)];
    expect(lastYear(days, "2026-10-06").map((d) => d.date)).toEqual(["2025-10-07", "2026-10-06"]);
  });

  it("anchors the window at the newest day it has when the data stops early", () => {
    const days = [day("2025-08-01", 1), day("2026-08-01", 2)];
    expect(lastYear(days, "2026-10-06").map((d) => d.date)).toEqual(["2026-08-01"]);
    expect(lastYear([], "2026-10-06")).toEqual([]);
  });
});

describe("toWeeks", () => {
  it("returns exactly the requested number of 7-day columns, newest last", () => {
    const days = Array.from({ length: 20 }, (_, i) => day(`2026-01-${String(i + 1).padStart(2, "0")}`, i));
    const weeks = toWeeks(days, 4);
    expect(weeks).toHaveLength(4);
    weeks.forEach((w) => expect(w).toHaveLength(7));
    // 2026-01-20 is a Tuesday: it sits in row 2 of the last column, the rest of that week is empty.
    expect(weeks[3][2]?.date).toBe("2026-01-20");
    expect(weeks[3].slice(3)).toEqual([null, null, null, null]);
  });

  it("pads the start with empty slots when there is less history than requested", () => {
    const weeks = toWeeks([day("2026-01-03", 1)], 2);
    expect(weeks[0].every((d) => d === null)).toBe(true);
    expect(weeks[1][6]?.date).toBe("2026-01-03");
  });

  it("is empty for no data", () => {
    expect(toWeeks([])).toEqual([]);
  });
});
