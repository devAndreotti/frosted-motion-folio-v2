import { describe, expect, it } from "vitest";
import { sortAndTrim, type ContributionDay } from "./useGithubContributions";

function day(date: string): ContributionDay {
  return { date, count: 0, level: 0 };
}

describe("sortAndTrim", () => {
  it("sorts year-grouped (descending-year, ascending-within-year) API data into full chronological order", () => {
    // Mirrors the real ?y=all response shape: newest year's days first, oldest year's days last.
    const outOfOrder = [day("2026-01-05"), day("2026-01-06"), day("2025-01-01"), day("2025-01-02")];

    const sorted = sortAndTrim(outOfOrder, 10);

    expect(sorted.map((d) => d.date)).toEqual(["2025-01-01", "2025-01-02", "2026-01-05", "2026-01-06"]);
  });

  it("keeps only the trailing N days once sorted, not the first N of the raw order", () => {
    const days = [day("2026-01-05"), day("2025-01-01"), day("2025-01-02"), day("2026-01-06")];

    const trimmed = sortAndTrim(days, 2);

    expect(trimmed.map((d) => d.date)).toEqual(["2026-01-05", "2026-01-06"]);
  });

  it("does not mutate the input array", () => {
    const days = [day("2026-01-02"), day("2026-01-01")];
    const original = [...days];

    sortAndTrim(days, 10);

    expect(days).toEqual(original);
  });
});
