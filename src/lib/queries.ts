import { InsertEntries, SelectEntries } from '@/server/src/db/types';
import { db } from './db';

export const getEntries = async () => {
  const response = await fetch('/api');

  return (await response.json()) as SelectEntries[];
};

export const getEntriesLocal = async () => {
  const response = await db.entries.toArray();

  return response;
};

export const setEntriesLocal = async (entries: SelectEntries[]) => {
  return await db.entries.bulkAdd(entries);
};

export const deleteEntriesLocal = async () => {
  return await db.entries.clear();
};

export const addEntryLocal = async (entry: SelectEntries) => {
  return await db.entries.add(entry);
};

export const updateEntryLocal = async (entry: SelectEntries) => {
  return await db.entries.update(entry.id, entry);
};

export const updateEntry = async (entry: InsertEntries) => {
  return await fetch('/api', {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
};

export const createEntry = async (entry: InsertEntries) => {
  return await fetch('/api', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
};
