import { checkForUpdates } from '@/service-worker/sw';
import { UPDATE_CHECK } from './constants';

interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    readonly periodicSync: PeriodicSyncManager;
    readonly sync: PeriodicSyncManager;
  }
}

// every 10 min
const MIN_INTERVAL = 10 * 60 * 1000;

export function initSW() {
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      void navigator.serviceWorker.register('/sw.js');

      void navigator.serviceWorker.ready.then(async (registration) => {
        if ('sync' in registration) {
          await registration.sync.register(UPDATE_CHECK);
        }

        if ('periodicSync' in registration) {
          const status = await navigator.permissions.query({
            // @ts-expect-error periodicsync is not included in the default SW interface.
            name: 'periodic-background-sync',
          });

          if (status.state === 'granted') {
            await registration.periodicSync.register(UPDATE_CHECK, {
              minInterval: MIN_INTERVAL,
            });
          }
        }
      });
    } else {
      checkForUpdates();
    }
  });
}
