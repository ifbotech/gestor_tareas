import { STORAGE_KEY, useTasks } from './store/tasks';

/** La primera vez que se abre, dejamos un par de tareas de ejemplo que explican cómo se usa. */
export function seedFirstRun() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch {
    return;
  }
  const s = useTasks.getState();
  const project = s.addTask('project', 'Mi primer proyecto');
  s.addSubtask(project, 'Tildá esta subtarea');
  s.addSubtask(project, 'Agregá otra subtarea acá abajo');
  s.addSubtask(project, 'Cuando esté todo, tirá el proyecto al balde');
  s.addTask('quick', 'Tocá ▶ para empezar y medir el tiempo');
  s.addTask('quick', 'Arrastrame al balde gris cuando termines 🐟');
}
