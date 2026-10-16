import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PrivacySimulation from './PrivacySimulation';
import { PRIVACY } from '@/data/privacy';

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed');
const slider = () => screen.getByRole('slider') as HTMLInputElement;

describe('PrivacySimulation', () => {
  it('walks through the three steps', () => {
    render(<PrivacySimulation copy={PRIVACY.pt} />);
    // starts on "Pedi a inscrição": waiting, with the seven-day bar and the slider
    expect(pressed('Pedi a inscrição')).toBe('true');
    expect(screen.getByText('Aguardando confirmação')).toBeTruthy();
    expect(screen.getByText('Faltam 7 dias.', { exact: false })).toBeTruthy();
    expect(document.querySelectorAll('.pv-seg')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmei' }));
    expect(pressed('Confirmei')).toBe('true');
    expect(screen.getByText('Inscrição ativa')).toBeTruthy();
    expect(screen.getByText('dia 1')).toBeTruthy();
    expect(screen.queryByRole('slider')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Saí da lista' }));
    expect(screen.getByText('Nada guardado')).toBeTruthy();
    expect(screen.getByText('Nenhum dado seu aqui.')).toBeTruthy();
    expect(screen.getByText('O endereço é apagado na hora e não fica nenhuma lista de quem saiu.')).toBeTruthy();
  });

  it('lights the days up to the slider and empties the panel on day 7', () => {
    render(<PrivacySimulation copy={PRIVACY.pt} />);
    fireEvent.change(slider(), { target: { value: '3' } });
    expect(document.querySelectorAll('.pv-seg[data-on="true"]')).toHaveLength(3);
    expect(screen.getByText('Faltam 4 dias.', { exact: false })).toBeTruthy();
    expect(screen.getByText('E-mail')).toBeTruthy();

    fireEvent.change(slider(), { target: { value: '7' } });
    expect(screen.getByText('Apagado automaticamente')).toBeTruthy();
    expect(screen.getByText('Nenhum dado seu aqui.')).toBeTruthy();
    expect(screen.queryByText('E-mail')).toBeNull();
    expect(document.querySelectorAll('.pv-seg[data-on="true"]')).toHaveLength(0);
    expect(screen.getByText('dia 7: apagado')).toBeTruthy();
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
