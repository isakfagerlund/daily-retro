import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import { entries } from './db/schema';
import { eq } from 'drizzle-orm';
import { InsertEntries } from './db/types';

const app = new Hono();

app.use('/*', cors());

app.notFound((c) => {
  return c.text('Not Found', 404);
});

app.get('/', async (c) => {
  const allEntries = await db.query.entries.findMany();

  return c.json(allEntries, 200);
});

app.post('/', async (c) => {
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
    // @ts-expect-error disable
    return c.json({ message: error?.message }, 400);
  }

  return c.json(data);
});

app.put('/', async (c) => {
  const data: InsertEntries = await c.req.json();
  console.log(data);

  try {
    await db.update(entries).set(data).where(eq(entries.id, data.id!));
    return c.json({ message: 'success' }, 200);
  } catch (error) {
    // @ts-expect-error disable
    return c.json({ message: error?.message }, 400);
  }
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(`${err}`, 500);
});

export default app;
