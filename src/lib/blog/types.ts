/** What the list, the cards and the prerendered pages know about a post (no body). */
export interface PostMeta {
  slug: string;
  title: string;
  /** YYYY-MM-DD, read as a calendar day (UTC), never shifted by the visitor's time zone. */
  date: string;
  description: string;
  tags: string[];
  /** Reading time, at 200 words a minute, at least 1. */
  minutes: number;
  /** Drafts show on the dev server only: builds leave them out and ship no text for them. */
  draft: boolean;
}
