import { useMemo } from 'react';

/** Fondo: agua celeste con luz que se mueve, burbujas que suben y algas que se mecen. */
export function Ocean() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 61 + 7) % 100,
        size: 5 + ((i * 7) % 12),
        duration: 16 + ((i * 5) % 13),
        delay: -((i * 3.7) % 22),
        drift: ((i % 5) - 2) * 10,
      })),
    [],
  );
  return (
    <div className="ocean" aria-hidden="true">
      <div className="ocean-light" />
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="ocean-bubble"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              '--drift': `${b.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
      <Seaweed side="left" />
      <Seaweed side="right" />
    </div>
  );
}

interface FrondSpec {
  x: number;
  height: number;
  width: number;
  sway: number;
  duration: number;
  phase: number;
  color: string;
  opacity: number;
}

const POINTS = 22;
/** Cuadros por ciclo: con muchos y lineal, la onda avanza a velocidad pareja, sin frenarse. */
const FRAMES = 20;
const VIEW_H = 320;

/**
 * Contorno de un alga en un instante del ciclo `t` (0..1).
 * La ondulación sube desde la base (onda viajera), así se dobla como en el agua en vez de girar rígida.
 */
function frondPath(f: FrondSpec, t: number): string {
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const k = i / POINTS;
    const y = VIEW_H - f.height * k;
    const bend = Math.pow(k, 1.35);
    const x = f.x + f.sway * bend * Math.sin(2 * Math.PI * t + f.phase - k * 2.4) + f.sway * 0.35 * bend;
    // Ancho: base angosta, panza en el medio, punta redondeada; con un leve festoneado de hoja.
    const w = f.width * Math.sin(Math.PI * Math.min(1, 0.12 + k * 0.95)) * (1 + 0.18 * Math.sin(k * 15 + f.phase));
    left.push(`${(x - w / 2).toFixed(1)} ${y.toFixed(1)}`);
    right.push(`${(x + w / 2).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${left.join(' L')} L${right.reverse().join(' L')} Z`;
}

const CLUMPS: Record<'left' | 'right', FrondSpec[]> = {
  left: [
    { x: 46, height: 250, width: 16, sway: 18, duration: 9, phase: 0.3, color: 'var(--weed-back)', opacity: 0.55 },
    { x: 78, height: 300, width: 20, sway: 22, duration: 11, phase: 1.4, color: 'var(--weed-mid)', opacity: 0.6 },
    { x: 104, height: 205, width: 15, sway: 16, duration: 8, phase: 2.2, color: 'var(--weed-front)', opacity: 0.7 },
    { x: 130, height: 150, width: 13, sway: 12, duration: 7.5, phase: 0.9, color: 'var(--weed-mid)', opacity: 0.65 },
    { x: 22, height: 170, width: 13, sway: 14, duration: 10, phase: 2.8, color: 'var(--weed-front)', opacity: 0.6 },
  ],
  right: [
    { x: 60, height: 230, width: 17, sway: 18, duration: 10, phase: 1.1, color: 'var(--weed-back)', opacity: 0.55 },
    { x: 92, height: 280, width: 19, sway: 22, duration: 12, phase: 2.5, color: 'var(--weed-mid)', opacity: 0.6 },
    { x: 124, height: 185, width: 14, sway: 15, duration: 8.5, phase: 0.2, color: 'var(--weed-front)', opacity: 0.7 },
    { x: 152, height: 130, width: 12, sway: 11, duration: 7, phase: 1.9, color: 'var(--weed-mid)', opacity: 0.65 },
  ],
};

function Seaweed({ side }: { side: 'left' | 'right' }) {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const fronds = useMemo(
    () =>
      CLUMPS[side].map((f) => ({
        ...f,
        frames: Array.from({ length: FRAMES }, (_, i) => frondPath(f, i / FRAMES)),
      })),
    [side],
  );
  return (
    <svg className={`seaweed seaweed--${side}`} viewBox={`0 0 180 ${VIEW_H}`} preserveAspectRatio="xMidYMax meet">
      {fronds.map((f, i) => (
        <path key={i} d={f.frames[0]} fill={f.color} opacity={f.opacity}>
          {!reduce && (
            <animate
              attributeName="d"
              dur={`${f.duration}s`}
              repeatCount="indefinite"
              values={[...f.frames, f.frames[0]].join(';')}
              calcMode="linear"
            />
          )}
        </path>
      ))}
      {/* piedritas en la base */}
      <ellipse cx="70" cy={VIEW_H - 2} rx="34" ry="9" fill="var(--pebble)" opacity="0.55" />
      <ellipse cx="112" cy={VIEW_H} rx="22" ry="7" fill="var(--pebble-dark)" opacity="0.45" />
      <ellipse cx="38" cy={VIEW_H} rx="16" ry="5" fill="var(--pebble-dark)" opacity="0.4" />
    </svg>
  );
}
