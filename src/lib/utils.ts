import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  createEntry,
  deleteEntriesLocal,
  getEntries,
  setEntriesLocal,
  updateEntry,
} from './queries';
import { db } from './db';
import { queryClient } from '@/main';
import { compareDesc } from 'date-fns';

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

  const latestChangeClient = entriesFromClient.toSorted((a, b) =>
    compareDesc(new Date(a.updatedAt), new Date(b.updatedAt))
  );

  const dates = [
    { type: 'db', date: latestChangeDb[0].updatedAt },
    { type: 'client', date: latestChangeClient[0].updatedAt },
  ].toSorted((a, b) => compareDesc(a.date, b.date));

  if (dates[0].type === 'db') {
    console.log('db is most recent');
    // Check days
    // Delete all before setting the new entries
    await deleteEntriesLocal();

    // if there is new update from server add to client db
    await setEntriesLocal(entries);
  } else {
    console.log('client is most recent');
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

    // Check entries on days
    for (const entry of entries) {
      const clientCopy = entriesFromClient.find((e) => e.id === entry.id);

      if (
        JSON.stringify(entry.messages) !== JSON.stringify(clientCopy?.messages)
      ) {
        // Update entry
        console.log(
          'updating from local db',
          entry.messages,
          clientCopy?.messages
        );
        if (clientCopy) {
          await updateEntry(clientCopy);
        }
      } else {
        console.log('did nothing here');
      }
    }
  }

  queryClient.invalidateQueries({ queryKey: ['entries'] });
}
