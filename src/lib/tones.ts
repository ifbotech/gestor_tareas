/**
 * Tonos de las tarjetas: verdes y azul verdosos apagados, derivados de Blue Green (#219ebc)
 * y oscurecidos hacia Deep Space Blue (#023047) para que el texto blanco se lea bien (≥ 4.6:1).
 */
export const TONES = [
  { name: 'Laguna', from: '#377e8f', to: '#296b7d' },
  { name: 'Junco', from: '#487e7a', to: '#366a6d' },
  { name: 'Río', from: '#327e94', to: '#256a80' },
  { name: 'Musgo', from: '#4f7d74', to: '#3c6a69' },
  { name: 'Bruma', from: '#4f7a8e', to: '#3c677c' },
  { name: 'Hondo', from: '#22647a', to: '#164f63' },
] as const;

export type Tone = (typeof TONES)[number];

export function tone(i: number): Tone {
  return TONES[((i % TONES.length) + TONES.length) % TONES.length];
}

export function toneStyle(i: number): React.CSSProperties {
  const t = tone(i);
  return { '--from': t.from, '--to': t.to } as React.CSSProperties;
}
