import { describe, expect, it } from 'vitest';
import { formatMinutes, parseDuration, startOfWeek } from './time';

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
    // horarios
    ['de 9 a 10:30', 90],
    ['9:15-11', 105],
    ['9:15 - 11:00', 105],
    ['14 a 15.30', 90],
    ['de 9hs a 10hs', 60],
    ['10 hasta 12', 120],
    ['14,30 a 15', 30],
    ['9h30 a 11', 90],
    ['de 11 a 1', 120],
    ['de 12 a 2', 120],
    ['de 9 a 10 y media', 90],
    ['9 y cuarto a 10', 45],
    ['desde las 9 hasta las 10', 60],
  ])('"%s" → %i minutos', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each([
    '',
    'un rato',
    'media hora',
    '1 hora y media',
    'abc 10',
    'de 25 a 26',
    '9:70 a 10',
    // rangos ambiguos: mejor preguntar que guardar algo mal
    '5-10',
    '10-15',
    '1-2',
    '2-3 h',
    '45-50 min',
    // cruzar el mediodía solo si da algo razonable
    'de 4 a 2',
  ])('"%s" no se entiende', (input) => {
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
});

describe('startOfWeek', () => {
  it('arranca el lunes', () => {
    const sunday = new Date(2026, 9, 4, 15, 0).getTime(); // domingo 4/10/2026
    const monday = new Date(startOfWeek(sunday));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(28);
  });
});
