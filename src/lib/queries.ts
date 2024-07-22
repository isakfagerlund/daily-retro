import { InsertEntries, SelectEntries } from '@/server/src/db/types';
import { db } from './db';

const API_ENDPOINT = 'https://daily-retro-api.fagerlund-isak.workers.dev';

export const getEntries = async () => {
  const response = await fetch(API_ENDPOINT);

  return (await response.json()) as SelectEntries[];
};

export const getEntriesLocal = async () => {
  const response = await db.entries.toArray();

  return response;
};

export const setEntriesLocal = async (entries: SelectEntries[]) => {
  return await db.entries.bulkAdd(
    entries.map((entry) => ({ ...entry, isSynced: true }))
  );
};

export const deleteEntriesLocal = async () => {
  return await db.entries.clear();
};

export const addEntryLocal = async (entry: SelectEntries) => {
  return await db.entries.add({
    ...entry,
    updatedAt: new Date().toISOString(),
    isSynced: false,
  });
};

export const updateEntryLocal = async (
  entry: SelectEntries,
  isSynced: boolean
) => {
  const newEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };

  await db.entries.update(entry.id, { ...newEntry, isSynced });

  return newEntry;
};

export const updateEntrySyncStatus = async (
  entry: SelectEntries,
  isSynced: boolean
) => {
  return await db.entries.update(entry.id, {
    ...entry,
    isSynced,
  });
};

export const updateEntry = async (entry: InsertEntries) => {
  return await fetch(API_ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ ...entry }),
  });
};

export const createEntry = async (entry: InsertEntries) => {
  return await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ ...entry }),
  });
};
