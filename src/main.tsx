import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkForUpdates } from './lib/utils.ts';

function handleSync() {
  window.addEventListener('load', async () => {
    await checkForUpdates();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

handleSync();
