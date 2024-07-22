import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  deleteEntriesLocal,
  getEntries,
  setEntriesLocal,
  updateEntry,
  updateEntrySyncStatus,
} from './queries';
import { db } from './db';
import { queryClient } from '@/main';
import { compareDesc } from 'date-fns';
import { SelectEntries } from '@/server/src/db/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export async function checkForUpdates() {
  const entries = await getEntries();
  const entriesFromClient = await db.entries.toArray();

  const latestChangeDb = entries.toSorted((a, b) =>
    compareDesc(new Date(a.updatedAt), new Date(b.updatedAt))
  );

  const latestClientWithoutSyncProperty = entriesFromClient.toSorted((a, b) =>
    compareDesc(new Date(a.updatedAt), new Date(b.updatedAt))
  );

  const latestChangeClient: SelectEntries = {
    id: latestClientWithoutSyncProperty?.[0]?.id,
    day: latestClientWithoutSyncProperty?.[0]?.day,
    createdAt: latestClientWithoutSyncProperty?.[0]?.createdAt,
    updatedAt: latestClientWithoutSyncProperty?.[0]?.updatedAt,
    messages: latestClientWithoutSyncProperty?.[0]?.messages,
  };

  const dates = [
    { type: 'db', date: latestChangeDb?.[0]?.updatedAt },
    { type: 'client', date: latestChangeClient?.updatedAt },
  ].toSorted((a, b) => compareDesc(a.date, b.date));

  if (
    JSON.stringify(latestChangeDb[0]) === JSON.stringify(latestChangeClient)
  ) {
    console.log('client and DB is the same, do nothing');
  } else if (dates[0].type === 'db') {
    console.log('db is most recent');
    await deleteEntriesLocal();
    await setEntriesLocal(entries);
  } else {
    console.log('client is most recent');
    const unsyncedEntries = entriesFromClient.filter(
      (entry) => !entry.isSynced
    );

    for (const entry of unsyncedEntries) {
      // Add to database
      await updateEntry(entry);

      // Set local version to synced
      await updateEntrySyncStatus(entry, true);
    }
  }

  queryClient.invalidateQueries({ queryKey: ['entries'] });
}
