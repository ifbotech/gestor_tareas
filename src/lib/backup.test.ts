import { describe, expect, it } from 'vitest';
import { logToCsv, makeBackup, parseBackup } from './backup';
import type { LogEntry, Task } from '../types';

const task: Task = {
  id: 't1',
  kind: 'project',
  title: 'Proyecto "grande"',
  notes: 'nota',
  tone: 2,
  createdAt: 1,
  mails: [{ id: 'm', url: 'https://outlook.office.com/mail/inbox/id/x', subject: 'RE: x', addedAt: 1 }],
  subtasks: [
    { id: 's1', title: 'a', done: true },
    { id: 's2', title: 'b', done: false },
  ],
};
const entry: LogEntry = {
  id: 'e1',
  task,
  completedAt: new Date(2026, 9, 4, 9, 5).getTime(),
  minutes: 90,
  comment: 'bien',
};

describe('backup', () => {
  it('ida y vuelta', () => {
    const json = JSON.stringify(makeBackup([task], [entry]));
    const back = parseBackup(json);
    expect(back.tasks).toEqual([task]);
    expect(back.log).toEqual([entry]);
  });

  it('rechaza archivos que no son backups', () => {
    expect(() => parseBackup('hola')).toThrow(/JSON/);
    expect(() => parseBackup('{"a":1}')).toThrow(/copia de Mis tareas/);
  });

  it('descarta elementos rotos y completa campos faltantes', () => {
    const back = parseBackup(
      JSON.stringify({
        tasks: [{ id: 'x', kind: 'quick', title: 'T', subtasks: [], mails: [] }, { nope: true }],
        log: [{ id: 1 }],
      }),
    );
    expect(back.tasks).toHaveLength(1);
    expect(back.tasks[0]).toMatchObject({ notes: '', tone: 0 });
    expect(back.log).toHaveLength(0);
  });
});

describe('CSV', () => {
  it('formato para Excel en español', () => {
    const csv = logToCsv([entry]);
    expect(csv.startsWith('﻿')).toBe(true);
    const [header, row] = csv.slice(1).split('\r\n');
    expect(header.split(';')[0]).toBe('"Fecha"');
    expect(row).toContain('"2026-10-04";"09:05";"Proyecto ""grande""";"Proyecto";"90";"1 h 30 min";"bien";"1/2"');
  });
});
