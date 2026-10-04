import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onSave(value: string): void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  /** Texto que se muestra cuando está vacío. */
  emptyLabel?: string;
  ariaLabel?: string;
}

/** Texto que se edita con un clic. Enter guarda, Escape cancela. */
export function EditableText({ value, onSave, className = '', placeholder, multiline, emptyLabel, ariaLabel }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value.trim()) onSave(draft.trim());
  };

  if (!editing) {
    return (
      <button
        type="button"
        className={`editable ${value ? '' : 'is-empty'} ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        aria-label={ariaLabel ? `Editar: ${ariaLabel}` : undefined}
      >
        {value || emptyLabel || placeholder}
      </button>
    );
  }

  const common = {
    ref,
    value: draft,
    placeholder,
    className: `editable-input ${className}`,
    'aria-label': ariaLabel,
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: commit,
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setDraft(value);
        setEditing(false);
      } else if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      }
    },
  };
  return multiline ? <textarea rows={3} {...common} /> : <input {...common} />;
}
