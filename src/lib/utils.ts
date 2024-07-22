import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  createEntry,
  deleteEntriesLocal,
  getEntries,
  setEntriesLocal,
} from './queries';
import { db } from './db';

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
