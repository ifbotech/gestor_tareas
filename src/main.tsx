import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito';
import './styles.css';
import App from './App';
// Así el botón "Mail → Mis tareas" de la barra de favoritos reutiliza esta pestaña en vez de abrir otra.
if (!window.name) window.name = 'mis-tareas';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
