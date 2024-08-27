import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { entries } from './db/schema';
import { eq } from 'drizzle-orm';
import { InsertEntries } from './db/types';
import { createClient } from '@libsql/client';
import * as schema from './db/schema';
import { drizzle } from 'drizzle-orm/libsql';

export type Env = {
  TURSO_CONNECTION_URL: string;
  TURSO_AUTH_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

app.notFound((c) => c.text('Not Found', 404));

const getClientAndDb = (c: Context) => {
  const client = createClient({
    url: c.env.TURSO_CONNECTION_URL,
    authToken: c.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
};

app.get('/', async (c) => {
  const db = getClientAndDb(c);
  const allEntries = await db.query.entries.findMany();
  return c.json(allEntries, 200);
});

app.post('/', async (c) => {
  const db = getClientAndDb(c);
  const data: InsertEntries = await c.req.json();
  const findEntryOnDay = await db.query.entries.findFirst({
    where: eq(entries.day, data.day),
  });

  try {
    if (findEntryOnDay) {
      throw new Error('This day already exists');
    }
    await db.insert(entries).values(data);
  } catch (error) {
    return c.json({ message: (error as Error).message }, 400);
  }

  return c.json(data);
});

app.put('/', async (c) => {
  const db = getClientAndDb(c);
  const data: InsertEntries = await c.req.json();
  console.log(data);

  try {
    await db.update(entries).set(data).where(eq(entries.id, data.id!));
    return c.json({ message: 'success' }, 200);
  } catch (error) {
    return c.json({ message: (error as Error).message }, 400);
  }
});

app.onError((err, c) => {
  console.error(err);
  return c.text(err.toString(), 500);
});

export default app;
