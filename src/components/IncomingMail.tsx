import { useEffect, useMemo, useState } from 'react';
import { useTasks } from '../store/tasks';
import { useUI } from '../store/ui';
import { isGenericOutlookUrl, looksLikeUrl, parseIncomingHash, splitMailInput } from '../lib/mail';
import { tone } from '../lib/tones';
import { Modal } from './Modal';
import { MailChips } from './MailLinks';
import { IconSearch } from './Icons';

/**
 * Llega un mail para vincular: desde el botón de favoritos (#vincular?url=…)
 * o pegando un link con Ctrl+V en la pantalla principal.
 */
export function useIncomingMail() {
  const setIncoming = useUI((s) => s.setIncoming);

  useEffect(() => {
    const readHash = () => {
      const mail = parseIncomingHash(window.location.hash);
      if (!mail) return;
      setIncoming(mail);
      history.replaceState(null, '', window.location.pathname + window.location.search);
      window.focus();
    };
    readHash();
    window.addEventListener('hashchange', readHash);

    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      if (document.querySelector('[role="dialog"]')) return;
      const text = e.clipboardData?.getData('text') ?? '';
      if (!looksLikeUrl(text)) return;
      e.preventDefault();
      setIncoming(splitMailInput(text));
    };
    document.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('hashchange', readHash);
      document.removeEventListener('paste', onPaste);
    };
  }, [setIncoming]);
}

export function IncomingMail() {
  const incoming = useUI((s) => s.incoming);
  const setIncoming = useUI((s) => s.setIncoming);
  const toast = useUI((s) => s.toast);
  const setFocusSubtasksOf = useUI((s) => s.setFocusSubtasksOf);
  const tasks = useTasks((s) => s.tasks);
  const addTask = useTasks((s) => s.addTask);
  const addMail = useTasks((s) => s.addMail);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!incoming) return;
    setTitle(incoming.subject);
    setSubject(incoming.subject);
    setQuery('');
  }, [incoming]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;
  }, [tasks, query]);

  const close = () => setIncoming(null);
  const mail = incoming ? { url: incoming.url, subject: subject.trim() || title.trim() } : null;

  const create = (kind: 'quick' | 'project') => {
    if (!mail) return;
    const id = addTask(kind, title.trim() || subject.trim() || 'Responder mail');
    addMail(id, mail);
    if (kind === 'project') setFocusSubtasksOf(id);
    close();
    toast(kind === 'project' ? 'Proyecto creado con el mail vinculado' : 'Tarea creada con el mail vinculado');
  };

  const attach = (taskId: string, taskTitle: string) => {
    if (!mail) return;
    addMail(taskId, mail);
    close();
    toast(`Mail vinculado a “${taskTitle}”`);
  };

  return (
    <Modal open={!!incoming} onClose={close} title="Vincular este mail">
      {incoming && (
        <div className="incoming">
          <MailChips mails={[{ id: 'preview', url: incoming.url, subject: subject || title, addedAt: 0 }]} />
          {isGenericOutlookUrl(incoming.url) && (
            <p className="hint hint--warn">
              Ojo: ese link no apunta a un mail puntual. En Outlook web hacé clic en el mail y volvé a copiar la
              dirección.
            </p>
          )}
          {incoming.url && (
            <label className="field">
              <span>Asunto del mail (para encontrarlo si el link deja de andar)</span>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto o remitente"
              />
            </label>
          )}

          <section className="incoming-section">
            <h3>Crear una tarea nueva</h3>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué hay que hacer con este mail?"
              aria-label="Nombre de la tarea"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') create('quick');
              }}
            />
            <div className="incoming-actions">
              <button type="button" className="btn btn-primary" onClick={() => create('quick')}>
                Tarea rápida
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => create('project')}>
                Proyecto
              </button>
            </div>
          </section>

          {tasks.length > 0 && (
            <section className="incoming-section">
              <h3>O sumarlo a una tarea que ya existe</h3>
              {tasks.length > 6 && (
                <label className="search">
                  <IconSearch size={16} />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tarea…" />
                </label>
              )}
              <ul className="task-pick">
                {visible.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => attach(t.id, t.title)}>
                      <span className="task-pick-dot" style={{ background: tone(t.tone).to }} />
                      <span className="task-pick-title">{t.title}</span>
                      <span className="muted small">{t.kind === 'project' ? 'Proyecto' : 'Rápida'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
