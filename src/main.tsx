import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkForUpdates } from './lib/utils.ts';

import { QueryClient } from '@tanstack/query-core';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

function handleSync() {
  window.addEventListener('DOMContentLoaded', async () => {
    await checkForUpdates();
  });
}

handleSync();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App queryClient={queryClient} />
  </React.StrictMode>
);
