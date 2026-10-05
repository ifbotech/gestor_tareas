const pad = (n: number) => String(n).padStart(2, '0');

/** 45 → "45 min", 80 → "1 h 20 min", 120 → "2 h". */
export function formatMinutes(min: number | null | undefined): string {
  if (min == null || !Number.isFinite(min)) return '—';
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

const RANGE =
  /^(?:de\s+)?(\d{1,2})(?:[:.h](\d{2}))?\s*(?:hs?\.?\s*)?(?:a|-|–|hasta)\s*(\d{1,2})(?:[:.h](\d{2}))?\s*(?:hs?\.?)?$/;

/**
 * Interpreta lo que uno escribe para "cuánto tardé":
 * "45", "45m", "45 min", "1h", "1 h 30", "1h30m", "1:30", "1.5h", "1,5 hs", "2 horas 10 minutos",
 * o un horario: "de 9 a 10:30", "9:15-11", "14 a 15.30".
 * Devuelve minutos, o null si no se entiende.
 */
export function parseDuration(input: string): number | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  const range = raw.match(RANGE);
  if (range) {
    const [, h1, m1 = '0', h2, m2 = '0'] = range;
    const from = Number(h1) * 60 + Number(m1);
    const to = Number(h2) * 60 + Number(m2);
    if (Number(h1) > 23 || Number(h2) > 24 || Number(m1) > 59 || Number(m2) > 59 || to <= from) return null;
    return to - from;
  }

  const s = raw.replace(/,/g, '.');

  const clock = s.match(/^(\d+):(\d{1,2})$/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);

  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(Number(s));

  const token = /(\d+(?:\.\d+)?)\s*(horas|hora|hrs|hr|hs|h|minutos|minuto|mins|min|m|')?/g;
  let total = 0;
  let found = false;
  for (const match of s.matchAll(token)) {
    found = true;
    const value = Number(match[1]);
    // Sin unidad (o "m") son minutos: "1h30" = 90.
    total += (match[2] ?? '').startsWith('h') ? value * 60 : value;
  }
  // Todo lo que no es un número con unidad tiene que ser relleno ("y", espacios).
  const leftover = s.replace(token, '').replace(/\by\b/g, '').replace(/\s/g, '');
  if (!found || leftover) return null;
  return Math.round(total);
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfDay(ts = Date.now()): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Lunes 00:00 de la semana de `ts`. */
export function startOfWeek(ts = Date.now()): number {
  const d = new Date(startOfDay(ts));
  const dow = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

const dayFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFmt = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function dayLabel(ts: number, now = Date.now()): string {
  const today = startOfDay(now);
  const day = startOfDay(ts);
  if (day === today) return 'Hoy';
  if (day === startOfDay(today - 12 * 3600 * 1000)) return 'Ayer';
  return capitalize(dayFmt.format(ts));
}

export function formatTime(ts: number): string {
  return timeFmt.format(ts);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function todayLong(now = Date.now()): string {
  return capitalize(dayFmt.format(now));
}
