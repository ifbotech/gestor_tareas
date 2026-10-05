import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { registerBucket, usePond } from '../store/pond';
import { useTasks } from '../store/tasks';
import { useUI } from '../store/ui';
import { startOfDay } from '../lib/time';

const MAX_FISH_IN_WATER = 7;

/** El balde gris de las tareas terminadas. Se le tiran las mojarritas y abre la bitácora. */
export function Bucket() {
  const ref = useRef<HTMLButtonElement>(null);
  const [scope, animate] = useAnimate();
  const hot = usePond((s) => s.bucketHot);
  const phase = usePond((s) => s.phase);
  const splashKey = usePond((s) => s.splashKey);
  const log = useTasks((s) => s.log);
  const setLogOpen = useUI((s) => s.setLogOpen);

  const today = startOfDay();
  const caughtToday = useMemo(() => log.filter((e) => e.completedAt >= today).length, [log, today]);
  const fishing = phase === 'dragging';

  useEffect(() => {
    registerBucket(ref.current);
    return () => registerBucket(null);
  }, []);

  useEffect(() => {
    if (!splashKey || !scope.current) return;
    animate(scope.current, { rotate: [0, -7, 6, -3, 1.5, 0], y: [0, 4, 0] }, { duration: 0.7, ease: 'easeOut' });
  }, [splashKey, animate, scope]);

  return (
    <div className={`bucket-dock ${hot ? 'is-hot' : ''} ${fishing ? 'is-fishing' : ''}`}>
      <button
        ref={ref}
        type="button"
        className="bucket"
        onClick={() => setLogOpen(true)}
        aria-label={`Balde de tareas terminadas: ${caughtToday} hoy. Abrir bitácora`}
        title="Abrir la bitácora de tareas terminadas"
      >
        <motion.div
          ref={scope}
          className="bucket-art"
          animate={{ scale: hot ? 1.12 : fishing ? 1.04 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <BucketSvg fishCount={Math.min(caughtToday, MAX_FISH_IN_WATER)} hot={hot} />
          <AnimatePresence>{splashKey > 0 && <Splash key={splashKey} />}</AnimatePresence>
        </motion.div>
      </button>

      <button type="button" className="bucket-label" onClick={() => setLogOpen(true)}>
        <span className="bucket-label-title">Terminadas</span>
        <span className="bucket-count">{caughtToday} hoy</span>
      </button>
    </div>
  );
}

function BucketSvg({ fishCount, hot }: { fishCount: number; hot: boolean }) {
  // Cada pececito nada siempre en su carril dentro del agua.
  const lanes = [
    { x: 46, y: 62, d: 36, dur: 6.2, delay: 0 },
    { x: 96, y: 66, d: -34, dur: 7.1, delay: -1.3 },
    { x: 60, y: 58.5, d: 40, dur: 8.0, delay: -2.6 },
    { x: 108, y: 60.5, d: -40, dur: 6.6, delay: -3.1 },
    { x: 52, y: 67, d: 32, dur: 7.6, delay: -0.7 },
    { x: 112, y: 64, d: -28, dur: 5.8, delay: -2.0 },
    { x: 72, y: 62, d: 28, dur: 8.6, delay: -4.2 },
  ];
  return (
    <svg viewBox="0 0 160 172" className="bucket-svg" aria-hidden="true">
      <defs>
        {/* chapa galvanizada: sombreado de cilindro con un brillo principal y otro secundario */}
        <linearGradient id="bk-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5f6a72" />
          <stop offset="0.07" stopColor="#818c94" />
          <stop offset="0.2" stopColor="#b9c2c8" />
          <stop offset="0.3" stopColor="#e3e8eb" />
          <stop offset="0.36" stopColor="#c6ced3" />
          <stop offset="0.55" stopColor="#a3adb4" />
          <stop offset="0.72" stopColor="#b8c0c6" />
          <stop offset="0.86" stopColor="#8a959d" />
          <stop offset="1" stopColor="#5b666e" />
        </linearGradient>
        <linearGradient id="bk-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2a31" stopOpacity="0.28" />
          <stop offset="0.12" stopColor="#1f2a31" stopOpacity="0" />
          <stop offset="0.8" stopColor="#1f2a31" stopOpacity="0" />
          <stop offset="1" stopColor="#1f2a31" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="bk-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e7981" />
          <stop offset="0.28" stopColor="#f2f5f6" />
          <stop offset="0.5" stopColor="#bcc5cb" />
          <stop offset="0.78" stopColor="#d6dde1" />
          <stop offset="1" stopColor="#68737b" />
        </linearGradient>
        <linearGradient id="bk-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f5a61" />
          <stop offset="1" stopColor="#7d888f" />
        </linearGradient>
        <radialGradient id="bk-water" cx="0.42" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#a9dbee" />
          <stop offset="0.55" stopColor="#5fb2cf" />
          <stop offset="1" stopColor="#2e7f9b" />
        </radialGradient>
        <radialGradient id="bk-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#023047" stopOpacity="0.28" />
          <stop offset="1" stopColor="#023047" stopOpacity="0" />
        </radialGradient>
        {/* textura de galvanizado: manchitas muy suaves */}
        <filter id="bk-spangle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.05" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.18" />
        </filter>
        <clipPath id="bk-body-clip">
          <path d="M22 56 L26 156 A54 10 0 0 0 134 156 L138 56 A58 13 0 0 1 22 56 Z" />
        </clipPath>
        <clipPath id="bk-water-clip">
          <ellipse cx="80" cy="62" rx="53" ry="10" />
        </clipPath>
      </defs>

      {/* sombra en el piso */}
      <ellipse cx="80" cy="160" rx="66" ry="11" fill="url(#bk-floor)" />

      {/* manija de alambre con mango */}
      <g className="bucket-handle">
        <path d="M19 63 C17 2 143 2 141 63" fill="none" stroke="#4c565d" strokeWidth="2.6" strokeLinecap="round" />
        <path
          d="M20.2 61 C18.6 5 141.4 5 139.8 61"
          fill="none"
          stroke="#c3cbd0"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.8"
        />
        <rect x="64" y="7.5" width="32" height="8.5" rx="4.25" fill="#3a332c" />
        <rect x="66" y="8.6" width="28" height="2.4" rx="1.2" fill="#6d6155" opacity="0.8" />
      </g>

      {/* cuerpo cilíndrico */}
      <path d="M22 56 L26 156 A54 10 0 0 0 134 156 L138 56 A58 13 0 0 1 22 56 Z" fill="url(#bk-body)" />
      <g clipPath="url(#bk-body-clip)">
        <rect x="0" y="40" width="160" height="130" filter="url(#bk-spangle)" opacity="0.5" />
        <rect x="0" y="40" width="160" height="130" fill="url(#bk-shade)" />
        {/* costura vertical */}
        <path d="M50 66 L52 164" stroke="#6b767e" strokeWidth="1.1" opacity="0.55" />
        <path d="M51.4 66 L53.4 164" stroke="#f4f7f8" strokeWidth="0.7" opacity="0.5" />
        {/* nervaduras */}
        <path d="M23.4 92 A56.6 12.2 0 0 0 136.6 92" fill="none" stroke="#5e6970" strokeWidth="2" opacity="0.55" />
        <path
          d="M23.5 94.6 A56.5 12.2 0 0 0 136.5 94.6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.3"
          opacity="0.45"
        />
        <path d="M24.8 126 A55.2 11 0 0 0 135.2 126" fill="none" stroke="#5e6970" strokeWidth="2" opacity="0.55" />
        <path
          d="M24.9 128.6 A55.1 11 0 0 0 135.1 128.6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.3"
          opacity="0.45"
        />
        {/* borde del fondo */}
        <path d="M25.7 150 A54.3 10 0 0 0 134.3 150" fill="none" stroke="#56616a" strokeWidth="1.6" opacity="0.5" />
      </g>
      <path
        d="M22 56 L26 156 A54 10 0 0 0 134 156 L138 56"
        fill="none"
        stroke="#525d65"
        strokeWidth="1"
        opacity="0.7"
      />

      {/* orejas remachadas donde engancha la manija */}
      <g>
        <rect x="14.5" y="58" width="9" height="12" rx="2.5" fill="#8d979e" stroke="#59646b" strokeWidth="0.8" />
        <circle cx="19" cy="66.5" r="1.2" fill="#e8edef" stroke="#5f6a71" strokeWidth="0.5" />
        <circle cx="19" cy="63" r="2" fill="none" stroke="#3f494f" strokeWidth="1.1" />
        <rect x="136.5" y="58" width="9" height="12" rx="2.5" fill="#76818a" stroke="#4f5a61" strokeWidth="0.8" />
        <circle cx="141" cy="66.5" r="1.2" fill="#d5dcdf" stroke="#5f6a71" strokeWidth="0.5" />
        <circle cx="141" cy="63" r="2" fill="none" stroke="#3f494f" strokeWidth="1.1" />
      </g>

      {/* boca: pared interior, agua y borde enrollado */}
      <ellipse cx="80" cy="56" rx="58" ry="13" fill="url(#bk-inside)" />
      <ellipse cx="80" cy="62" rx="53" ry="10" fill="url(#bk-water)" />
      <g clipPath="url(#bk-water-clip)">
        {Array.from({ length: fishCount }, (_, i) => {
          const l = lanes[i];
          return (
            <g
              key={i}
              className="bucket-fish"
              style={
                {
                  '--d': `${l.d}px`,
                  animationDuration: `${l.dur}s`,
                  animationDelay: `${l.delay}s`,
                } as React.CSSProperties
              }
            >
              <g transform={`translate(${l.x} ${l.y}) scale(${l.d < 0 ? -1 : 1} 1)`}>
                <path d="M-8.5 0 L-13 -2.6 C-12.2 -0.8 -12.2 0.8 -13 2.6 Z" fill="#e7a84a" opacity="0.85" />
                <path
                  d="M-9 0 C-6 -2.4 2 -3 7 -1.4 C8.6 -0.8 9.6 0 9.6 0 C9.6 0 8.6 0.8 7 1.4 C2 3 -6 2.4 -9 0 Z"
                  fill="#e6e4d2"
                  opacity="0.92"
                />
                <path d="M-9 0.1 L5 0" stroke="#c4d6de" strokeWidth="0.9" />
                <circle cx="6.6" cy="-0.5" r="0.75" fill="#15212a" />
              </g>
            </g>
          );
        })}
        <ellipse cx="64" cy="57.5" rx="22" ry="2.6" fill="#fff" opacity="0.3" />
        {hot && (
          <g className="bucket-ripples">
            <ellipse cx="80" cy="62" rx="18" ry="3.4" />
            <ellipse cx="80" cy="62" rx="18" ry="3.4" />
          </g>
        )}
      </g>
      {/* borde enrollado: parte de atrás (más oscura) y parte de adelante (con brillo) */}
      <path d="M22 56 A58 13 0 0 1 138 56" fill="none" stroke="#7d878e" strokeWidth="4" />
      <path d="M138 56 A58 13 0 0 1 22 56" fill="none" stroke="url(#bk-rim)" strokeWidth="5" />
      <path d="M134 60.2 A55 10.5 0 0 1 26 60.2" fill="none" stroke="#ffffff" strokeWidth="0.9" opacity="0.55" />
    </svg>
  );
}

/** Gotitas que saltan cuando cae un pez. */
function Splash() {
  const drops = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (-160 + (140 * i) / 13 + (Math.random() * 14 - 7)) * (Math.PI / 180);
        const dist = 34 + Math.random() * 46;
        return {
          id: i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          size: 5 + Math.random() * 7,
          delay: Math.random() * 0.06,
        };
      }),
    [],
  );
  return (
    <div className="splash" aria-hidden="true">
      {drops.map((d) => (
        <motion.span
          key={d.id}
          className="splash-drop"
          style={{ width: d.size, height: d.size * 1.25 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
          animate={{ x: d.dx * 1.3, y: [0, d.dy, d.dy + 40], opacity: [1, 1, 0], scale: [0.6, 1, 0.7] }}
          transition={{ duration: 0.75, delay: d.delay, ease: 'easeOut', times: [0, 0.45, 1] }}
        />
      ))}
      <motion.span
        className="splash-ring"
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <motion.span
        className="splash-plus"
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: -64, opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
      >
        +1 🐟
      </motion.span>
    </div>
  );
}
