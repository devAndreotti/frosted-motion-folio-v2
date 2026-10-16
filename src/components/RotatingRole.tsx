import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface RotatingRoleProps {
  roles: string[];
  intervalMs?: number;
}

/**
 * Cycles through `roles` in place. Every role is rendered in the same grid
 * cell (only the active one is visible), so the block is always exactly as
 * tall as the longest role at the current width -- no reserved empty lines
 * under the headline, and no layout jump when a longer role comes in. With
 * "reduce motion" on (Windows animation effects off, battery saver on some
 * laptops) the roles still change, as a plain crossfade -- an opacity fade
 * is not the kind of motion that setting is about, and a headline that
 * never changes just looks broken.
 */
const RotatingRole = ({ roles, intervalMs = 2600 }: RotatingRoleProps) => {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const active = step % roles.length;
  const previous = step > 0 ? (step - 1) % roles.length : null;

  useEffect(() => {
    if (roles.length < 2) return;
    const timer = setInterval(() => setStep((s) => s + 1), intervalMs);
    return () => clearInterval(timer);
  }, [roles.length, intervalMs]);

  const styleFor = (i: number): React.CSSProperties => {
    if (i === active) return { opacity: 1, transform: 'none', filter: 'none' };
    // reduced motion keeps the swap but as a plain fade: nothing slides or blurs
    if (reduceMotion) return { opacity: 0, transform: 'none', filter: 'none' };
    const leaving = i === previous;
    return { opacity: 0, transform: `translateY(${leaving ? -0.3 : 0.3}em)`, filter: 'blur(6px)' };
  };

  return (
    <span className="grid" style={{ color: 'var(--accent)' }} data-testid="rotating-role">
      {roles.map((role, i) => (
        <span
          key={role}
          aria-hidden={i !== active}
          className="[grid-area:1/1] transition-[opacity,transform,filter] duration-500 ease-out"
          style={styleFor(i)}
        >
          {role}
        </span>
      ))}
    </span>
  );
};

export default RotatingRole;
