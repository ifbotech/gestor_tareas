import { describe, expect, it } from 'vitest';
import {
  buildBookmarklet,
  isGenericOutlookUrl,
  looksLikeUrl,
  mailKind,
  outlookHome,
  parseIncomingHash,
  safeUrl,
  splitMailInput,
} from './mail';

const OWA = 'https://outlook.office.com/mail/inbox/id/AAQkADAwATM0MDAAMS1hNjQ3%3D';

describe('links seguros', () => {
  it('acepta http(s) y outlook:, rechaza javascript:', () => {
    expect(safeUrl(OWA)).toBe(OWA);
    expect(safeUrl('outlook:00000000599788EA333ECD46')).toBeTruthy();
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('no es un link')).toBeUndefined();
  });

  it('looksLikeUrl', () => {
    expect(looksLikeUrl(OWA)).toBe(true);
    expect(looksLikeUrl('  ' + OWA + '  ')).toBe(true);
    expect(looksLikeUrl('Pedido de Juan')).toBe(false);
    expect(looksLikeUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('splitMailInput', () => {
  it('solo link', () => {
    expect(splitMailInput(OWA)).toEqual({ url: OWA, subject: '' });
  });
  it('asunto y link juntos', () => {
    expect(splitMailInput(`RE: Presupuesto ${OWA}`)).toEqual({ url: OWA, subject: 'RE: Presupuesto' });
  });
  it('solo asunto', () => {
    expect(splitMailInput('RE: Presupuesto Q4')).toEqual({ subject: 'RE: Presupuesto Q4' });
  });
});

describe('mailKind', () => {
  it.each([
    [OWA, 'outlook'],
    ['https://outlook.office365.com/owa/?ItemID=AAMk&exvsurl=1&viewmodel=ReadMessageItem', 'outlook'],
    ['https://outlook.cloud.microsoft/mail/inbox/id/AAQk', 'outlook'],
    ['https://outlook.live.com/mail/0/inbox/id/AQQk', 'outlook'],
    ['https://correo.empresa.com/owa/#path=/mail', 'outlook'],
    ['https://mail.google.com/mail/u/0/#inbox/abc', 'gmail'],
    ['https://example.com/x', 'web'],
    [undefined, 'ref'],
  ])('%s → %s', (url, kind) => {
    expect(mailKind({ url })).toBe(kind);
  });
});

describe('isGenericOutlookUrl', () => {
  it('detecta links que no apuntan a un mail', () => {
    expect(isGenericOutlookUrl('https://outlook.office.com/mail/')).toBe(true);
    expect(isGenericOutlookUrl('https://outlook.office.com/mail/deeplink?popoutv2=1&leanbootstrap=1')).toBe(true);
    expect(isGenericOutlookUrl(OWA)).toBe(false);
    expect(isGenericOutlookUrl('https://outlook.office.com/mail/deeplink/read/AAMk?ItemID=AAMk&exvsurl=1')).toBe(false);
    expect(isGenericOutlookUrl('https://example.com')).toBe(false);
  });
});

describe('outlookHome', () => {
  it('usa el dominio de los mails vinculados', () => {
    expect(outlookHome([])).toBe('https://outlook.office.com/mail/');
    expect(outlookHome([{ url: 'https://outlook.live.com/mail/0/inbox/id/x' }])).toBe(
      'https://outlook.live.com/mail/0/',
    );
    expect(outlookHome([{ url: 'https://outlook.cloud.microsoft/mail/inbox/id/x' }])).toBe(
      'https://outlook.cloud.microsoft/mail/',
    );
  });
});

describe('botón de favoritos', () => {
  it('arma un javascript: que abre la app con el link del mail', () => {
    const code = buildBookmarklet('https://ejemplo.github.io/gestor_tareas/#algo');
    expect(code.startsWith('javascript:')).toBe(true);
    expect(code).toContain('"https://ejemplo.github.io/gestor_tareas/"');
    expect(code).toContain('#vincular?url=');
    expect(code).not.toContain('%'); // los % rompen los bookmarklets
    // El código tiene que ser JavaScript válido.
    expect(() => new Function(code.slice('javascript:'.length))).not.toThrow();
  });

  it('parseIncomingHash lee lo que manda el botón', () => {
    const hash = `#vincular?url=${encodeURIComponent(OWA)}&asunto=${encodeURIComponent('Alta de usuario')}`;
    expect(parseIncomingHash(hash)).toEqual({ url: OWA, subject: 'Alta de usuario' });
    expect(parseIncomingHash('#otra-cosa')).toBeNull();
    expect(parseIncomingHash(`#vincular?url=${encodeURIComponent('javascript:alert(1)')}`)).toBeNull();
  });
});
