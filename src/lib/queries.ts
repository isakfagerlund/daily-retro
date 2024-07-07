import { InsertEntries, SelectEntries } from '@/server/src/db/types';

export const getEntries = async () => {
  const response = await fetch('http://localhost:3000/');

  return (await response.json()) as SelectEntries[];
};

export const updateEntry = async (entry: InsertEntries) => {
  return await fetch('http://localhost:3000/', {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
};

export const createEntry = async (entry: InsertEntries) => {
  return await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
};
