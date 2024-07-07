import { entries } from './schema';

export type Message = {
  id: string;
  createdAt: string;
  content: string;
};

export type SelectEntries = typeof entries.$inferSelect;
export type InsertEntries = typeof entries.$inferInsert;
