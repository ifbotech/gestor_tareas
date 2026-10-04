import { useRef } from 'react';
import type { Task } from '../types';
import { startFishDrag, usePond } from '../store/pond';

const INTERACTIVE = 'button, input, textarea, select, a, label, [contenteditable="true"], [data-nodrag]';

/**
 * Agarrar una tarjeta y arrastrarla. Con mouse arranca al moverla unos píxeles;
 * en pantallas táctiles hay que mantenerla apretada un instante (así no se roba el scroll).
 */
export function useFishDrag<T extends HTMLElement>(task: Task) {
  const ref = useRef<T>(null);
  const suppressClick = useRef(false);

  const onPointerDown = (e: React.PointerEvent<T>) => {
    suppressClick.current = false;
    if (e.button !== 0 || !e.isPrimary) return;
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    if (usePond.getState().phase !== 'idle') return;
    const el = ref.current;
    if (!el) return;

    const isTouch = e.pointerType !== 'mouse';
    const sx = e.clientX;
    const sy = e.clientY;
    let x = sx;
    let y = sy;
    let timer: number | undefined;

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
      window.clearTimeout(timer);
      el.classList.remove('is-pressing');
    };
    const begin = () => {
      cleanup();
      suppressClick.current = true;
      startFishDrag(task, el, x, y);
    };
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      x = ev.clientX;
      y = ev.clientY;
      const d = Math.hypot(x - sx, y - sy);
      if (isTouch) {
        if (d > 10) cleanup(); // está scrolleando
      } else if (d > 6) {
        begin();
      }
    };

    if (isTouch) {
      el.classList.add('is-pressing');
      timer = window.setTimeout(() => {
        navigator.vibrate?.(12);
        begin();
      }, 280);
    } else {
      e.preventDefault(); // que no seleccione texto
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', cleanup);
    window.addEventListener('pointercancel', cleanup);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // En celulares, que la pulsación larga no abra el menú del navegador.
  const onContextMenu = (e: React.MouseEvent) => {
    if (ref.current?.classList.contains('is-pressing') || usePond.getState().phase !== 'idle') e.preventDefault();
  };

  return { ref, onPointerDown, onClickCapture, onContextMenu };
}
