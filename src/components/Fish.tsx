import { useId } from 'react';

interface FishProps {
  width?: number;
  /** Mueve la cola y las aletas. */
  swim?: boolean;
  className?: string;
}

/**
 * Mojarrita (Astyanax): cuerpo plateado, franja lateral celeste, mancha humeral negra,
 * mancha en la base de la cola, aleta adiposa y cola amarillo-anaranjada. Mira a la derecha.
 */
export function Fish({ width = 96, swim = true, className = '' }: FishProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      className={`fish ${swim ? 'fish--swim' : ''} ${className}`}
      width={width}
      height={width / 2}
      viewBox="0 0 120 60"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#58839c" />
          <stop offset="0.36" stopColor="#a8c3d4" />
          <stop offset="0.6" stopColor="#eaf2f7" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="1" y1="0.5" x2="0" y2="0.5">
          <stop offset="0" stopColor="#f7c64e" />
          <stop offset="1" stopColor="#ef7d3a" />
        </linearGradient>
        <linearGradient id={`${id}-stripe`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6fb0dc" stopOpacity="0" />
          <stop offset="0.3" stopColor="#6fb0dc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#c4e6f8" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g className="fish-tail">
        <path
          d="M38 25 C30 21 18 13 8 9 C12 19 16 25 19 30 C16 35 12 41 8 51 C18 47 30 39 38 35 Z"
          fill={`url(#${id}-tail)`}
          stroke="#c86a2e"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <path d="M31 24 L14 13.5 M31 36 L14 46.5 M28 30 L19 30" stroke="#d8843a" strokeWidth="0.7" opacity="0.6" />
      </g>

      {/* aletas de atrás: dorsal, adiposa y anal */}
      <path
        className="fish-dorsal"
        d="M59 14 C62 8 67 3 75 2 C73 6 73 10 76 13 Z"
        fill="#f2bb4c"
        stroke="#c9862c"
        strokeWidth="0.7"
      />
      <ellipse cx="45" cy="17" rx="3.2" ry="1.8" fill="#9db9c9" />
      <path d="M45 45 C49 51 55 54 62 53 C59 50 58 48 59 45 Z" fill="#f2bb4c" stroke="#c9862c" strokeWidth="0.6" />

      <path
        d="M34 30 C40 15 62 9 84 12 C99 14 110 22 115 30 C110 38 99 46 84 48 C62 51 40 45 34 30 Z"
        fill={`url(#${id}-body)`}
        stroke="#47677b"
        strokeWidth="1.2"
      />
      {/* brillo del lomo y franja lateral */}
      <path
        d="M50 20 C62 15 78 14 92 17"
        stroke="#fff"
        strokeWidth="2"
        opacity="0.45"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M38 30 C58 27 86 26 108 29"
        stroke={`url(#${id}-stripe)`}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* escamitas */}
      <g stroke="#7d9db0" strokeWidth="0.6" fill="none" opacity="0.45">
        <path d="M58 36 q3 3 6 0 M66 36 q3 3 6 0 M74 36 q3 3 6 0 M62 41 q3 3 6 0 M70 41 q3 3 6 0" />
      </g>
      {/* mancha humeral y mancha caudal */}
      <ellipse cx="82" cy="23.5" rx="2.6" ry="3.6" fill="#1f2c36" />
      <ellipse cx="41" cy="30" rx="4.6" ry="2.4" fill="#1f2c36" opacity="0.75" />
      {/* opérculo */}
      <path d="M95 18 C91 25 91 35 96 42" stroke="#7b97a8" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path className="fish-pec" d="M90 35 C85 38 80 42 76 41 C79 37 84 34 90 33 Z" fill="#f5c66b" opacity="0.92" />
      {/* ojo y boca */}
      <circle cx="104" cy="26" r="5" fill="#fbf3d2" stroke="#7d8f99" strokeWidth="0.8" />
      <circle cx="105" cy="26" r="2.9" fill="#15212a" />
      <circle cx="106.1" cy="24.8" r="1" fill="#fff" />
      <path
        d="M114 32 C112 33.2 110 33.2 108.5 32.6"
        stroke="#47677b"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Silueta chiquita para el balde, el logo y la bitácora. */
export function MiniFish({
  size = 28,
  color = '#cfe0ea',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg className={className} width={size} height={size / 2} viewBox="0 0 40 20" aria-hidden="true">
      <path d="M12 10 L3 3 C4.5 7 4.5 13 3 17 Z" fill="#f2a945" />
      <path d="M10 10 C14 3 26 2 33 5 C36 6.5 38 8.5 39 10 C38 11.5 36 13.5 33 15 C26 18 14 17 10 10 Z" fill={color} />
      <path d="M13 10 C21 9 29 9 36 10" stroke="#6fb0dc" strokeWidth="1.4" fill="none" opacity="0.9" />
      <circle cx="33" cy="8.6" r="1.3" fill="#15212a" />
      <ellipse cx="27" cy="8.5" rx="0.9" ry="1.3" fill="#1f2c36" />
    </svg>
  );
}
