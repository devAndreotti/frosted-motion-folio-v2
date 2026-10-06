import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RotatingRole from './RotatingRole';

const ROLES = ['com propósito real.', 'que resolvem problemas.', 'bem pensados.'];

describe('RotatingRole', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders every role in the same cell and exposes only the active one', () => {
    render(<RotatingRole roles={ROLES} intervalMs={1000} />);
    const items = screen.getByTestId('rotating-role').children;
    expect(items).toHaveLength(ROLES.length);
    expect(items[0].getAttribute('aria-hidden')).toBe('false');
    expect(items[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('advances on the interval and wraps around', () => {
    render(<RotatingRole roles={ROLES} intervalMs={1000} />);
    const items = () => screen.getByTestId('rotating-role').children;

    act(() => vi.advanceTimersByTime(1000));
    expect(items()[1].getAttribute('aria-hidden')).toBe('false');
    // The role that just left slides up while fading, the rest wait below.
    expect((items()[0] as HTMLElement).style.transform).toContain('-0.3em');

    act(() => vi.advanceTimersByTime(2000));
    expect(items()[0].getAttribute('aria-hidden')).toBe('false');
  });

  it('stays put when there is nothing to rotate', () => {
    render(<RotatingRole roles={['só uma.']} intervalMs={1000} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByTestId('rotating-role').children[0].getAttribute('aria-hidden')).toBe('false');
  });
});
