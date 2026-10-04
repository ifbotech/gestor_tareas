import type { Task } from '../types';
import { useTasks } from '../store/tasks';
import { useNow } from '../hooks/useNow';
import { formatClock, trackedMs } from '../lib/time';
import { IconPause, IconPlay } from './Icons';

/** Empezar / pausar la tarea. Va midiendo el tiempo para la bitácora. */
export function TimerButton({ task, large = false }: { task: Task; large?: boolean }) {
  const running = !!task.runningSince;
  const now = useNow(running);
  const startTimer = useTasks((s) => s.startTimer);
  const pauseTimer = useTasks((s) => s.pauseTimer);
  const ms = trackedMs(task, now);
  const label = running ? 'Pausar' : ms > 0 ? 'Seguir' : 'Empezar';

  return (
    <button
      type="button"
      className={`timer-btn ${running ? 'is-running' : ''} ${large ? 'timer-btn--large' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (running) pauseTimer(task.id);
        else startTimer(task.id);
      }}
      title={running ? 'Pausar el cronómetro' : 'Empezar: arranca el cronómetro'}
      aria-label={`${label}${ms > 0 ? ` (${formatClock(ms)})` : ''}`}
    >
      {running ? <IconPause size={15} /> : <IconPlay size={15} />}
      <span className="timer-text">{ms > 0 || running ? formatClock(ms) : label}</span>
      {running && <span className="timer-dot" />}
    </button>
  );
}
