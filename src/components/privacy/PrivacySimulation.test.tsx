import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PrivacySimulation from './PrivacySimulation';
import { PRIVACY } from '@/data/privacy';

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed');
const day = (n: number) => screen.getByRole('button', { name: `dia ${n}` });

describe('PrivacySimulation', () => {
  it('walks through the three steps', () => {
    render(<PrivacySimulation copy={PRIVACY.pt} />);
    // starts on "Pedi a inscrição": waiting, with the seven-day bar
    expect(pressed('Pedi a inscrição')).toBe('true');
    expect(screen.getByText('Aguardando confirmação')).toBeTruthy();
    expect(screen.getByText('Faltam 7 dias.', { exact: false })).toBeTruthy();
    expect(document.querySelectorAll('.pv-seg')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmei' }));
    expect(pressed('Confirmei')).toBe('true');
    expect(screen.getByText('Inscrição ativa')).toBeTruthy();
    expect(screen.getByText('dia 1')).toBeTruthy();
    expect(document.querySelectorAll('.pv-seg')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Saí da lista' }));
    expect(screen.getByText('Nada guardado')).toBeTruthy();
    // the record is gone: every value stays on the panel, struck through and marked as deleted
    expect(screen.getAllByText('apagado')).toHaveLength(4);
    expect(screen.getByText('voce@exemplo.com').tagName).toBe('S');
    expect(screen.getByText('O endereço é apagado na hora e não fica nenhuma lista de quem saiu.')).toBeTruthy();
  });

  it('lights the days up to the one tapped and strikes the panel through on day 7', () => {
    render(<PrivacySimulation copy={PRIVACY.pt} />);
    fireEvent.click(day(3));
    expect(document.querySelectorAll('.pv-seg[data-on="true"]')).toHaveLength(3);
    expect(screen.getByText('Faltam 4 dias.', { exact: false })).toBeTruthy();
    expect(screen.getByText('E-mail')).toBeTruthy();

    fireEvent.click(day(7));
    expect(screen.getByText('Apagado automaticamente')).toBeTruthy();
    expect(screen.getAllByText('apagado')).toHaveLength(4);
    expect(document.querySelectorAll('.pv-seg[data-on="true"]')).toHaveLength(0);

    // tapping the day you are on steps one back, so the bar can return to day 0
    fireEvent.click(day(7));
    expect(screen.getByText('Falta 1 dia.', { exact: false })).toBeTruthy();
    fireEvent.click(day(1));
    fireEvent.click(day(1));
    expect(screen.getByText('Faltam 7 dias.', { exact: false })).toBeTruthy();
  });

  it('keeps the panel in English', () => {
    render(<PrivacySimulation copy={PRIVACY.en} />);
    expect(screen.getByText('Waiting for confirmation')).toBeTruthy();
    expect(screen.getByText('you@example.com')).toBeTruthy();
    expect(screen.getByText('not yet')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'I confirmed' }));
    expect(screen.getByText('day 1')).toBeTruthy();
  });
});
