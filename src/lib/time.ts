import type { Task } from '../types';

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

/** Cronómetro: "04:07" o "1:04:07". */
export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/**
 * Interpreta lo que uno escribe para "cuánto tardé":
 * "45", "45m", "45 min", "1h", "1 h 30", "1h30m", "1:30", "1.5h", "1,5 hs", "2 horas 10 minutos".
 * Devuelve minutos, o null si no se entiende.
 */
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/,/g, '.');
  if (!s) return null;

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

export function trackedMs(task: Pick<Task, 'trackedMs' | 'runningSince'>, now = Date.now()): number {
  return task.trackedMs + (task.runningSince != null ? Math.max(0, now - task.runningSince) : 0);
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
