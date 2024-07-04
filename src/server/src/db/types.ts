import { entries } from './schema';

export type Message = {
  createdAt: string;
  content: string;
};

export type SelectEntries = typeof entries.$inferSelect;
export type InsertEntries = typeof entries.$inferInsert;
