import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito';
import './styles.css';
import App from './App';
import { seedFirstRun } from './seed';

seedFirstRun();

// Así el botón "Mail → Mojarrita" de la barra de favoritos reutiliza esta pestaña en vez de abrir otra.
if (!window.name) window.name = 'mojarrita';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
