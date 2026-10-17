import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap';

const Dialog = ({ onClose }: { onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(true, ref, onClose);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="dlg-t">
      <h2 id="dlg-t">Título</h2>
      <button type="button">um</button>
      <button type="button">dois</button>
    </div>
  );
};

const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>abrir</button>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </>
  );
};

describe('useFocusTrap', () => {
  it('moves focus into the dialog on open, and Escape closes it and gives focus back to the trigger', () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'abrir' });
    trigger.focus();
    fireEvent.click(trigger);

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'um' }));

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps Tab inside the dialog, wrapping from the last control to the first and back', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'abrir' }));

    screen.getByRole('button', { name: 'dois' }).focus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'um' }));

    fireEvent.keyDown(document.activeElement as Element, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'dois' }));
  });

  it('pulls focus back in when it has left the dialog', () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'abrir' });
    fireEvent.click(trigger);
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'um' }));
  });
});
