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

  // Check days
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
