import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchJsonWithFallback } from "./githubFetch";

const PROXY = "/api/gh/user";
const DIRECT = "https://api.github.com/users/devAndreotti";

function reply(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

describe("fetchJsonWithFallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the proxy and skips GitHub when the proxy answers", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(reply(200, { public_repos: 69 })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJsonWithFallback(PROXY, DIRECT)).resolves.toEqual({ public_repos: 69 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(PROXY);
  });

  it("falls back to GitHub on a non-2xx proxy answer", async () => {
    const fetchMock = vi.fn((url: string) => Promise.resolve(url === PROXY ? reply(404, {}) : reply(200, { public_repos: 3 })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJsonWithFallback(PROXY, DIRECT)).resolves.toEqual({ public_repos: 3 });
    expect(fetchMock).toHaveBeenLastCalledWith(DIRECT);
  });

  it("falls back to GitHub on a network error", async () => {
    const fetchMock = vi.fn((url: string) => (url === PROXY ? Promise.reject(new TypeError("offline")) : Promise.resolve(reply(200, { ok: 1 }))));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJsonWithFallback(PROXY, DIRECT)).resolves.toEqual({ ok: 1 });
  });

  it("falls back to GitHub when the proxy returns a 200 that is not JSON", async () => {
    const html = { ok: true, status: 200, json: () => Promise.reject(new SyntaxError("Unexpected token <")) };
    const fetchMock = vi.fn((url: string) => Promise.resolve(url === PROXY ? html : reply(200, { public_repos: 5 })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJsonWithFallback(PROXY, DIRECT)).resolves.toEqual({ public_repos: 5 });
  });

  it("rejects when both the proxy and GitHub fail", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(reply(500, {}))));

    await expect(fetchJsonWithFallback(PROXY, DIRECT)).rejects.toThrow("responded 500");
  });
});
