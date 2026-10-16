import type { SimPhase } from '@/data/privacy';

/** Days without a confirmation before the pending address is deleted -- the worker's PENDING_TTL_MS. */
export const DELETE_AFTER_DAYS = 7;

/** What exists about the visitor, given the step picked (0 asked, 1 confirmed, 2 left) and the days passed. */
export function phaseFor(step: number, day: number): SimPhase {
  if (step === 2) return 'left';
  if (step === 1) return 'active';
  return day >= DELETE_AFTER_DAYS ? 'deleted' : 'waiting';
}
