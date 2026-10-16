import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HauntedMode from './HauntedMode';

describe('HauntedMode', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    document.documentElement.removeAttribute('data-haunted');
    localStorage.clear();
  });

  it('sets data-haunted on <html> while forced, and removes it on unmount', () => {
    window.history.replaceState({}, '', '/?haunted=1');
    const { unmount } = render(<HauntedMode />);
    expect(document.documentElement.hasAttribute('data-haunted')).toBe(true);
    unmount();
    expect(document.documentElement.hasAttribute('data-haunted')).toBe(false);
  });

  it('leaves the saved theme and hue in localStorage untouched', () => {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('hue', 'purple');
    window.history.replaceState({}, '', '/?haunted=1');
    render(<HauntedMode />);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(localStorage.getItem('hue')).toBe('purple');
  });

  it('does nothing outside 03:17 and without the query', () => {
    render(<HauntedMode />);
    expect(document.documentElement.hasAttribute('data-haunted')).toBe(false);
  });
});
