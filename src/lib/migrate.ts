import type { LogEntry, Task } from '../types';

/** Tareas de ejemplo que traía la 1.0 la primera vez: si siguen tal cual, se sacan. */
const V1_EXAMPLES = {
  quick: ['Tocá ▶ para empezar y medir el tiempo', 'Arrastrame al balde gris cuando termines 🐟'],
  project: 'Mi primer proyecto',
  subtasks: ['Tildá esta subtarea', 'Agregá otra subtarea acá abajo', 'Cuando esté todo, tirá el proyecto al balde'],
};

const isUntouchedExample = (t: Task) =>
  !t.notes &&
  t.mails.length === 0 &&
  ((t.kind === 'quick' && V1_EXAMPLES.quick.includes(t.title)) ||
    (t.kind === 'project' &&
      t.title === V1_EXAMPLES.project &&
      t.subtasks.length === V1_EXAMPLES.subtasks.length &&
      t.subtasks.every((st, i) => st.title === V1_EXAMPLES.subtasks[i])));

type V1Task = Task & { trackedMs?: number; runningSince?: number };

/**
 * Saca los campos del cronómetro de la 1.0. Si la tarea tenía tiempo medido,
 * lo deja como `pendingMinutes` para proponerlo al soltarla en el balde.
 */
function stripTimer(t: Task, now: number): Task {
  const { trackedMs, runningSince, ...rest } = t as V1Task;
  // Un cronómetro que quedó corriendo más de 12 h se olvidó prendido: ese tramo no cuenta.
  const running = runningSince != null ? Math.max(0, now - runningSince) : 0;
  const ms = (trackedMs ?? 0) + (running <= 12 * 3600_000 ? running : 0);
  const minutes = Math.round(ms / 60000);
  return minutes > 0 && rest.pendingMinutes == null ? { ...rest, pendingMinutes: minutes } : rest;
}

/** 1.0 → 1.1: sin cronómetro (conservando lo medido) y sin las tareas-tutorial de ejemplo. */
export function cleanupV1<S extends { tasks: Task[]; log: LogEntry[] }>(state: S, now = Date.now()): S {
  return {
    ...state,
    tasks: (state.tasks ?? []).filter((t) => !isUntouchedExample(t)).map((t) => stripTimer(t, now)),
    log: (state.log ?? []).map((e) => {
      const { pendingMinutes: _p, ...task } = stripTimer(e.task, now);
      return { ...e, task };
    }),
  };
}
