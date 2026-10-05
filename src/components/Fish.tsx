import { useId } from 'react';

interface FishProps {
  width?: number;
  /** Mueve la cola y las aletas. */
  swim?: boolean;
  className?: string;
}

/** Proporción del dibujo (ancho / alto). */
export const FISH_RATIO = 132 / 44;

/**
 * Mojarrita plateada (Piabarchus —ex Bryconamericus— stramineus), mirando a la derecha.
 * Cuerpo esbelto color paja plateado (alto ≈ 26% del largo), ojo grande, una mancha humeral negra
 * alargada en vertical, banda lateral plateada ancha que sigue sobre los radios del medio de la cola,
 * aleta anal larga que nace bajo la dorsal, adiposa chica, aletas transparentes con borde oscuro
 * y solo la cola amarillo-anaranjada.
 */
export function Fish({ width = 96, swim = true, className = '' }: FishProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      className={`fish ${swim ? 'fish--swim' : ''} ${className}`}
      width={width}
      height={width / FISH_RATIO}
      viewBox="0 0 132 44"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f8a6c" />
          <stop offset="0.28" stopColor="#bdb88f" />
          <stop offset="0.5" stopColor="#e2dfc6" />
          <stop offset="0.75" stopColor="#f1f1e8" />
          <stop offset="1" stopColor="#fbfbf7" />
        </linearGradient>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfdfd" />
          <stop offset="0.45" stopColor="#d5e3e8" />
          <stop offset="1" stopColor="#a7bcc5" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="1" y1="0.5" x2="0" y2="0.5">
          <stop offset="0" stopColor="#e9b24f" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#f0a541" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ef9a3c" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`${id}-eye`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#d9e0e0" />
          <stop offset="1" stopColor="#9eabad" />
        </radialGradient>
      </defs>

      {/* cola ahorquillada: lo único con color, y la raya oscura sobre los radios del medio */}
      <g className="fish-tail">
        <path
          d="M31 18.2 C24 15 16 10 6 5.5 C9 12 13 18 17 22 C13 26 9 32 6 38.5 C16 34 24 29 31 25.9 Z"
          fill={`url(#${id}-tail)`}
          stroke="#c98a37"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path
          d="M28 19 L12 10.5 M28 24.8 L12 34 M27 20.8 L16 17 M27 23.4 L16 27"
          stroke="#c98a37"
          strokeWidth="0.45"
          opacity="0.55"
        />
        <path d="M31 22.3 L13 22.2" stroke="#4f5f66" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* aletas transparentes con borde oscuro: dorsal, adiposa, anal larga y pélvica */}
      <g className="fish-fins" fill="#e6ebe6" fillOpacity="0.6" stroke="#5d6a6c" strokeWidth="0.65">
        <path className="fish-dorsal" d="M82 9.8 C80 6 77 2.6 74.6 0.8 C74 4.2 73 7.6 71 10.6 Z" />
        <path d="M47.5 16.4 C46.4 14 43.8 13.4 42.4 15 C43.6 16.2 45.4 16.8 47.5 16.9 Z" strokeWidth="0.45" />
        <path d="M74.4 35 C72.6 38.8 70.4 41.4 68 42.6 C60.6 39.6 52 35 44 30 L43 27.4 C52.4 29.6 63.4 33 74.4 35 Z" />
        <path d="M86.4 35.6 C84.4 38.4 81.4 40.4 78.6 40.9 C80.4 38.6 81.8 37 82.8 35.8 Z" strokeWidth="0.5" />
      </g>

      {/* cuerpo */}
      <path
        d="M129 23.2 C127 18 121 13.5 112 11.3 C102 9.2 92 8.8 84 9.4 C72 10.5 52 15.2 40 17.6 L30.5 18.6 C27.8 19.6 27.8 24.8 30.5 25.7 L40 26.4 C52 27.2 64 33 74.4 35.2 C86 36.4 104 34.8 116 30.5 C122 28.4 127 26 129 23.2 Z"
        fill={`url(#${id}-body)`}
        stroke="#5e6b5c"
        strokeWidth="0.9"
      />
      {/* escamas suaves en el lomo */}
      <g stroke="#8a8f73" strokeWidth="0.45" fill="none" opacity="0.4">
        <path d="M96 14.2 q2 2 4 0 M90 14.6 q2 2 4 0 M84 15 q2 2 4 0 M78 15.6 q2 2 4 0 M72 16.4 q2 2 4 0 M66 17.2 q2 2 4 0 M60 18 q2 2 4 0 M54 18.6 q2 2 4 0" />
        <path d="M93 11.8 q2 2 4 0 M87 12 q2 2 4 0 M81 12.4 q2 2 4 0 M75 13.2 q2 2 4 0 M69 14.2 q2 2 4 0" />
      </g>
      {/* banda lateral plateada, ancha, que se angosta hacia la cola */}
      <path
        d="M104 19.4 C90 18.4 66 19.2 42 20.5 L30 21.1 C28.8 21.7 28.8 22.9 30 23.5 L42 23.9 C66 25.5 90 25.7 104 24.7 Z"
        fill={`url(#${id}-band)`}
      />
      <path d="M100 22 C80 22.2 55 22.4 29 22.3" stroke="#5f747d" strokeWidth="0.8" fill="none" opacity="0.45" />
      {/* brillo del vientre */}
      <path
        d="M110 29.6 C98 32.6 86 33.6 76 33.2"
        stroke="#ffffff"
        strokeWidth="1.4"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
      />
      {/* mancha humeral: una sola, negra y alargada en vertical */}
      <ellipse cx="103.4" cy="19.6" rx="1.55" ry="3.3" fill="#1d272b" opacity="0.88" />
      {/* opérculo y aleta pectoral */}
      <path
        d="M108.6 12.6 C104.6 18 104.6 27 109.4 32.4"
        stroke="#7d8a7f"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="fish-pec"
        d="M106.6 29 C101.6 31 97 33.2 93.4 33.8 C96.4 31.4 100.4 29.4 104.8 27.8 Z"
        fill="#eef2ee"
        fillOpacity="0.7"
        stroke="#7d8a86"
        strokeWidth="0.5"
      />
      {/* ojo grande y boca terminal chica */}
      <circle cx="118.4" cy="19.4" r="4.7" fill={`url(#${id}-eye)`} stroke="#6f7d80" strokeWidth="0.7" />
      <circle cx="118.9" cy="19.6" r="2.6" fill="#142026" />
      <circle cx="119.8" cy="18.5" r="0.85" fill="#fff" />
      <path d="M129 23.6 L126.4 24.5" stroke="#5e6b5c" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/** Silueta chiquita (balde, logo, bitácora). */
export function MiniFish({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size / 3} viewBox="0 0 45 15" aria-hidden="true">
      <path d="M11 6.6 L2 2 C3.4 5 3.4 10 2 13 L11 8.6 Z" fill="#eaa848" opacity="0.9" />
      <path
        d="M44 7.6 C42 4.6 36 3 29 3.2 C22 3.6 15 5.4 10.5 6.4 L10.5 8.8 C15 9.4 22 11.6 29 12 C36 12.2 42 10.6 44 7.6 Z"
        fill="#e4e2cf"
        stroke="#6d7868"
        strokeWidth="0.5"
      />
      <path d="M36 6.6 C28 6.4 18 6.9 10.5 7.4 L10.5 8 C18 8.4 28 8.8 36 8.6 Z" fill="#c9d9e0" />
      <ellipse cx="34.6" cy="6.7" rx="0.6" ry="1.2" fill="#1d272b" />
      <circle cx="39.6" cy="6.6" r="1.5" fill="#142026" />
    </svg>
  );
}
