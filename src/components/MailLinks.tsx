import { useState } from 'react';
import type { MailLink } from '../types';
import { isGenericOutlookUrl, mailHost, mailKind, mailTitle, splitMailInput } from '../lib/mail';
import { useUI } from '../store/ui';
import { IconCopy, IconExternal, IconMail, IconX } from './Icons';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function MailChips({ mails, onRemove }: { mails: MailLink[]; onRemove?: (id: string) => void }) {
  const toast = useUI((s) => s.toast);
  if (!mails.length) return null;
  return (
    <ul className="mail-chips">
      {mails.map((m) => {
        const kind = mailKind(m);
        const copySubject = async () => {
          const ok = await copyText(m.subject);
          toast(ok ? 'Asunto copiado: pegalo en el buscador de Outlook (Ctrl+V)' : 'No pude copiar el asunto');
        };
        return (
          <li key={m.id} className={`mail-chip mail-chip--${kind}`}>
            <span className="mail-ico">
              <IconMail size={16} />
            </span>
            <span className="mail-text">
              <strong title={mailTitle(m)}>{mailTitle(m)}</strong>
              <small>{m.url ? (kind === 'outlook' ? `Outlook · ${mailHost(m.url)}` : mailHost(m.url)) : 'Sin link: buscalo por asunto'}</small>
            </span>
            {m.url && (
              <a className="mail-open" href={m.url} target="_blank" rel="noopener noreferrer" title="Abrir el mail">
                Abrir <IconExternal size={13} />
              </a>
            )}
            {m.subject && (
              <button type="button" className="mail-icon-btn" onClick={copySubject} title="Copiar el asunto para buscarlo en Outlook" aria-label="Copiar asunto">
                <IconCopy size={14} />
              </button>
            )}
            {onRemove && (
              <button type="button" className="mail-icon-btn" onClick={() => onRemove(m.id)} title="Desvincular" aria-label="Desvincular mail">
                <IconX size={14} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Formulario para vincular un mail: se pega el link (y/o el asunto). */
export function MailAddForm({ onAdd, autoFocus }: { onAdd(mail: { url?: string; subject: string }): void; autoFocus?: boolean }) {
  const [raw, setRaw] = useState('');
  const [subject, setSubject] = useState('');
  const setHelpOpen = useUI((s) => s.setHelpOpen);
  const parsed = splitMailInput(raw);
  const generic = isGenericOutlookUrl(parsed.url);

  const submit = () => {
    if (!raw.trim()) return;
    if (parsed.url) onAdd({ url: parsed.url, subject: subject.trim() || parsed.subject });
    else onAdd({ subject: parsed.subject });
    setRaw('');
    setSubject('');
  };

  return (
    <form
      className="mail-add"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="mail-add-row">
        <input
          className="input"
          value={raw}
          autoFocus={autoFocus}
          onChange={(e) => {
            const next = e.target.value;
            setRaw(next);
            const p = splitMailInput(next);
            if (p.url && p.subject && !subject) setSubject(p.subject);
          }}
          placeholder="Pegá el link del mail (o escribí el asunto)"
          aria-label="Link o asunto del mail"
        />
        <button type="submit" className="btn btn-primary" disabled={!raw.trim()}>
          Vincular
        </button>
      </div>
      {parsed.url && (
        <input
          className="input input--sub"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto o remitente (para encontrarlo si el link deja de andar)"
          aria-label="Asunto del mail"
        />
      )}
      {generic && (
        <p className="hint hint--warn">
          Ese link parece de la bandeja o de una ventana emergente, no de un mail puntual. Hacé clic en el mail dentro de
          Outlook web y copiá la dirección de nuevo.
        </p>
      )}
      <button type="button" className="link-btn" onClick={() => setHelpOpen(true)}>
        ¿Cómo copio el link de un mail de Outlook?
      </button>
    </form>
  );
}
