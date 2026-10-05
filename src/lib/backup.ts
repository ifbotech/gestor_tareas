import type { LogEntry, Task } from '../types';
import { dayKey, formatMinutes, formatTime } from './time';

export interface Backup {
  app: 'mis-tareas';
  version: 1;
  exportedAt: string;
  tasks: Task[];
  log: LogEntry[];
}

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function makeBackup(tasks: Task[], log: LogEntry[]): Backup {
  return { app: 'mis-tareas', version: 1, exportedAt: new Date().toISOString(), tasks, log };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function isTask(v: unknown): v is Task {
  return (
    isObj(v) &&
    typeof v.id === 'string' &&
    (v.kind === 'quick' || v.kind === 'project') &&
    typeof v.title === 'string' &&
    Array.isArray(v.subtasks) &&
    Array.isArray(v.mails)
  );
}

/** Valida un backup importado. Tira un Error con un mensaje entendible si no sirve. */
export function parseBackup(text: string): { tasks: Task[]; log: LogEntry[] } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un backup válido (no es JSON).');
  }
  if (!isObj(data) || !Array.isArray(data.tasks) || !Array.isArray(data.log)) {
    throw new Error('El archivo no parece una copia de Mis tareas.');
  }
  const tasks = data.tasks.filter(isTask).map(normalizeTask);
  const log = data.log
    .filter(
      (e): e is LogEntry => isObj(e) && typeof e.id === 'string' && isTask(e.task) && typeof e.completedAt === 'number',
    )
    .map((e) => ({
      ...e,
      task: normalizeTask(e.task),
      minutes: typeof e.minutes === 'number' ? e.minutes : null,
      comment: typeof e.comment === 'string' ? e.comment : '',
    }));
  return { tasks, log };
}

function normalizeTask(t: Task): Task {
  return {
    ...t,
    notes: typeof t.notes === 'string' ? t.notes : '',
    tone: typeof t.tone === 'number' ? t.tone : 0,
    createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
  };
}

/** CSV para Excel (separador ";" y BOM para que respete los acentos). */
export function logToCsv(log: LogEntry[]): string {
  const header = ['Fecha', 'Hora', 'Tarea', 'Tipo', 'Minutos', 'Duración', 'Comentario', 'Subtareas', 'Notas', 'Mails'];
  const rows = log.map((e) => {
    const t = e.task;
    const subs = t.subtasks.length ? `${t.subtasks.filter((s) => s.done).length}/${t.subtasks.length}` : '';
    const mails = t.mails.map((m) => [m.subject, m.url].filter(Boolean).join(' ')).join(' | ');
    return [
      dayKey(e.completedAt),
      formatTime(e.completedAt),
      t.title,
      t.kind === 'project' ? 'Proyecto' : 'Rápida',
      e.minutes ?? '',
      e.minutes != null ? formatMinutes(e.minutes) : '',
      e.comment,
      subs,
      t.notes,
      mails,
    ];
  });
  const cell = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}
