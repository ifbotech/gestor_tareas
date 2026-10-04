import { useMemo } from 'react';

/** Fondo: agua celeste con luz que se mueve, burbujas que suben y olitas abajo. */
export function Ocean() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: (i * 61) % 100,
        size: 6 + ((i * 7) % 14),
        duration: 14 + ((i * 5) % 13),
        delay: -((i * 3.7) % 20),
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
      <svg className="ocean-waves" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path className="wave wave-1" d="M0 80 C 240 40 480 120 720 80 C 960 40 1200 120 1440 80 L1440 160 L0 160 Z" />
        <path className="wave wave-2" d="M0 100 C 200 130 440 60 720 100 C 1000 140 1240 70 1440 100 L1440 160 L0 160 Z" />
      </svg>
    </div>
  );
}
