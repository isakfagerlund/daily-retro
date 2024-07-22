import app from '../src/server/src/index.ts';
import { handle } from 'hono/vercel';

export const config = {
  runtime: 'edge',
};

export default handle(app);
