import { describe, expect, it } from "vitest";
import { mapEvent, relativeTime } from "./useGithubActivity";

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

const base = { id: "1", repo: { name: "devAndreotti/self-sync-daily" }, created_at: "2026-01-01T12:00:00Z" };

describe("mapEvent", () => {
  it("maps a push event, preferring the last real commit message", () => {
    const item = mapEvent({ ...base, type: "PushEvent", payload: { ref: "refs/heads/main", commits: [{ message: "wip" }, { message: "fix: bug" }] } });
    expect(item).toEqual({ id: "1", kind: "push", repo: "devAndreotti/self-sync-daily", text: "Fez push", detail: "fix: bug", time: base.created_at });
  });

  it("keeps another user's repo name as-is (a star or issue can land outside our own repos)", () => {
    const item = mapEvent({ ...base, repo: { name: "someone-else/their-repo" }, type: "WatchEvent", payload: {} });
    expect(item?.repo).toBe("someone-else/their-repo");
  });

  it("falls back to the branch name when a push event has no commits array", () => {
    const item = mapEvent({ ...base, type: "PushEvent", payload: { ref: "refs/heads/main" } });
    expect(item?.detail).toBe("push em main");
  });

  it("maps an opened pull request", () => {
    const item = mapEvent({ ...base, type: "PullRequestEvent", payload: { action: "opened", pull_request: { title: "feat: x" } } });
    expect(item).toMatchObject({ kind: "pr", text: "Abriu um PR", detail: "feat: x" });
  });

  it("maps a merged pull request", () => {
    const item = mapEvent({ ...base, type: "PullRequestEvent", payload: { action: "closed", pull_request: { title: "feat: x", merged: true } } });
    expect(item).toMatchObject({ kind: "pr", text: "Fez merge de um PR" });
  });

  it("skips a pull request event that was closed without merging", () => {
    expect(mapEvent({ ...base, type: "PullRequestEvent", payload: { action: "closed", pull_request: { merged: false } } })).toBeNull();
  });

  it("skips noisy pull request actions like synchronize", () => {
    expect(mapEvent({ ...base, type: "PullRequestEvent", payload: { action: "synchronize" } })).toBeNull();
  });

  it("maps a star", () => {
    const item = mapEvent({ ...base, type: "WatchEvent", payload: {} });
    expect(item).toMatchObject({ kind: "star", text: "Deu estrela" });
  });

  it("maps a new branch, tag and repository distinctly", () => {
    expect(mapEvent({ ...base, type: "CreateEvent", payload: { ref_type: "branch", ref: "feat/x" } })).toMatchObject({ text: "Criou a branch", detail: "feat/x" });
    expect(mapEvent({ ...base, type: "CreateEvent", payload: { ref_type: "tag", ref: "v1.0" } })).toMatchObject({ text: "Criou a tag", detail: "v1.0" });
    expect(mapEvent({ ...base, type: "CreateEvent", payload: { ref_type: "repository" } })).toMatchObject({ text: "Criou o repositório" });
  });

  it("maps opened and closed issues, skipping other actions", () => {
    expect(mapEvent({ ...base, type: "IssuesEvent", payload: { action: "opened", issue: { title: "bug" } } })).toMatchObject({ kind: "issue", text: "Abriu uma issue", detail: "bug" });
    expect(mapEvent({ ...base, type: "IssuesEvent", payload: { action: "closed", issue: { title: "bug" } } })).toMatchObject({ text: "Fechou uma issue" });
    expect(mapEvent({ ...base, type: "IssuesEvent", payload: { action: "edited" } })).toBeNull();
  });

  it("returns null for an unsupported event type", () => {
    expect(mapEvent({ ...base, type: "ForkEvent", payload: {} })).toBeNull();
  });

  it("returns null for a malformed event", () => {
    expect(mapEvent({ type: "PushEvent" })).toBeNull();
    expect(mapEvent(null)).toBeNull();
  });
});
