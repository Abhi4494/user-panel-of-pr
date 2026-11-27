import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import { App } from './App';
import { initTheme } from '@/features/theme/themeStore';
import './styles/index.css';

initTheme();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');
const root = createRoot(rootElement);

/**
 * Render after the two UI fonts are ready (capped) so text never swaps fonts mid-view — the cause of the
 * "jerking" heading/panel text. Later navigation is client-side, so fonts load once per visit.
 */
const FONT_WAIT_MS = 1500;
const fontsReady = Promise.all([
  document.fonts.load('1rem "Inter Variable"', 'Aa'),
  document.fonts.load('600 1rem "Lora Variable"', 'Aa'),
]);
const timeout = new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS));

void Promise.race([fontsReady, timeout])
  .catch(() => undefined)
  .then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
