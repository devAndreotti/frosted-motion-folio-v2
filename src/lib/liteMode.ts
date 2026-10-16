/**
 * Lite mode: a lighter page for a visitor who asked for one -- Data Saver on, the "reduce data" preference, or a
 * laptop on battery that is nearly empty. It only ever turns on, and it marks <html data-lite>, which styles/lite.css
 * and BackgroundLayers read. Every check is feature-detected and never throws (getBattery is Chromium only).
 */

export const LITE_ATTR = 'data-lite';
const LOW_BATTERY_LEVEL = 0.2;

type NavigatorWithExtras = Navigator & {
  connection?: { saveData?: boolean };
  getBattery?: () => Promise<{ charging: boolean; level: number }>;
};

/** Data Saver is on (Chromium's navigator.connection.saveData). */
export function dataSaverOn(nav: Navigator = navigator): boolean {
  try {
    return (nav as NavigatorWithExtras).connection?.saveData === true;
  } catch {
    return false;
  }
}

/** The CSS `(prefers-reduced-data: reduce)` media query matches. */
export function reducedDataOn(win: Window = window): boolean {
  try {
    return typeof win.matchMedia === 'function' && win.matchMedia('(prefers-reduced-data: reduce)').matches;
  } catch {
    return false;
  }
}

/** Not charging and at or below 20%. Resolves false wherever the Battery API is missing or fails. */
export async function lowBatteryOn(nav: Navigator = navigator): Promise<boolean> {
  try {
    const getBattery = (nav as NavigatorWithExtras).getBattery;
    if (typeof getBattery !== 'function') return false;
    const battery = await getBattery.call(nav);
    return !battery.charging && battery.level <= LOW_BATTERY_LEVEL;
  } catch {
    return false;
  }
}

export function isLiteMode(root: HTMLElement = document.documentElement): boolean {
  return root.hasAttribute(LITE_ATTR);
}

/**
 * Turns lite mode on when a synchronous signal says so (set before the first paint), otherwise waits for the battery
 * check. Resolves to whether lite mode is on after the checks.
 */
export function initLiteMode(
  nav: Navigator = navigator,
  win: Window = window,
  root: HTMLElement = document.documentElement,
): Promise<boolean> {
  const turnOn = (on: boolean) => {
    if (on) root.setAttribute(LITE_ATTR, '');
    return on || isLiteMode(root);
  };
  if (turnOn(dataSaverOn(nav) || reducedDataOn(win))) return Promise.resolve(true);
  return lowBatteryOn(nav).then(turnOn);
}
