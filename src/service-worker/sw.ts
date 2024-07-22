import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
// import { ExpirationPlugin } from 'workbox-expiration';
import {
  createEntry,
  deleteEntriesLocal,
  getEntries,
  setEntriesLocal,
} from '@/lib/queries';
import { UPDATE_CHECK } from '@/lib/constants';
import { db } from '@/lib/db';

// @ts-expect-error dunno
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  createHandlerBoundToURL('/index.html')
);

self.addEventListener('install', () => void self.skipWaiting());
self.addEventListener('activate', () => void self.clients.claim());

export async function checkForUpdates() {
  const entries = await getEntries();
  const entriesFromClient = await db.entries.toArray();

  if (entries.length > entriesFromClient.length) {
    // Delete all before setting the new entries
    await deleteEntriesLocal();

    // if there is new update from server add to client db
    await setEntriesLocal(entries);
  } else if (entries.length < entriesFromClient.length) {
    // Local db is more up to date
    const entriesToAdd = entriesFromClient.filter(
      (entry) => !entries.some((dbEntry) => dbEntry.id === entry.id)
    );

    console.log('Entries to add', entriesToAdd);
    for (const entry of entriesToAdd) {
      try {
        await createEntry(entry);
      } catch (error) {
        console.error(error);
      }
    }
  } else {
    console.log('do nothing');
  }
}

// @ts-expect-error sync is here
self.addEventListener('sync', (event: { tag: string }) => {
  if (event.tag === UPDATE_CHECK) {
    checkForUpdates();
  }
});

// @ts-expect-error periodicsync is not included in the default SW interface.
self.addEventListener('periodicsync', (event: PeriodicBackgroundSyncEvent) => {
  console.log(event);

  if (event.tag === UPDATE_CHECK) {
    event.waitUntil(checkForUpdates());
  }
});
