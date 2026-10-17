// Strings of the "Agora" section; split out of i18n.types.ts to keep it under 300 lines.
export interface NowStrings {
  sectionLabel: string;
  title: string;
  subtitle: string;
  /** "Updated on <date>", under the section subtitle. */
  updated: (date: string) => string;
  /** Link under the date, to /agora/ (the earlier versions of this section). */
  archiveLink: string;
  aboutLabel: string;
  aboutBody: string;
  /** "Interests: ..." line under the about text, in the same type as the hero highlight line. */
  interests: string;
  facts: { label: string; value: string }[];
  privateCode: string;
  alsoLabel: string;
  privateTag: string;
  /** Closing card of "also in the oven": out to the rest of the repositories. */
  alsoMore: string;
  alsoMoreNote: string;
  /** Private projects open a card: the cue on the item, and the card's labels. */
  alsoOpen: string;
  alsoWhat: string;
  alsoPrivateFoot: string;
  /** Toggle under a project card's description, when the text runs past four lines. */
  readMore: string;
  readLess: string;
  alsoGithub: string;
  /** Memory Apartment's card opens a TV instead of a site. */
  tv: {
    open: string;
    dialogAria: (title: string) => string;
    screenAria: (channel: string) => string;
    power: string;
    next: string;
    prev: string;
    knob: string;
    errTitle: string;
    errSub: string;
    osdDate: string;
    osdError: string;
    bridgeAlt: string;
    channelError: string;
    channelBridge: string;
    tvOn: string;
    tvOff: string;
    soundOn: string;
    soundOff: string;
    antenna: string;
    tap: string;
  };
}
