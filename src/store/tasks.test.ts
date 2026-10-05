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

const { useTasks, STORAGE_KEY, migrate } = await import('./tasks');
const s = () => useTasks.getState();

beforeEach(() => {
  useTasks.setState({ tasks: [], log: [], toneCursor: 0 });
  vi.useRealTimers();
});

describe('tareas', () => {
  it('cada tarea nueva toma el siguiente tono (todos, verdes primero)', () => {
    for (let i = 0; i < 7; i++) s().addTask(i % 2 ? 'project' : 'quick', `T${i}`);
    expect(
      s()
        .tasks.map((t) => t.tone)
        .reverse(),
    ).toEqual([0, 1, 2, 3, 4, 5, 0]);
  });

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
});

describe('balde y bitácora', () => {
  it('terminar pasa la tarea a la bitácora y el tiempo queda para cargar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_234_000);
    const id = s().addTask('quick', 'X');
    const entryId = s().completeTask(id)!;
    expect(s().tasks).toHaveLength(0);
    expect(s().log[0]).toMatchObject({ id: entryId, completedAt: 1_234_000, minutes: null, comment: '' });
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

describe('migración 1.0 → 1.1', () => {
  const base = { notes: '', tone: 0, createdAt: 1, mails: [], subtasks: [] };
  const v1 = {
    toneCursor: 3,
    tasks: [
      { ...base, id: 'a', kind: 'quick', title: 'Tocá ▶ para empezar y medir el tiempo', trackedMs: 0 },
      { ...base, id: 'b', kind: 'quick', title: 'Arrastrame al balde gris cuando termines 🐟', trackedMs: 0 },
      {
        ...base,
        id: 'c',
        kind: 'project',
        title: 'Mi primer proyecto',
        trackedMs: 0,
        subtasks: [
          { id: '1', title: 'Tildá esta subtarea', done: true },
          { id: '2', title: 'Agregá otra subtarea acá abajo', done: false },
          { id: '3', title: 'Cuando esté todo, tirá el proyecto al balde', done: false },
        ],
      },
      { ...base, id: 'd', kind: 'quick', title: 'Responder a Juan', trackedMs: 120000, runningSince: 5 },
      // Ejemplo que el usuario modificó (le agregó notas): se queda.
      { ...base, id: 'e', kind: 'quick', title: 'Tocá ▶ para empezar y medir el tiempo', notes: 'mío', trackedMs: 0 },
    ],
    log: [
      {
        id: 'l',
        completedAt: 1,
        minutes: 5,
        comment: '',
        task: { ...base, id: 'x', kind: 'quick', title: 'Vieja', trackedMs: 300000 },
      },
    ],
  };

  it('saca las tareas-tutorial intactas y los campos del cronómetro', () => {
    const out = migrate(v1 as never, 1);
    expect(out.tasks.map((t) => t.id)).toEqual(['d', 'e']);
    for (const t of [...out.tasks, ...out.log.map((e) => e.task)]) {
      expect(t).not.toHaveProperty('trackedMs');
      expect(t).not.toHaveProperty('runningSince');
    }
    // Lo medido se conserva (el tramo de un cronómetro olvidado prendido días no cuenta).
    expect(out.tasks[0].pendingMinutes).toBe(2);
    expect(out.tasks[1]).not.toHaveProperty('pendingMinutes');
    expect(out.log[0].task).not.toHaveProperty('pendingMinutes');
    expect(out.log[0]).toMatchObject({ minutes: 5, task: { title: 'Vieja' } });
    expect(out.toneCursor).toBe(3);
  });

  it('el tiempo medido en la 1.0 aparece al soltar la tarea en el balde', () => {
    vi.useFakeTimers();
    vi.setSystemTime(10 * 60_000);
    const out = migrate(
      {
        toneCursor: 0,
        log: [],
        tasks: [{ ...base, id: 'z', kind: 'quick', title: 'Con tiempo', trackedMs: 30 * 60_000, runningSince: 0 }],
      } as never,
      1,
    );
    expect(out.tasks[0].pendingMinutes).toBe(40); // 30 acumulados + 10 corriendo
    useTasks.setState({ tasks: out.tasks, log: [] });
    s().completeTask('z');
    expect(s().log[0].minutes).toBe(40);
    expect(s().log[0].task).not.toHaveProperty('pendingMinutes');
  });

  it('no toca datos que ya son 1.1', () => {
    const state = { tasks: [], log: [], toneCursor: 0 };
    expect(migrate(state, 2)).toBe(state);
  });
});
