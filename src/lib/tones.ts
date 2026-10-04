/** Azules para las tarjetas: todos más profundos que el celeste del fondo y con buen contraste para texto blanco. */
export const TONES = [
  { name: 'Mar', from: '#3b9be3', to: '#1d6fbd' },
  { name: 'Laguna', from: '#27a0c8', to: '#136f98' },
  { name: 'Profundo', from: '#3480e0', to: '#1c52ac' },
  { name: 'Índigo', from: '#5b7cf0', to: '#3349bd' },
  { name: 'Río', from: '#3a8bcc', to: '#225b98' },
  { name: 'Noche', from: '#2e62b3', to: '#173c7c' },
] as const;

export type Tone = (typeof TONES)[number];

export function tone(i: number): Tone {
  return TONES[((i % TONES.length) + TONES.length) % TONES.length];
}

export function toneStyle(i: number): React.CSSProperties {
  const t = tone(i);
  return { '--from': t.from, '--to': t.to } as React.CSSProperties;
}
