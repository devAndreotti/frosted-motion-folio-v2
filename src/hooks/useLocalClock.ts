import { useEffect, useState } from 'react';

/** HH:MM in São Paulo time (where Sorocaba is), whatever the visitor's own zone. */
export function saoPauloTime(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(date);
  } catch {
    return '--:--';
  }
}

/** Local time in Sorocaba, refreshed every 30 s -- shown in the hero eyebrow and the contact card. */
export function useLocalClock(): string {
  const [time, setTime] = useState(() => saoPauloTime());
  useEffect(() => {
    const timer = setInterval(() => setTime(saoPauloTime()), 30000);
    return () => clearInterval(timer);
  }, []);
  return time;
}
