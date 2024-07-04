import { sql } from 'drizzle-orm';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { Message } from './types';

export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey(),
  day: text('day').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  messages: text('messages', { mode: 'json' }).$type<Message[]>(),
});
