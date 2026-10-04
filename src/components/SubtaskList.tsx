import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Task } from '../types';
import { useTasks } from '../store/tasks';
import { useUI } from '../store/ui';
import { EditableText } from './EditableText';
import { IconCheck, IconPlus, IconX } from './Icons';

/** Subtareas de un proyecto: se tildan, se renombran con un clic y se agregan con Enter. */
export function SubtaskList({ task, variant = 'card' }: { task: Task; variant?: 'card' | 'detail' }) {
  const toggle = useTasks((s) => s.toggleSubtask);
  const rename = useTasks((s) => s.renameSubtask);
  const remove = useTasks((s) => s.deleteSubtask);
  const add = useTasks((s) => s.addSubtask);
  const focusOf = useUI((s) => s.focusSubtasksOf);
  const setFocusOf = useUI((s) => s.setFocusSubtasksOf);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOf === task.id && variant === 'card') {
      inputRef.current?.focus();
      setFocusOf(null);
    }
  }, [focusOf, task.id, variant, setFocusOf]);

  const submit = () => {
    if (!draft.trim()) return;
    add(task.id, draft);
    setDraft('');
  };

  return (
    <div className={`subtasks subtasks--${variant}`} data-nodrag onClick={(e) => e.stopPropagation()}>
      <ul>
        <AnimatePresence initial={false}>
          {task.subtasks.map((st) => (
            <motion.li
              key={st.id}
              layout="position"
              className={`subtask ${st.done ? 'is-done' : ''}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button
                type="button"
                className={`check ${st.done ? 'is-on' : ''}`}
                onClick={() => toggle(task.id, st.id)}
                role="checkbox"
                aria-checked={st.done}
                aria-label={st.title}
              >
                <motion.span
                  initial={false}
                  animate={{ scale: st.done ? 1 : 0, opacity: st.done ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                >
                  <IconCheck size={13} />
                </motion.span>
              </button>
              <EditableText
                value={st.title}
                onSave={(v) => (v ? rename(task.id, st.id, v) : remove(task.id, st.id))}
                className="subtask-title"
                ariaLabel={st.title}
              />
              <button
                type="button"
                className="subtask-x"
                onClick={() => remove(task.id, st.id)}
                aria-label={`Borrar subtarea ${st.title}`}
                title="Borrar subtarea"
              >
                <IconX size={13} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <form
        className="subtask-add"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <IconPlus size={14} />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Agregar subtarea…"
          aria-label="Agregar subtarea"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft('');
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </form>
    </div>
  );
}
