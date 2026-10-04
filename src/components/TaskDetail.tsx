import { useEffect, useRef, useState } from 'react';
import { useTasks } from '../store/tasks';
import { useUI } from '../store/ui';
import { sendToBucket } from '../store/pond';
import { TONES } from '../lib/tones';
import { formatTime, todayLong } from '../lib/time';
import { Modal } from './Modal';
import { TimerButton } from './TimerButton';
import { SubtaskList } from './SubtaskList';
import { MailAddForm, MailChips } from './MailLinks';
import { IconCheck, IconTrash } from './Icons';

/** Detalle de una tarea: nombre, tipo, color, notas, mails y subtareas. Todo se guarda solo. */
export function TaskDetail() {
  const openTaskId = useUI((s) => s.openTaskId);
  const openTask = useUI((s) => s.openTask);
  const toast = useUI((s) => s.toast);
  const current = useTasks((s) => s.tasks.find((t) => t.id === openTaskId));
  // Mientras el diálogo se cierra seguimos mostrando la última tarea (si no, se vacía de golpe).
  const lastTask = useRef(current);
  if (current) lastTask.current = current;
  const task = current ?? lastTask.current;
  const updateTask = useTasks((s) => s.updateTask);
  const deleteTask = useTasks((s) => s.deleteTask);
  const addMail = useTasks((s) => s.addMail);
  const removeMail = useTasks((s) => s.removeMail);
  const [title, setTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) setTitle(task.title);
    setConfirmDelete(false);
    // Solo al abrir otra tarea.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const close = () => openTask(null);
  const open = !!current;

  const commitTitle = () => {
    if (task && title.trim() && title.trim() !== task.title) updateTask(task.id, { title: title.trim() });
    else if (task) setTitle(task.title);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        commitTitle();
        close();
      }}
      size="lg"
      title={task?.kind === 'project' ? 'Proyecto' : 'Tarea rápida'}
      footer={
        task && (
          <>
            {confirmDelete ? (
              <div className="confirm">
                <span>¿Borrar sin pasar por el balde?</span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    deleteTask(task.id);
                    close();
                    toast('Tarea borrada');
                  }}
                >
                  Sí, borrar
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                  No
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => setConfirmDelete(true)}>
                <IconTrash size={16} /> Borrar
              </button>
            )}
            <span className="spacer" />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                commitTitle();
                close();
                const el = document.querySelector<HTMLElement>(`[data-task-id="${task.id}"]`);
                // Esperamos a que cierre el diálogo para que se vea el salto al balde.
                window.setTimeout(() => sendToBucket(task, el), 220);
              }}
            >
              <IconCheck size={16} /> Terminada: al balde
            </button>
          </>
        )
      }
    >
      {task && (
        <div className="detail">
          <input
            className="detail-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            aria-label="Nombre de la tarea"
          />
          <p className="detail-meta">
            Creada el {todayLong(task.createdAt).toLowerCase()}, {formatTime(task.createdAt)} h
          </p>

          <div className="detail-row">
            <div className="segmented" role="radiogroup" aria-label="Tipo">
              <button
                type="button"
                role="radio"
                aria-checked={task.kind === 'quick'}
                className={task.kind === 'quick' ? 'is-on' : ''}
                onClick={() => updateTask(task.id, { kind: 'quick' })}
              >
                Rápida
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={task.kind === 'project'}
                className={task.kind === 'project' ? 'is-on' : ''}
                onClick={() => updateTask(task.id, { kind: 'project' })}
              >
                Proyecto
              </button>
            </div>
            <div className="swatches" role="radiogroup" aria-label="Color">
              {TONES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  role="radio"
                  aria-checked={task.tone % TONES.length === i}
                  aria-label={t.name}
                  title={t.name}
                  className={`swatch ${task.tone % TONES.length === i ? 'is-on' : ''}`}
                  style={{ background: `linear-gradient(140deg, ${t.from}, ${t.to})` }}
                  onClick={() => updateTask(task.id, { tone: i })}
                />
              ))}
            </div>
            <TimerButton task={task} large />
          </div>

          {task.kind === 'project' && (
            <section className="detail-section">
              <h3>Subtareas</h3>
              <SubtaskList task={task} variant="detail" />
            </section>
          )}

          <section className="detail-section">
            <h3>Mails vinculados</h3>
            <MailChips mails={task.mails} onRemove={(id) => removeMail(task.id, id)} />
            <MailAddForm onAdd={(m) => addMail(task.id, m)} />
          </section>

          <section className="detail-section">
            <h3>Notas</h3>
            <textarea
              className="input textarea"
              value={task.notes}
              onChange={(e) => updateTask(task.id, { notes: e.target.value })}
              placeholder="Detalles del pedido, parámetros, a quién avisar…"
              rows={4}
            />
          </section>
        </div>
      )}
    </Modal>
  );
}
