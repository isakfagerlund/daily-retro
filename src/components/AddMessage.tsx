import { Message } from '@/server/src/db/types';
import { useState } from 'react';
import { Button } from './ui/button';

export const AddMessage = ({
  sendMessage,
  closeMessage,
}: {
  sendMessage: (message: Message) => void;
  closeMessage: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ content: message, createdAt: new Date().toISOString() });
    setMessage('');
    closeMessage(true);
  };

  return (
    <form className="w-full p-2" onSubmit={handleSubmit}>
      <input
        className="w-full"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
