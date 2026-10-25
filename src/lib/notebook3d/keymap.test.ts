import { describe, expect, it } from 'vitest';
import { KEY_IDS, keyIdFromCode, keyKind } from './keymap';

describe('notebook3d keymap', () => {
  it('has a unique id per key', () => {
    expect(new Set(KEY_IDS).size).toBe(KEY_IDS.length);
  });

  it('reaches every key of the model from some physical code, except fn', () => {
    const codes = [
      'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Insert', 'PrintScreen', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
      'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0',
      'Minus', 'Equal', 'Backspace', 'NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract',
      'Tab', 'BracketLeft', 'BracketRight', 'Numpad7', 'Numpad8', 'Numpad9',
      'CapsLock', 'Semicolon', 'Quote', 'Backslash', 'Numpad4', 'Numpad5', 'Numpad6',
      'ShiftLeft', 'IntlBackslash', 'Comma', 'Period', 'Slash', 'ShiftRight', 'Numpad1', 'Numpad2', 'Numpad3',
      'ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'IntlRo',
      'ArrowUp', 'Numpad0', 'NumpadDecimal', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
      'Enter', 'NumpadAdd', 'NumpadEnter',
    ];
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => `Key${c.toUpperCase()}`);
    const reached = new Set([...codes, ...letters].map((c) => keyIdFromCode(c)));
    for (const id of KEY_IDS) {
      if (id === 'fn') continue;
      expect(reached.has(id), `no code reaches ${id}`).toBe(true);
    }
  });

  it('maps the ABNT2 keys by physical position', () => {
    expect(keyIdFromCode('KeyA')).toBe('a');
    expect(keyIdFromCode('Semicolon')).toBe('cedilha');
    expect(keyIdFromCode('IntlRo')).toBe('barra');
    expect(keyIdFromCode('Backquote')).toBe('aspas');
    expect(keyIdFromCode('Slash')).toBe('pv');
    expect(keyIdFromCode('IntlBackslash')).toBe('barra_inv');
    expect(keyIdFromCode('Digit5')).toBe('n5');
    expect(keyIdFromCode('Numpad5')).toBe('n_5');
    expect(keyIdFromCode('NumpadEnter')).toBe('n_enter');
    expect(keyIdFromCode('NumpadComma')).toBe('n_virg');
  });

  it('sends both Ctrl and both Win/Meta keys to the single model key', () => {
    expect(keyIdFromCode('ControlRight')).toBe('ctrl_e');
    expect(keyIdFromCode('ControlLeft')).toBe('ctrl_e');
    expect(keyIdFromCode('MetaRight')).toBe('win');
    expect(keyIdFromCode('MetaLeft')).toBe('win');
  });

  it('returns null for codes without a key, including prototype names', () => {
    expect(keyIdFromCode('Fn')).toBeNull();
    expect(keyIdFromCode('Unidentified')).toBeNull();
    expect(keyIdFromCode('')).toBeNull();
    expect(keyIdFromCode('constructor')).toBeNull();
  });

  it('classifies key sizes', () => {
    expect(keyKind('espaco')).toBe('space');
    expect(keyKind('enter')).toBe('wide');
    expect(keyKind('shift_d')).toBe('wide');
    expect(keyKind('n_0')).toBe('wide');
    expect(keyKind('n_mais')).toBe('wide');
    expect(keyKind('a')).toBe('normal');
    expect(keyKind('fn')).toBe('normal');
  });
});
