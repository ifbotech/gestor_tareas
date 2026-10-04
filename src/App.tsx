import { useEffect } from 'react';
import { syncAcrossTabs } from './store/tasks';
import { Ocean } from './components/Ocean';
import { Header } from './components/Header';
import { Pond } from './components/Ponds';
import { Bucket } from './components/Bucket';
import { FishOverlay } from './components/FishOverlay';
import { CatchCard } from './components/CatchCard';
import { TaskDetail } from './components/TaskDetail';
import { LogPanel } from './components/LogPanel';
import { HelpOutlook } from './components/HelpOutlook';
import { IncomingMail, useIncomingMail } from './components/IncomingMail';
import { Toasts } from './components/Toasts';

export default function App() {
  useEffect(() => syncAcrossTabs(), []);
  useIncomingMail();

  return (
    <>
      <Ocean />
      <div className="app">
        <Header />
        <main className="ponds">
          <Pond kind="quick" />
          <Pond kind="project" />
        </main>
        <p className="footer-tip">
          Tip: agarrá una tarea y arrastrala al balde cuando la termines. Pegá (Ctrl+V) un link de Outlook para crear
          una tarea con ese mail.
        </p>
      </div>
      <Bucket />
      <CatchCard />
      <FishOverlay />
      <TaskDetail />
      <LogPanel />
      <HelpOutlook />
      <IncomingMail />
      <Toasts />
    </>
  );
}
