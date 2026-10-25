/**
 * Maps a physical key (KeyboardEvent.code) to the id of its key in the 3D keyboard model.
 * The model is the Lenovo LOQ's ABNT2 layout, so the ids follow the legends of the Brazilian keys
 * (the position is what matters: 'aspas' is the key left of the 1, whatever it prints).
 */

/** Every key of the model, in layout order. 'fn' has no KeyboardEvent.code. */
export const KEY_IDS: readonly string[] = [
  'esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
  'insert', 'prtsc', 'delete', 'home', 'end', 'pgup', 'pgdn',
  'aspas', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n0', 'menos', 'igual', 'backspace',
  'numlock', 'div', 'mult', 'sub',
  'tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'agudo', 'colchete_a',
  'n_7', 'n_8', 'n_9',
  'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'cedilha', 'til', 'colchete_f',
  'n_4', 'n_5', 'n_6',
  'shift_e', 'barra_inv', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'virgula', 'ponto', 'pv', 'shift_d',
  'n_1', 'n_2', 'n_3',
  'ctrl_e', 'fn', 'win', 'alt', 'espaco', 'altgr', 'barra', 'cima', 'n_0', 'n_virg', 'esq', 'baixo', 'dir',
  'enter', 'n_mais', 'n_enter',
];

const PAIRS: [string, string][] = [
  ['Escape', 'esc'],
  ['Insert', 'insert'], ['PrintScreen', 'prtsc'], ['Delete', 'delete'], ['Home', 'home'], ['End', 'end'],
  ['PageUp', 'pgup'], ['PageDown', 'pgdn'],
  ['Backquote', 'aspas'], ['Minus', 'menos'], ['Equal', 'igual'], ['Backspace', 'backspace'],
  ['NumLock', 'numlock'], ['NumpadDivide', 'div'], ['NumpadMultiply', 'mult'], ['NumpadSubtract', 'sub'],
  ['Tab', 'tab'], ['BracketLeft', 'agudo'], ['BracketRight', 'colchete_a'],
  ['CapsLock', 'caps'], ['Semicolon', 'cedilha'], ['Quote', 'til'], ['Backslash', 'colchete_f'],
  ['ShiftLeft', 'shift_e'], ['IntlBackslash', 'barra_inv'], ['Comma', 'virgula'], ['Period', 'ponto'],
  ['Slash', 'pv'], ['ShiftRight', 'shift_d'],
  ['ControlLeft', 'ctrl_e'], ['ControlRight', 'ctrl_e'], ['MetaLeft', 'win'], ['MetaRight', 'win'],
  ['AltLeft', 'alt'], ['Space', 'espaco'], ['AltRight', 'altgr'], ['IntlRo', 'barra'],
  ['ArrowUp', 'cima'], ['ArrowLeft', 'esq'], ['ArrowDown', 'baixo'], ['ArrowRight', 'dir'],
  ['Enter', 'enter'], ['NumpadAdd', 'n_mais'], ['NumpadEnter', 'n_enter'],
  ['NumpadDecimal', 'n_virg'], ['NumpadComma', 'n_virg'],
];

for (let i = 1; i <= 12; i++) PAIRS.push([`F${i}`, `f${i}`]);
for (let i = 1; i <= 9; i++) PAIRS.push([`Digit${i}`, `n${i}`], [`Numpad${i}`, `n_${i}`]);
PAIRS.push(['Digit0', 'n0'], ['Numpad0', 'n_0']);
for (const c of 'abcdefghijklmnopqrstuvwxyz') PAIRS.push([`Key${c.toUpperCase()}`, c]);

const BY_CODE = new Map<string, string>(PAIRS);

/** Key id for a KeyboardEvent.code, or null when no key of the model has that code. */
export function keyIdFromCode(code: string): string | null {
  return BY_CODE.get(code) ?? null;
}

export type KeyKind = 'normal' | 'space' | 'wide';

const WIDE = new Set(['enter', 'n_enter', 'backspace', 'shift_e', 'shift_d', 'caps', 'tab', 'n_0', 'n_mais']);

/** Size class of a key, which sets the pitch of its click (see keysound.ts). */
export function keyKind(id: string): KeyKind {
  if (id === 'espaco') return 'space';
  if (WIDE.has(id)) return 'wide';
  return 'normal';
}
