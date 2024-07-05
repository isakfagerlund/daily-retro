import { updateEntry, createEntry } from '@/lib/queries';
import { InsertEntries, Message, SelectEntries } from '@/server/src/db/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, getYear, subDays } from 'date-fns';
import { X, MessageCircle, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { AddMessage } from './AddMessage';

function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return `${day}th`; // catches 11th, 12th, 13th
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

// Function to format the date as "26th June"
function formatDateWithOrdinal(date: Date) {
  const day = format(date, 'd');
  const month = format(date, 'MMMM');
  const dayWithOrdinal = getOrdinalSuffix(Number(day));
  return `${dayWithOrdinal} ${month}`;
}

const today = new Date();

export const Day = ({ entries }: { entries: SelectEntries[] }) => {
  const queryClient = useQueryClient();
  const [currentDay, setCurrentDay] = useState(today);
  const update = useMutation({
    mutationFn: (entry: InsertEntries) => {
      console.log(entry);
      return updateEntry(entry);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });

  const create = useMutation({
    mutationFn: (entry: InsertEntries) => {
      return createEntry(entry);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });

  const [showNewMessage, setShowNewMessage] = useState(false);
  const todaysEntry = entries.find(
    (entry) => entry.day === format(currentDay, 'dd-MM-yyyy')
  );

  const sendMessage = (message: Message) => {
    if (!todaysEntry) {
      const newEntry: InsertEntries = {
        day: format(currentDay, 'dd-MM-yyyy'),
        messages: [message],
      };

      create.mutate(newEntry);
      return;
    }

    const newEntry: InsertEntries = {
      id: todaysEntry.id,
      day: todaysEntry.day,
      createdAt: todaysEntry.createdAt,
      updatedAt: todaysEntry.updatedAt,
      messages: todaysEntry?.messages
        ? [...todaysEntry.messages, message]
        : [message],
    };

    update.mutate(newEntry);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="text-blue-100">
        <p>{getYear(currentDay)}</p>
        <h1 className="text-3xl font-bold">
          {formatDateWithOrdinal(currentDay)}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {todaysEntry ? (
          todaysEntry.messages?.map((message) => (
            <span
              className="p-4 bg-blue-50 text-blue-800 font-bold rounded-xl"
              key={message.content}
            >
              {message.content}
            </span>
          ))
        ) : (
          <p>No entry yet</p>
        )}
      </div>

      {showNewMessage && (
        <AddMessage
          sendMessage={sendMessage}
          closeMessage={setShowNewMessage}
        />
      )}
      <div className="absolute bottom-8 right-8 flex items-center gap-2">
        {format(currentDay, 'dd-MM-yyyy') !== format(today, 'dd-MM-yyyy') && (
          <Button onClick={() => setCurrentDay(today)}>Today</Button>
        )}
        <Button
          size="icon"
          onClick={() => setCurrentDay(subDays(currentDay, 1))}
        >
          <ChevronLeft />
        </Button>
        <Button
          onClick={() => setShowNewMessage(!showNewMessage)}
          size="icon"
          className="self-end"
        >
          {showNewMessage ? <X /> : <MessageCircle />}
        </Button>
      </div>
    </div>
  );
};
