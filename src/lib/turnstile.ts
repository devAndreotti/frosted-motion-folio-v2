// Cloudflare Turnstile, loaded only when the Worker says the newsletter form uses it (and only then
// does the visitor's browser talk to challenges.cloudflare.com).
interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: { sitekey: string; theme?: 'auto' | 'light' | 'dark'; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile: not available')));
    script.onerror = () => {
      loading = null;
      reject(new Error('turnstile: failed to load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}
