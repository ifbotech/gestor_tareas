import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LogEntry, MailLink, Task, TaskKind } from '../types';
import { uid } from '../lib/id';
import { TONES } from '../lib/tones';

/** Nombre interno de cuando la app se llamaba "Mojarrita": se mantiene para no perder lo guardado. */
export const STORAGE_KEY = 'mojarrita:v1';

type PersistedState = Pick<TasksState, 'tasks' | 'log' | 'toneCursor'>;

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

/** 1.0 → 1.1: sin cronómetro y sin las tareas-tutorial de ejemplo. */
export function migrate(state: PersistedState, version: number): PersistedState {
  if (version >= 2 || !state) return state;
  const strip = (t: Task): Task => {
    const { trackedMs: _t, runningSince: _r, ...rest } = t as Task & { trackedMs?: number; runningSince?: number };
    return rest;
  };
  return {
    ...state,
    tasks: (state.tasks ?? []).filter((t) => !isUntouchedExample(t)).map(strip),
    log: (state.log ?? []).map((e) => ({ ...e, task: strip(e.task) })),
  };
}

export interface TasksState {
  tasks: Task[];
  log: LogEntry[];
  toneCursor: number;

  addTask(kind: TaskKind, title: string): string;
  updateTask(id: string, patch: Partial<Omit<Task, 'id'>>): void;
  deleteTask(id: string): void;

  addSubtask(taskId: string, title: string): void;
  toggleSubtask(taskId: string, subId: string): void;
  renameSubtask(taskId: string, subId: string, title: string): void;
  deleteSubtask(taskId: string, subId: string): void;

  addMail(taskId: string, mail: { url?: string; subject: string }): void;
  removeMail(taskId: string, mailId: string): void;

  /** Saca la tarea del agua y la guarda en la bitácora. Devuelve el id de la entrada. */
  completeTask(id: string): string | null;
  updateLog(id: string, patch: Partial<Pick<LogEntry, 'minutes' | 'comment'>>): void;
  /** "Devolver al agua": la tarea vuelve a la lista. */
  restoreFromLog(id: string): void;
  deleteLog(id: string): void;

  replaceAll(data: { tasks: Task[]; log: LogEntry[] }): void;
}

const mapTask = (tasks: Task[], id: string, fn: (t: Task) => Task) => tasks.map((t) => (t.id === id ? fn(t) : t));

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      log: [],
      toneCursor: 0,

      addTask(kind, title) {
        const id = uid();
        const cursor = get().toneCursor;
        const task: Task = {
          id,
          kind,
          title: title.trim() || (kind === 'project' ? 'Proyecto sin nombre' : 'Tarea sin nombre'),
          notes: '',
          // Los proyectos arrancan en los azules más profundos.
          tone: kind === 'project' ? (cursor * 2 + 2) % TONES.length : (cursor * 2) % TONES.length,
          createdAt: Date.now(),
          mails: [],
          subtasks: [],
        };
        set((s) => ({ tasks: [task, ...s.tasks], toneCursor: s.toneCursor + 1 }));
        return id;
      },

      updateTask(id, patch) {
        set((s) => ({ tasks: mapTask(s.tasks, id, (t) => ({ ...t, ...patch })) }));
      },

      deleteTask(id) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      addSubtask(taskId, title) {
        const clean = title.trim();
        if (!clean) return;
        set((s) => ({
          tasks: mapTask(s.tasks, taskId, (t) => ({
            ...t,
            subtasks: [...t.subtasks, { id: uid(), title: clean, done: false }],
          })),
        }));
      },

      toggleSubtask(taskId, subId) {
        set((s) => ({
          tasks: mapTask(s.tasks, taskId, (t) => ({
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subId ? { ...st, done: !st.done, doneAt: st.done ? undefined : Date.now() } : st,
            ),
          })),
        }));
      },

      renameSubtask(taskId, subId, title) {
        const clean = title.trim();
        if (!clean) return;
        set((s) => ({
          tasks: mapTask(s.tasks, taskId, (t) => ({
            ...t,
            subtasks: t.subtasks.map((st) => (st.id === subId ? { ...st, title: clean } : st)),
          })),
        }));
      },

      deleteSubtask(taskId, subId) {
        set((s) => ({
          tasks: mapTask(s.tasks, taskId, (t) => ({
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subId),
          })),
        }));
      },

      addMail(taskId, mail) {
        const link: MailLink = { id: uid(), url: mail.url, subject: mail.subject.trim(), addedAt: Date.now() };
        if (!link.url && !link.subject) return;
        set((s) => ({ tasks: mapTask(s.tasks, taskId, (t) => ({ ...t, mails: [...t.mails, link] })) }));
      },

      removeMail(taskId, mailId) {
        set((s) => ({
          tasks: mapTask(s.tasks, taskId, (t) => ({ ...t, mails: t.mails.filter((m) => m.id !== mailId) })),
        }));
      },

      completeTask(id) {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return null;
        const entry: LogEntry = { id: uid(), task, completedAt: Date.now(), minutes: null, comment: '' };
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), log: [entry, ...s.log] }));
        return entry.id;
      },

      updateLog(id, patch) {
        set((s) => ({ log: s.log.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
      },

      restoreFromLog(id) {
        const entry = get().log.find((e) => e.id === id);
        if (!entry) return;
        set((s) => ({
          log: s.log.filter((e) => e.id !== id),
          tasks: s.tasks.some((t) => t.id === entry.task.id) ? s.tasks : [entry.task, ...s.tasks],
        }));
      },

      deleteLog(id) {
        set((s) => ({ log: s.log.filter((e) => e.id !== id) }));
      },

      replaceAll(data) {
        set({ tasks: data.tasks, log: data.log });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ tasks: s.tasks, log: s.log, toneCursor: s.toneCursor }),
      migrate: (persisted, version) => migrate(persisted as PersistedState, version),
    },
  ),
);

/** Si la app está abierta en dos pestañas, que se mantengan sincronizadas. */
export function syncAcrossTabs(): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) void useTasks.persist.rehydrate();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
