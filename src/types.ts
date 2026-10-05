export type TaskKind = 'quick' | 'project';

/** Un mail vinculado a una tarea: un link (Outlook web, etc.) y/o el asunto para buscarlo. */
export interface MailLink {
  id: string;
  url?: string;
  subject: string;
  addedAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  doneAt?: number;
}

export interface Task {
  id: string;
  kind: TaskKind;
  title: string;
  notes: string;
  /** Índice en la paleta de azules (ver lib/tones). */
  tone: number;
  createdAt: number;
  mails: MailLink[];
  subtasks: Subtask[];
  /** Proyectos: subtareas plegadas. */
  collapsed?: boolean;
}

/** Una tarea terminada, guardada en la bitácora. */
export interface LogEntry {
  id: string;
  task: Task;
  completedAt: number;
  /** Cuánto tardé (minutos). null = sin cargar. */
  minutes: number | null;
  comment: string;
}
