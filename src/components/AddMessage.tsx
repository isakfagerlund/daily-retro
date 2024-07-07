import { Message } from '@/server/src/db/types';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

export const AddMessage = ({
  sendMessage,
  closeMessage,
  showNewMessage,
}: {
  sendMessage: (message: Message) => void;
  closeMessage: React.Dispatch<React.SetStateAction<boolean>>;
  showNewMessage: boolean;
}) => {
  const bottomRef = useRef(null);
  const [message, setMessage] = useState('');

  const scroll = () => {
    // @ts-expect-error lol
    bottomRef?.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({
      content: message,
      createdAt: new Date().toISOString(),
      id: `entry-${Date.now()}`,
    });
    setMessage('');
    setTimeout(() => scroll(), 100);
    closeMessage(true);
  };

  useEffect(() => {
    // Scroll to the bottom element when the component updates
    scroll();
  }, [showNewMessage]);

  return (
    <form
      ref={bottomRef}
      className="bg-blue-800 w-full flex gap-2 p-2"
      onSubmit={handleSubmit}
    >
      <input
        className="w-full pl-2 bg-blue-50 text-blue-800 font-bold"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        autoFocus
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
