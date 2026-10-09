/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Umami tracker script URL; set only in the Cloudflare build. */
  readonly VITE_UMAMI_SRC?: string;
  /** Umami website id for devandreotti.com. */
  readonly VITE_UMAMI_ID?: string;
}
