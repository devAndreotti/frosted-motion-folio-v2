import { useEffect } from 'react';
import { useHaunted } from '@/hooks/useHaunted';

/**
 * Turns the page "haunted" with a data attribute on <html>. The saved theme and
 * hue in localStorage are never touched: the CSS in styles/haunted.css overrides
 * the variables while the attribute is present, and removing it restores them.
 */
const HauntedMode = () => {
  const active = useHaunted();

  useEffect(() => {
    const root = document.documentElement;
    if (!active) return;
    root.setAttribute('data-haunted', '');
    return () => root.removeAttribute('data-haunted');
  }, [active]);

  return null;
};

export default HauntedMode;
