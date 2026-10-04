import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LogEntry, MailLink, Task, TaskKind } from '../types';
import { uid } from '../lib/id';
import { TONES } from '../lib/tones';
import { trackedMs } from '../lib/time';

export const STORAGE_KEY = 'mojarrita:v1';

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

  startTimer(id: string): void;
  pauseTimer(id: string): void;

  /** Saca la tarea del agua y la guarda en la bitácora. Devuelve el id de la entrada. */
  completeTask(id: string): string | null;
  updateLog(id: string, patch: Partial<Pick<LogEntry, 'minutes' | 'comment'>>): void;
  /** "Devolver al agua": la tarea vuelve a la lista. */
  restoreFromLog(id: string): void;
  deleteLog(id: string): void;

  replaceAll(data: { tasks: Task[]; log: LogEntry[] }): void;
}

const mapTask = (tasks: Task[], id: string, fn: (t: Task) => Task) =>
  tasks.map((t) => (t.id === id ? fn(t) : t));

const pause = (t: Task, now: number): Task =>
  t.runningSince ? { ...t, trackedMs: trackedMs(t, now), runningSince: undefined } : t;

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
          trackedMs: 0,
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

      startTimer(id) {
        const now = Date.now();
        // Una cosa a la vez: arrancar una tarea pausa las demás.
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? (t.runningSince ? t : { ...t, runningSince: now }) : pause(t, now))),
        }));
      },

      pauseTimer(id) {
        const now = Date.now();
        set((s) => ({ tasks: mapTask(s.tasks, id, (t) => pause(t, now)) }));
      },

      completeTask(id) {
        const now = Date.now();
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return null;
        const snapshot = pause(task, now);
        const tracked = Math.round(snapshot.trackedMs / 60000);
        const entry: LogEntry = {
          id: uid(),
          task: snapshot,
          completedAt: now,
          minutes: tracked > 0 ? tracked : null,
          comment: '',
        };
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ tasks: s.tasks, log: s.log, toneCursor: s.toneCursor }),
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
