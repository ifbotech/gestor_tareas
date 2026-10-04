import { beforeEach, describe, expect, it, vi } from 'vitest';

// localStorage mínimo para que persist funcione en Node.
const mem = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
});

const { useTasks, STORAGE_KEY } = await import('./tasks');
const s = () => useTasks.getState();

beforeEach(() => {
  useTasks.setState({ tasks: [], log: [], toneCursor: 0 });
  vi.useRealTimers();
});

describe('tareas', () => {
  it('crea tareas rápidas y proyectos, las nuevas arriba', () => {
    s().addTask('quick', 'Uno');
    s().addTask('project', '  Dos  ');
    expect(s().tasks.map((t) => [t.kind, t.title])).toEqual([
      ['project', 'Dos'],
      ['quick', 'Uno'],
    ]);
  });

  it('subtareas: agregar, tildar, renombrar, borrar', () => {
    const id = s().addTask('project', 'P');
    s().addSubtask(id, 'a');
    s().addSubtask(id, '   ');
    s().addSubtask(id, 'b');
    let subs = s().tasks[0].subtasks;
    expect(subs.map((x) => x.title)).toEqual(['a', 'b']);
    s().toggleSubtask(id, subs[0].id);
    s().renameSubtask(id, subs[1].id, 'b2');
    subs = s().tasks[0].subtasks;
    expect(subs[0].done).toBe(true);
    expect(subs[0].doneAt).toBeTypeOf('number');
    expect(subs[1].title).toBe('b2');
    s().deleteSubtask(id, subs[0].id);
    expect(s().tasks[0].subtasks).toHaveLength(1);
  });

  it('mails: vincula link o asunto, no vacíos', () => {
    const id = s().addTask('quick', 'T');
    s().addMail(id, { url: 'https://outlook.office.com/mail/inbox/id/x', subject: 'RE: algo' });
    s().addMail(id, { subject: 'Solo asunto' });
    s().addMail(id, { subject: '   ' });
    expect(s().tasks[0].mails.map((m) => m.subject)).toEqual(['RE: algo', 'Solo asunto']);
    s().removeMail(id, s().tasks[0].mails[0].id);
    expect(s().tasks[0].mails).toHaveLength(1);
  });

  it('cronómetro: una tarea a la vez', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const a = s().addTask('quick', 'A');
    const b = s().addTask('quick', 'B');
    s().startTimer(a);
    vi.setSystemTime(1_000_000 + 60_000);
    s().startTimer(b);
    const ta = s().tasks.find((t) => t.id === a)!;
    const tb = s().tasks.find((t) => t.id === b)!;
    expect(ta.runningSince).toBeUndefined();
    expect(ta.trackedMs).toBe(60_000);
    expect(tb.runningSince).toBe(1_060_000);
  });
});

describe('balde y bitácora', () => {
  it('terminar pasa la tarea a la bitácora con el tiempo medido', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const id = s().addTask('quick', 'Informe');
    s().startTimer(id);
    vi.setSystemTime(25 * 60_000);
    const entryId = s().completeTask(id)!;
    expect(s().tasks).toHaveLength(0);
    const entry = s().log[0];
    expect(entry.id).toBe(entryId);
    expect(entry.minutes).toBe(25);
    expect(entry.task.runningSince).toBeUndefined();
    expect(entry.completedAt).toBe(25 * 60_000);
  });

  it('sin cronómetro, el tiempo queda para cargar', () => {
    const id = s().addTask('quick', 'X');
    s().completeTask(id);
    expect(s().log[0].minutes).toBeNull();
    s().updateLog(s().log[0].id, { minutes: 40, comment: 'ok' });
    expect(s().log[0]).toMatchObject({ minutes: 40, comment: 'ok' });
  });

  it('devolver al agua restaura la tarea tal cual', () => {
    const id = s().addTask('project', 'P');
    s().addSubtask(id, 'a');
    const entryId = s().completeTask(id)!;
    s().restoreFromLog(entryId);
    expect(s().log).toHaveLength(0);
    expect(s().tasks[0]).toMatchObject({ id, title: 'P' });
    expect(s().tasks[0].subtasks).toHaveLength(1);
  });

  it('completar una tarea que no existe no hace nada', () => {
    expect(s().completeTask('nope')).toBeNull();
    expect(s().log).toHaveLength(0);
  });

  it('se guarda en localStorage', () => {
    s().addTask('quick', 'Persistida');
    const saved = JSON.parse(mem.get(STORAGE_KEY)!);
    expect(saved.state.tasks[0].title).toBe('Persistida');
  });
});
