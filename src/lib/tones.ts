/**
 * Tonos de las tarjetas: verdes salvia y verde agua apagados (calmos para mirar todo el día),
 * con un par de azul verdosos de la familia de Blue Green. Todos con texto blanco a ≥ 4.75:1.
 * Los verdes van primero: las tareas nuevas toman los tonos en este orden.
 */
export const TONES = [
  { name: 'Junco', from: '#477b72', to: '#3a6760' },
  { name: 'Musgo', from: '#517b67', to: '#436857' },
  { name: 'Laguna', from: '#417c7e', to: '#34686a' },
  { name: 'Salvia', from: '#587963', to: '#496753' },
  { name: 'Río', from: '#407b87', to: '#346872' },
  { name: 'Hondo', from: '#306c80', to: '#285969' },
] as const;

export type Tone = (typeof TONES)[number];

export function tone(i: number): Tone {
  return TONES[((i % TONES.length) + TONES.length) % TONES.length];
}

export function toneStyle(i: number): React.CSSProperties {
  const t = tone(i);
  return { '--from': t.from, '--to': t.to } as React.CSSProperties;
}
