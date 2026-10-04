import { motion } from 'motion/react';
import type { Task } from '../types';
import { useFishDrag } from '../hooks/useFishDrag';
import { sendToBucket, usePond } from '../store/pond';
import { useTasks } from '../store/tasks';
import { useUI } from '../store/ui';
import { toneStyle } from '../lib/tones';
import { mailTitle } from '../lib/mail';
import { TimerButton } from './TimerButton';
import { SubtaskList } from './SubtaskList';
import { IconCheck, IconChevron, IconGrip, IconMail, IconNote } from './Icons';

const cardMotion = (swimming: boolean) => ({
  layout: true,
  initial: { opacity: 0, y: -10, scale: 0.97 },
  // Mientras la tarea nada como mojarrita, la tarjeta queda como un hueco translúcido.
  animate: { opacity: swimming ? 0.32 : 1, y: 0, scale: swimming ? 0.97 : 1 },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
  transition: { type: 'spring' as const, stiffness: 420, damping: 34 },
});

function MailBadge({ task }: { task: Task }) {
  const openTask = useUI((s) => s.openTask);
  if (!task.mails.length) return null;
  const first = task.mails[0];
  const title = task.mails.length === 1 ? `Mail: ${mailTitle(first)}` : `${task.mails.length} mails vinculados`;
  if (task.mails.length === 1 && first.url) {
    return (
      <a
        className="card-badge"
        href={first.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`${title} (abrir)`}
        onClick={(e) => e.stopPropagation()}
      >
        <IconMail size={15} />
      </a>
    );
  }
  return (
    <button
      type="button"
      className="card-badge"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        openTask(task.id);
      }}
    >
      <IconMail size={15} />
      {task.mails.length > 1 && <span>{task.mails.length}</span>}
    </button>
  );
}

function DoneButton({ task, cardRef }: { task: Task; cardRef: React.RefObject<HTMLElement | null> }) {
  return (
    <button
      type="button"
      className="done-btn"
      onClick={(e) => {
        e.stopPropagation();
        sendToBucket(task, cardRef.current);
      }}
      title="¡Terminada! Mandarla al balde"
      aria-label={`Terminar "${task.title}" y mandarla al balde`}
    >
      <IconCheck size={18} />
    </button>
  );
}

function useCardProps(task: Task) {
  const drag = useFishDrag<HTMLElement>(task);
  const swimming = usePond((s) => s.draggingId === task.id);
  const openTask = useUI((s) => s.openTask);
  return {
    drag,
    swimming,
    props: {
      ref: drag.ref,
      'data-task-id': task.id,
      style: toneStyle(task.tone),
      onPointerDown: drag.onPointerDown,
      onClickCapture: drag.onClickCapture,
      onContextMenu: drag.onContextMenu,
      onClick: () => openTask(task.id),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) openTask(task.id);
      },
      tabIndex: 0,
    },
  };
}

export function QuickCard({ task }: { task: Task }) {
  const { drag, swimming, props } = useCardProps(task);
  return (
    <motion.article
      {...cardMotion(swimming)}
      {...props}
      className={`card card--quick ${swimming ? 'is-swimming' : ''} ${task.runningSince ? 'is-running' : ''}`}
      aria-label={`Tarea: ${task.title}`}
    >
      <div className="card-head">
        <span className="grip" title="Arrastrala al balde cuando la termines">
          <IconGrip size={16} />
        </span>
        <h3 className="card-title">{task.title}</h3>
      </div>
      <div className="card-actions">
        <TimerButton task={task} />
        <MailBadge task={task} />
        {task.notes && (
          <span className="card-badge card-badge--static" title={task.notes}>
            <IconNote size={15} />
          </span>
        )}
        <span className="spacer" />
        <DoneButton task={task} cardRef={drag.ref} />
      </div>
    </motion.article>
  );
}

export function ProjectCard({ task }: { task: Task }) {
  const { drag, swimming, props } = useCardProps(task);
  const updateTask = useTasks((s) => s.updateTask);
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <motion.article
      {...cardMotion(swimming)}
      {...props}
      className={`card card--project ${swimming ? 'is-swimming' : ''} ${task.runningSince ? 'is-running' : ''} ${allDone ? 'is-complete' : ''}`}
      aria-label={`Proyecto: ${task.title}`}
    >
      <div className="card-head">
        <span className="grip" title="Arrastralo al balde cuando lo termines">
          <IconGrip size={16} />
        </span>
        <h3 className="card-title">{task.title}</h3>
        <span className="progress-count">
          {done}/{total}
        </span>
        <button
          type="button"
          className={`collapse-btn ${task.collapsed ? 'is-collapsed' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            updateTask(task.id, { collapsed: !task.collapsed });
          }}
          aria-expanded={!task.collapsed}
          aria-label={task.collapsed ? 'Mostrar subtareas' : 'Ocultar subtareas'}
          title={task.collapsed ? 'Mostrar subtareas' : 'Ocultar subtareas'}
        >
          <IconChevron size={16} />
        </button>
      </div>
      <div className="progress" aria-hidden="true">
        <motion.div className="progress-fill" initial={false} animate={{ width: `${pct}%` }} />
      </div>

      {!task.collapsed && <SubtaskList task={task} />}

      {allDone && <p className="complete-hint">¡Todo tildado! Ya podés tirarlo al balde 🪣</p>}

      <div className="card-actions">
        <TimerButton task={task} />
        <MailBadge task={task} />
        {task.notes && (
          <span className="card-badge card-badge--static" title={task.notes}>
            <IconNote size={15} />
          </span>
        )}
        <span className="spacer" />
        <DoneButton task={task} cardRef={drag.ref} />
      </div>
    </motion.article>
  );
}
