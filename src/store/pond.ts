import { create } from 'zustand';
import type { Task } from '../types';
import { useTasks } from './tasks';
import { useUI } from './ui';

/**
 * Estado del "estanque": qué tarea está nadando (convertida en mojarrita)
 * y si está encima del balde. Lo lee el balde y las tarjetas.
 */
export type PondPhase = 'idle' | 'dragging' | 'flying' | 'catching' | 'returning';

export const usePond = create<{
  draggingId: string | null;
  phase: PondPhase;
  bucketHot: boolean;
  splashKey: number;
}>()(() => ({ draggingId: null, phase: 'idle', bucketHot: false, splashKey: 0 }));

let bucketEl: HTMLElement | null = null;

export function registerBucket(el: HTMLElement | null) {
  bucketEl = el;
}

/** Boca del balde (donde cae el pez), en coordenadas de pantalla. */
export function bucketMouth(): { x: number; y: number } | null {
  if (!bucketEl) return null;
  const r = bucketEl.getBoundingClientRect();
  if (!r.width) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.36 };
}

export function bucketRect(): DOMRect | null {
  return bucketEl?.getBoundingClientRect() ?? null;
}

export function isOverBucket(x: number, y: number): boolean {
  if (!bucketEl) return false;
  const r = bucketEl.getBoundingClientRect();
  const pad = 30;
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

interface PondController {
  startDrag(task: Task, el: HTMLElement, x: number, y: number): void;
  flyToBucket(task: Task, el: HTMLElement): void;
}

let controller: PondController | null = null;

export function registerPondController(c: PondController | null) {
  controller = c;
}

export function startFishDrag(task: Task, el: HTMLElement, x: number, y: number) {
  controller?.startDrag(task, el, x, y);
}

/** Botón "terminar": la tarea salta sola al balde (si hay otra en el aire, espera su turno). */
export function sendToBucket(task: Task, el: HTMLElement | null) {
  if (controller && el) {
    controller.flyToBucket(task, el);
    return;
  }
  const entryId = useTasks.getState().completeTask(task.id);
  if (entryId) useUI.getState().showCatch(entryId);
}
