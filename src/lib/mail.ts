import type { MailLink } from '../types';

const SAFE_SCHEMES = ['http:', 'https:', 'outlook:', 'ms-outlook:', 'mailto:'];
const URL_IN_TEXT = /((?:https?|outlook|ms-outlook):\/{0,2}\S+)/i;

/** Devuelve el link solo si es de un esquema seguro (nunca `javascript:`). */
export function safeUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw.trim());
    return SAFE_SCHEMES.includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}

export function looksLikeUrl(s: string): boolean {
  return URL_IN_TEXT.test(s.trim()) && !!safeUrl(s.trim().match(URL_IN_TEXT)?.[1]);
}

/** Separa lo que se pegó en "link" y "asunto" (se puede pegar el asunto y el link juntos). */
export function splitMailInput(raw: string): { url?: string; subject: string } {
  const text = raw.trim();
  const m = text.match(URL_IN_TEXT);
  if (!m) return { subject: text };
  const url = safeUrl(m[1]);
  if (!url) return { subject: text };
  const subject = text.replace(m[1], '').replace(/\s+/g, ' ').trim();
  return { url, subject };
}

export type MailKind = 'outlook' | 'gmail' | 'web' | 'ref';

export function mailKind(m: Pick<MailLink, 'url'>): MailKind {
  if (!m.url) return 'ref';
  const u = m.url.toLowerCase();
  if (
    u.startsWith('outlook:') ||
    u.startsWith('ms-outlook:') ||
    /^https?:\/\/[^/]*outlook\.(office|office365|live|cloud\.microsoft)\b/.test(u) ||
    /\/owa\//.test(u)
  )
    return 'outlook';
  if (u.includes('mail.google.com')) return 'gmail';
  return 'web';
}

export function mailHost(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

export function mailTitle(m: MailLink): string {
  if (m.subject) return m.subject;
  const kind = mailKind(m);
  if (kind === 'outlook') return 'Mail de Outlook';
  if (kind === 'gmail') return 'Mail de Gmail';
  return mailHost(m.url) || 'Mail';
}

/**
 * Botón para la barra de favoritos: estando en Outlook web con un mail abierto,
 * abre Mis tareas con el link (y el asunto, si lo encuentra) listo para crear o vincular una tarea.
 */
export function buildBookmarklet(appUrl: string): string {
  const app = JSON.stringify(appUrl.split('#')[0]);
  const code =
    `(function(){` +
    `var q=function(s){var e=document.querySelector(s);return e?(e.textContent||'').trim():''};` +
    `var s=String(window.getSelection?getSelection():'').trim()` +
    `||q('[role=main] [role=heading][aria-level="2"]')` +
    `||q('#ReadingPaneContainerId [role=heading]')` +
    `||q('[role=main] [role=heading]');` +
    `window.open(${app}+'#vincular?url='+encodeURIComponent(location.href)+'&asunto='+encodeURIComponent(s.slice(0,200)),'mis-tareas');` +
    `})();`;
  return `javascript:${code}`;
}

export interface IncomingMail {
  url?: string;
  subject: string;
}

/** Lee `#vincular?url=…&asunto=…` (lo que manda el botón de favoritos). */
export function parseIncomingHash(hash: string): IncomingMail | null {
  const m = hash.match(/^#\/?vincular\?(.*)$/);
  if (!m) return null;
  const params = new URLSearchParams(m[1]);
  const url = safeUrl(params.get('url') ?? undefined);
  const subject = (params.get('asunto') ?? '').trim();
  if (!url && !subject) return null;
  return { url, subject };
}

/** Links de Outlook que no apuntan a un mail puntual (p.ej. la ventana emergente genérica o la bandeja). */
export function isGenericOutlookUrl(url?: string): boolean {
  if (!url || mailKind({ url }) !== 'outlook' || url.startsWith('outlook:')) return false;
  return !/\/id\/|itemid=|deeplink\/read/i.test(url);
}

/** Dónde abrir Outlook web para buscar un asunto (no existe un link de búsqueda oficial). */
export function outlookHome(mails: Pick<MailLink, 'url'>[] = []): string {
  for (const m of mails) {
    if (!m.url || mailKind(m) !== 'outlook' || !/^https?:/.test(m.url)) continue;
    try {
      const u = new URL(m.url);
      return u.host.includes('live.com') ? `${u.origin}/mail/0/` : `${u.origin}/mail/`;
    } catch {
      /* sigue */
    }
  }
  return 'https://outlook.office.com/mail/';
}
