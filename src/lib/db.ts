import { SelectEntries } from '@/server/src/db/types';
import Dexie, { type EntityTable } from 'dexie';

export type ClientEntries = EntityTable<SelectEntries, 'id'>;

export const db = new Dexie('EntriesDatabase') as Dexie & {
  entries: ClientEntries;
};

db.version(1).stores({
  entries: '++id, day, createdAt, updatedAt, messages',
});
