/**
 * GET JSON from the same-origin Worker proxy (/api/gh/...) first. If the proxy
 * is missing (GitHub Pages, local dev) or fails, ask GitHub directly.
 * A 200 that is not JSON (e.g. an SPA fallback page) counts as a failure too.
 */
export async function fetchJsonWithFallback<T>(proxyPath: string, directUrl: string): Promise<T> {
  try {
    return await getJson<T>(proxyPath);
  } catch {
    return getJson<T>(directUrl);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return (await res.json()) as T;
}
