import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkForUpdates } from './lib/utils.ts';

import { QueryClient } from '@tanstack/query-core';
export const queryClient = new QueryClient();

function handleSync() {
  window.addEventListener('DOMContentLoaded', async () => {
    if (navigator.onLine) {
      await checkForUpdates();
    }
  });

  window.addEventListener('online', async () => {
    console.log('went online');
    await checkForUpdates();
  });

  window.addEventListener('focus', async () => {
    console.log('Tab is focused again');
    await checkForUpdates();
  });
}

handleSync();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App queryClient={queryClient} />
  </React.StrictMode>
);
