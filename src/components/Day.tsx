import { updateEntry, createEntry } from '@/lib/queries';
import { InsertEntries, Message, SelectEntries } from '@/server/src/db/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, getYear, subDays } from 'date-fns';
import { X, MessageCircle, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { AddMessage } from './AddMessage';
import { getOrdinalSuffix } from '@/lib/utils';
import { Entry } from './Entry';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';

// Function to format the date as "26th June"
function formatDateWithOrdinal(date: Date) {
  const day = format(date, 'd');
  const month = format(date, 'MMMM');
  const dayWithOrdinal = getOrdinalSuffix(Number(day));
  return `${dayWithOrdinal} ${month}`;
}

const today = new Date();

export const Day = ({ entries }: { entries: SelectEntries[] }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentOpenMessage, setCurrentOpenMessage] = useState<
    string | undefined
  >(undefined);
  const queryClient = useQueryClient();
  const [currentDay, setCurrentDay] = useState(today);
  const update = useMutation({
    mutationFn: (entry: InsertEntries) => {
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

  const deleteMessage = (id: string | undefined) => {
    if (!todaysEntry || !id) return null;

    const deletedMessage = todaysEntry?.messages?.filter(
      (message) => message.id !== id
    );

    const updatedEntry: InsertEntries = {
      id: todaysEntry.id,
      day: todaysEntry.day,
      createdAt: todaysEntry.createdAt,
      updatedAt: todaysEntry.updatedAt,
      messages: deletedMessage,
    };

    update.mutate(updatedEntry);
  };

  const messages = todaysEntry?.messages ?? undefined;

  return (
    <>
      <Drawer
        onClose={() => setCurrentOpenMessage(undefined)}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Do you want to delete this entry?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              onClick={() => {
                deleteMessage(currentOpenMessage);
                setIsDrawerOpen(false);
              }}
              variant="destructive"
            >
              Delete entry
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div className="flex flex-col gap-10 pt-4">
        <div className="text-blue-100">
          <p>{getYear(currentDay)}</p>
          <h1 className="text-3xl font-bold">
            {formatDateWithOrdinal(currentDay)}
          </h1>
        </div>

        <div className="flex flex-col gap-4 h-[calc(100dvh-200px)] overflow-scroll">
          {messages && messages?.length > 0 ? (
            messages?.map((message) => (
              <Entry
                key={message.createdAt}
                createdAt={message.createdAt}
                content={message.content}
                id={message.id}
                setIsDrawerOpen={setIsDrawerOpen}
                setCurrentOpenMessage={setCurrentOpenMessage}
              />
            ))
          ) : (
            <p className="text-blue-50">Write down what you learned today</p>
          )}
          {showNewMessage && (
            <AddMessage
              showNewMessage={showNewMessage}
              sendMessage={sendMessage}
              closeMessage={setShowNewMessage}
            />
          )}
        </div>
      </div>

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
    </>
  );
};
