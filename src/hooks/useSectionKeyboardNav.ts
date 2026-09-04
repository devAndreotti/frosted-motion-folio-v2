import { useEffect } from 'react';

const SECTION_IDS = ['header', 'marquee', 'github-activity', 'projects', 'skills', 'timeline', 'contact'];

/** ArrowUp/ArrowDown jump between page sections — skipped while a dialog is open or a modifier key is held. */
export function useSectionKeyboardNav() {
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (document.querySelector('[role="dialog"]')) return;

      const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
      if (sections.length === 0) return;

      let currentIndex = 0;
      let minAbsTop = Infinity;
      sections.forEach((el, i) => {
        const top = Math.abs(el.getBoundingClientRect().top);
        if (top < minAbsTop) {
          minAbsTop = top;
          currentIndex = i;
        }
      });

      const nextIndex = e.key === 'ArrowDown' ? Math.min(currentIndex + 1, sections.length - 1) : Math.max(currentIndex - 1, 0);
      if (nextIndex === currentIndex) return;
      e.preventDefault();
      sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);
}
