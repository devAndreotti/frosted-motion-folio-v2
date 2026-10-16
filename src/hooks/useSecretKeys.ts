import { useEffect } from 'react';
import { EGG_EVENTS, advanceKonami, advanceWord, isEditableTarget, isTvWord } from '@/lib/eggs';

/**
 * Two keyboard easter eggs, mounted once in App:
 * - the Konami code opens the sudo terminal (which knows `sudo hire ricardo`);
 * - typing "tv" or "memory" as a whole word opens the Memory Apartment TV.
 * Neither fires while the user types in a field, with a modifier held, or on key repeat.
 */
export function useSecretKeys() {
  useEffect(() => {
    let konamiIndex = 0;
    let word = '';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing || e.repeat) return;
      if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) {
        konamiIndex = 0;
        word = '';
        return;
      }

      const konami = advanceKonami(konamiIndex, e.key);
      konamiIndex = konami.index;
      if (konami.matched) window.dispatchEvent(new Event(EGG_EVENTS.openTerminal));

      word = advanceWord(word, e.key);
      if (isTvWord(word)) {
        word = '';
        window.dispatchEvent(new Event(EGG_EVENTS.openTv));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

export default useSecretKeys;
