import { describe, expect, it } from "vitest";
import { relativeTime } from "./useGithubActivity";

describe("relativeTime", () => {
  const now = new Date("2026-01-01T12:00:00Z").getTime();

  it("reports events under a minute old as just now", () => {
    expect(relativeTime(new Date(now - 30_000).toISOString(), now)).toBe("agora mesmo");
  });

  it("reports minutes for events under an hour old", () => {
    expect(relativeTime(new Date(now - 15 * 60_000).toISOString(), now)).toBe("há 15 min");
  });

  it("reports hours for events under a day old", () => {
    expect(relativeTime(new Date(now - 5 * 3_600_000).toISOString(), now)).toBe("há 5h");
  });

  it("reports days for events a day or older", () => {
    expect(relativeTime(new Date(now - 3 * 86_400_000).toISOString(), now)).toBe("há 3d");
  });
});
