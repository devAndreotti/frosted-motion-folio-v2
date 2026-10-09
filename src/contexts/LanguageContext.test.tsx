import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { detectLang, initialLang, LanguageProvider, PICK_KEY, useLanguage } from './LanguageContext';

const Probe = () => {
  const { lang, setLang, toggleLang } = useLanguage();
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('en')}>en</button>
      <button onClick={toggleLang}>toggle</button>
    </>
  );
};

const setBrowser = (languages: string[]) => Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });

describe('detectLang', () => {
  it('gives Portuguese browsers PT and every other language EN', () => {
    expect(detectLang(['pt-BR', 'en'])).toBe('pt');
    expect(detectLang(['pt-PT'])).toBe('pt');
    expect(detectLang(['en-US', 'pt-BR'])).toBe('en');
    expect(detectLang(['es-ES'])).toBe('en');
  });

  it('keeps PT when the browser says nothing', () => {
    expect(detectLang([])).toBe('pt');
    expect(detectLang([undefined])).toBe('pt');
  });
});

describe('initialLang', () => {
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    setBrowser(['pt-BR', 'pt']);
  });

  it('follows the browser when nothing was picked', () => {
    setBrowser(['en-GB']);
    expect(initialLang()).toBe('en');
  });

  it("prefers the visitor's own pick over the browser", () => {
    setBrowser(['en-GB']);
    localStorage.setItem(PICK_KEY, 'pt');
    expect(initialLang()).toBe('pt');
  });

  it('lets ?lang= in the URL win over everything', () => {
    localStorage.setItem(PICK_KEY, 'pt');
    window.history.replaceState(null, '', '/?lang=en');
    expect(initialLang()).toBe('en');
  });

  it("ignores the old 'lang' key, which used to store the default for everyone", () => {
    setBrowser(['en-US']);
    localStorage.setItem('lang', 'pt');
    expect(initialLang()).toBe('en');
  });
});

describe('LanguageProvider', () => {
  afterEach(() => localStorage.clear());

  it('stores only an explicit pick and mirrors it on <html lang>', () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('pt');
    expect(localStorage.getItem(PICK_KEY)).toBeNull();

    act(() => screen.getByText('en').click());
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(localStorage.getItem(PICK_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');

    act(() => screen.getByText('toggle').click());
    expect(localStorage.getItem(PICK_KEY)).toBe('pt');
  });
});
