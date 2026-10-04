import { describe, expect, it } from 'vitest';
import { formatClock, formatMinutes, parseDuration, startOfWeek, trackedMs } from './time';

describe('parseDuration', () => {
  it.each([
    ['45', 45],
    ['45m', 45],
    ['45 min', 45],
    ['1h', 60],
    ['1 h', 60],
    ['1h30', 90],
    ['1h 30m', 90],
    ['1 h 30 min', 90],
    ['1:30', 90],
    ['1.5h', 90],
    ['1,5 hs', 90],
    ['2 horas 10 minutos', 130],
    ['2 horas y 10 minutos', 130],
    ['  20  ', 20],
  ])('"%s" → %i minutos', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each(['', 'un rato', 'media hora', '1 hora y media', 'abc 10'])('"%s" no se entiende', (input) => {
    expect(parseDuration(input)).toBeNull();
  });

  it('lo que muestra formatMinutes se vuelve a entender', () => {
    for (const m of [5, 45, 60, 75, 90, 120, 135, 600]) expect(parseDuration(formatMinutes(m))).toBe(m);
  });
});

describe('formatos', () => {
  it('formatMinutes', () => {
    expect(formatMinutes(null)).toBe('—');
    expect(formatMinutes(0)).toBe('0 min');
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(80)).toBe('1 h 20 min');
  });

  it('formatClock', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(65_000)).toBe('01:05');
    expect(formatClock(3_725_000)).toBe('1:02:05');
  });
});

describe('cronómetro', () => {
  it('suma lo acumulado más lo que está corriendo', () => {
    expect(trackedMs({ trackedMs: 1000 })).toBe(1000);
    expect(trackedMs({ trackedMs: 1000, runningSince: 5000 }, 8000)).toBe(4000);
  });
});

describe('startOfWeek', () => {
  it('arranca el lunes', () => {
    const sunday = new Date(2026, 9, 4, 15, 0).getTime(); // domingo 4/10/2026
    const monday = new Date(startOfWeek(sunday));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(28);
  });
});
