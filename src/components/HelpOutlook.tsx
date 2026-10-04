import { useEffect, useRef } from 'react';
import { useUI } from '../store/ui';
import { buildBookmarklet } from '../lib/mail';
import { Modal } from './Modal';
import { copyText } from './MailLinks';
import { IconCopy } from './Icons';

/** Cómo vincular un mail de Outlook a una tarea. */
export function HelpOutlook() {
  const open = useUI((s) => s.helpOpen);
  const setOpen = useUI((s) => s.setHelpOpen);
  const toast = useUI((s) => s.toast);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const code = buildBookmarklet(window.location.href);

  // React no deja poner `javascript:` en un href, así que lo seteamos a mano.
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => linkRef.current?.setAttribute('href', code), 0);
      return () => window.clearTimeout(t);
    }
  }, [open, code]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} size="lg" title="Vincular mails de Outlook">
      <div className="help">
        <p className="help-lead">
          Cada tarea puede tener uno o más mails vinculados. Se guarda el <strong>link</strong> (para abrir el mail con un
          clic) y el <strong>asunto</strong> (para encontrarlo aunque el link deje de andar).
        </p>

        <ol className="help-steps">
          <li>
            <h3>
              <span className="step-n">1</span> Outlook en el navegador <span className="tag">recomendado</span>
            </h3>
            <ol>
              <li>
                Abrí Outlook web (<code>outlook.office.com</code> o <code>outlook.cloud.microsoft</code>) y hacé clic en el
                mail o la conversación.
              </li>
              <li>
                Copiá la dirección de la barra del navegador (<kbd>Ctrl</kbd>+<kbd>L</kbd> y <kbd>Ctrl</kbd>+<kbd>C</kbd>).
                Se ve algo así: <code>outlook.office.com/mail/inbox/id/AAQk…</code>
              </li>
              <li>
                En Mojarrita pegalo con <kbd>Ctrl</kbd>+<kbd>V</kbd> en cualquier parte de la pantalla: te pregunta si querés
                crear una tarea nueva o sumarlo a una que ya tenés. También podés pegarlo en el detalle de la tarea, en
                “Mails vinculados”.
              </li>
            </ol>
          </li>

          <li>
            <h3>
              <span className="step-n">2</span> Botón de un clic para la barra de favoritos
            </h3>
            <p>
              Arrastrá este botón a la barra de favoritos. Con un mail abierto en Outlook web, tocalo y se abre Mojarrita
              con ese mail listo para vincular. Si antes seleccionás el asunto con el mouse, lo usa como nombre de la tarea.
            </p>
            <div className="bookmarklet-row">
              <a
                ref={linkRef}
                className="bookmarklet"
                onClick={(e) => {
                  e.preventDefault();
                  toast('Arrastralo a la barra de favoritos (no hace falta hacerle clic acá)');
                }}
                draggable
              >
                🐟 Mail → Mojarrita
              </a>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={async () => toast((await copyText(code)) ? 'Código copiado' : 'No pude copiar el código')}
              >
                <IconCopy size={14} /> Copiar código
              </button>
            </div>
            <p className="muted small">
              ¿No se deja arrastrar? Creá un favorito nuevo (<kbd>Ctrl</kbd>+<kbd>D</kbd>), ponele de nombre “Mail →
              Mojarrita” y en la dirección pegá el código copiado. Si no ves la barra: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+
              <kbd>B</kbd>.
            </p>
          </li>

          <li>
            <h3>
              <span className="step-n">3</span> Si usás Outlook de escritorio
            </h3>
            <p>
              Ni el Outlook nuevo ni el clásico tienen un “copiar link del mail”. Tenés dos caminos:
            </p>
            <ul>
              <li>
                Abrí el mismo mail en Outlook web (misma cuenta) y seguí el paso 1. El link se abre en el navegador.
              </li>
              <li>
                O guardá solo el <strong>asunto</strong> (y quién lo mandó): escribilo en lugar del link. Con el botón
                <IconCopy size={13} /> lo copiás y lo pegás en el buscador de Outlook (<kbd>Ctrl</kbd>+<kbd>E</kbd> en el
                clásico).
              </li>
            </ul>
          </li>
        </ol>

        <div className="help-note">
          <h3>Bueno saber</h3>
          <ul>
            <li>
              El link funciona con <strong>tu</strong> cuenta: si se lo pasás a otra persona, no va a ver tu mail.
            </li>
            <li>
              Si movés el mail a otra carpeta o lo archivás, el link puede dejar de andar. Por eso conviene guardar también
              el asunto.
            </li>
            <li>Si tenés activada la vista de conversación, el link suele abrir el hilo completo.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
