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
  const fishing = phase === 'dragging' || phase === 'flying';

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
      <AnimatePresence>
        {fishing && (
          <motion.div
            className="bucket-hint"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
          >
            {hot ? '¡Soltala!' : 'Tirala al balde'}
          </motion.div>
        )}
      </AnimatePresence>

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
  // Posiciones fijas para que cada pececito nade siempre en su carril.
  const lanes = [
    { x: 38, y: 60, d: 40, dur: 5.2, delay: 0 },
    { x: 70, y: 64, d: -34, dur: 6.1, delay: -1.3 },
    { x: 52, y: 56.5, d: 44, dur: 7.0, delay: -2.6 },
    { x: 88, y: 59, d: -42, dur: 5.6, delay: -3.1 },
    { x: 46, y: 65.5, d: 36, dur: 6.6, delay: -0.7 },
    { x: 96, y: 63, d: -30, dur: 4.8, delay: -2.0 },
    { x: 62, y: 60, d: 30, dur: 7.6, delay: -4.2 },
  ];
  return (
    <svg viewBox="0 0 160 172" className="bucket-svg" aria-hidden="true">
      <defs>
        <linearGradient id="bk-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#77828d" />
          <stop offset="0.16" stopColor="#b6bfc8" />
          <stop offset="0.36" stopColor="#e6ebef" />
          <stop offset="0.55" stopColor="#b2bbc4" />
          <stop offset="0.85" stopColor="#8a949e" />
          <stop offset="1" stopColor="#6a7480" />
        </linearGradient>
        <linearGradient id="bk-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f99a3" />
          <stop offset="0.35" stopColor="#f3f6f8" />
          <stop offset="0.7" stopColor="#c3cad1" />
          <stop offset="1" stopColor="#7f8994" />
        </linearGradient>
        <radialGradient id="bk-water" cx="0.45" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#8fd6fb" />
          <stop offset="0.6" stopColor="#3f9fe0" />
          <stop offset="1" stopColor="#2a74b8" />
        </radialGradient>
        <clipPath id="bk-water-clip">
          <ellipse cx="80" cy="61" rx="58" ry="11" />
        </clipPath>
      </defs>

      {/* sombra en el piso */}
      <ellipse cx="80" cy="163" rx="60" ry="7" fill="#0d3b5e" opacity="0.16" />

      {/* manija */}
      <g className="bucket-handle">
        <path d="M16 62 C14 6 146 6 144 62" fill="none" stroke="#56606a" strokeWidth="4.5" strokeLinecap="round" />
        <path
          d="M18 60 C17 9 143 9 142 60"
          fill="none"
          stroke="#c8d0d7"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <rect x="64" y="7" width="32" height="10" rx="5" fill="#3d4650" />
        <rect x="66" y="8.5" width="28" height="3" rx="1.5" fill="#6b7580" />
      </g>

      {/* cuerpo */}
      <path
        d="M14 58 L34 154 Q80 167 126 154 L146 58 Z"
        fill="url(#bk-body)"
        stroke="#5f6974"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M20.5 89 Q80 105 139.5 89" fill="none" stroke="#66707b" strokeWidth="2.2" opacity="0.55" />
      <path d="M21 92 Q80 108 139 92" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.35" />
      <path d="M27.5 123 Q80 137 132.5 123" fill="none" stroke="#66707b" strokeWidth="2.2" opacity="0.55" />
      <path d="M28 126 Q80 140 132 126" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.35" />
      <path d="M44 70 L54 150" stroke="#fff" strokeWidth="6" opacity="0.22" strokeLinecap="round" />

      {/* orejas de la manija */}
      <circle cx="15" cy="64" r="4.5" fill="#5f6974" />
      <circle cx="145" cy="64" r="4.5" fill="#5f6974" />

      {/* boca: borde, interior y agua */}
      <ellipse cx="80" cy="58" rx="66" ry="15" fill="#4a545e" />
      <ellipse cx="80" cy="61" rx="58" ry="11" fill="url(#bk-water)" />
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
                <path d="M-8 0 L-13 -3.5 C-12 -1 -12 1 -13 3.5 Z" fill="#f2a945" opacity="0.85" />
                <path
                  d="M-9 0 C-6 -4 4 -4.5 9 -1.5 C10 -0.8 10.5 0 10.5 0 C10.5 0 10 0.8 9 1.5 C4 4.5 -6 4 -9 0 Z"
                  fill="#dbe8f0"
                  opacity="0.92"
                />
                <circle cx="7" cy="-0.8" r="0.9" fill="#15212a" />
              </g>
            </g>
          );
        })}
        <ellipse className="bucket-shine" cx="62" cy="56" rx="22" ry="3" fill="#fff" opacity="0.28" />
        {hot && (
          <g className="bucket-ripples">
            <ellipse cx="80" cy="61" rx="18" ry="3.6" />
            <ellipse cx="80" cy="61" rx="18" ry="3.6" />
          </g>
        )}
      </g>
      <ellipse cx="80" cy="58" rx="66" ry="15" fill="none" stroke="url(#bk-rim)" strokeWidth="5.5" />
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
