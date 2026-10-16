/** The TV of Memory Apartment's card: two channels, the error screen and the bridge. */
export type TvKind = 'error' | 'bridge';

export interface TvChannel {
  /** Shown on the 7-segment display and the on-screen text. */
  num: string;
  kind: TvKind;
  /** The clock of the screen's bottom corner. */
  time: string;
}

export const TV_CHANNELS: TvChannel[] = [
  { num: '03', kind: 'error', time: '--:--' },
  { num: '17', kind: 'bridge', time: '03:17' },
];

/** Degrees the knob turns per channel (it is a dial: it keeps going the same way). */
export const KNOB_STEP = 72;
