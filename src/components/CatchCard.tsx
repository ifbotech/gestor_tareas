import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTasks } from '../store/tasks';
import { useUI } from '../store/ui';
import { formatMinutes, parseDuration } from '../lib/time';
import { Fish } from './Fish';
import { IconUndo, IconX } from './Icons';

const QUICK = [10, 15, 30, 45, 60, 90, 120];

/** Aparece arriba del balde después de pescar: ¿cuánto tardaste? Se guarda mientras escribís. */
export function CatchCard() {
  const entryId = useUI((s) => s.catchEntryId);
  const showCatch = useUI((s) => s.showCatch);
  const entry = useTasks((s) => s.log.find((e) => e.id === entryId));

  return (
    <AnimatePresence>
      {entry && <CatchCardBody key={entry.id} entryId={entry.id} onClose={() => showCatch(null)} />}
    </AnimatePresence>
  );
}

function CatchCardBody({ entryId, onClose }: { entryId: string; onClose(): void }) {
  const entry = useTasks((s) => s.log.find((e) => e.id === entryId));
  const updateLog = useTasks((s) => s.updateLog);
  const restore = useTasks((s) => s.restoreFromLog);
  const toast = useUI((s) => s.toast);
  const [text, setText] = useState(() => (entry?.minutes ? formatMinutes(entry.minutes) : ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    if (!coarse) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!entry) return null;
  const parsed = parseDuration(text);
  const invalid = text.trim() !== '' && parsed == null;

  const setMinutes = (raw: string) => {
    setText(raw);
    const m = parseDuration(raw);
    if (raw.trim() === '') updateLog(entry.id, { minutes: null });
    else if (m != null) updateLog(entry.id, { minutes: m });
  };

  return (
    <motion.div
      className="catch-card"
      role="dialog"
      aria-label="Tarea terminada"
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <button type="button" className="icon-btn catch-close" onClick={onClose} aria-label="Cerrar">
        <IconX size={16} />
      </button>
      <div className="catch-head">
        <Fish width={64} className="catch-fish" />
        <div>
          <p className="catch-kicker">¡Al balde!</p>
          <p className="catch-title">{entry.task.title}</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (invalid) return;
          onClose();
          toast('Guardado en la bitácora');
        }}
      >
        <label className="catch-label" htmlFor="catch-minutes">
          ¿Cuánto tardaste?
        </label>
        <input
          ref={inputRef}
          id="catch-minutes"
          className={`input ${invalid ? 'is-invalid' : ''}`}
          value={text}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="ej: 40 min, 1h 30, 2h"
          autoComplete="off"
          inputMode="text"
        />
        {invalid && <p className="hint hint--warn">No entendí. Probá con “45 min” o “1h 30”.</p>}
        <div className="chips">
          {QUICK.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${parsed === m ? 'is-on' : ''}`}
              onClick={() => setMinutes(formatMinutes(m))}
            >
              {formatMinutes(m)}
            </button>
          ))}
        </div>

        <label className="catch-label" htmlFor="catch-comment">
          Comentario <span className="muted">(opcional)</span>
        </label>
        <input
          id="catch-comment"
          className="input"
          value={entry.comment}
          onChange={(e) => updateLog(entry.id, { comment: e.target.value })}
          placeholder="¿Algo para recordar?"
          autoComplete="off"
        />

        <div className="catch-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              restore(entry.id);
              onClose();
              toast('La tarea volvió al agua');
            }}
            title="Me equivoqué: devolver la tarea a la lista"
          >
            <IconUndo size={15} /> Devolver al agua
          </button>
          <button type="submit" className="btn btn-primary">
            Listo
          </button>
        </div>
      </form>
    </motion.div>
  );
}
