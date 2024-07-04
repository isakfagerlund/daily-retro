import PWABadge from './PWABadge.tsx';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  InsertEntries,
  Message,
  SelectEntries,
} from './server/src/db/types.ts';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Button } from './components/ui/button.tsx';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const getEntries = async () => {
  const response = await fetch('http://localhost:3000/');
  return (await response.json()) as SelectEntries[];
};

const updateEntry = async (entry: InsertEntries) => {
  console.log(entry);
  return await fetch('http://localhost:3000/', {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

function App() {
  return (
    <div className="bg-stone-200 h-dvh">
      <QueryClientProvider client={queryClient}>
        <Home />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
      <PWABadge />
    </div>
  );
}

const Home = () => {
  const { data } = useQuery({ queryKey: ['entries'], queryFn: getEntries });

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container py-8">
      <Day entries={data} />
    </div>
  );
};

const Day = ({ entries }: { entries: SelectEntries[] }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (entry: InsertEntries) => {
      return updateEntry(entry);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });

  const [showNewMessage, setShowNewMessage] = useState(false);
  const todaysEntry = entries.find((entry) => entry.day === '27-06-2024');

  if (!todaysEntry) {
    return <p>No entry yet</p>;
  }

  const sendMessage = (message: Message) => {
    const newEntry: InsertEntries = {
      id: todaysEntry.id,
      day: todaysEntry.day,
      createdAt: todaysEntry.createdAt,
      updatedAt: todaysEntry.updatedAt,
      messages: todaysEntry.messages
        ? [...todaysEntry.messages, message]
        : [message],
    };

    mutation.mutate(newEntry);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl text-center">{todaysEntry.day}</h1>
      <div className="flex flex-col gap-4">
        {todaysEntry.messages?.map((message) => (
          <span className="p-4 bg-stone-300 rounded-xl" key={message.content}>
            {message.content}
          </span>
        ))}
      </div>

      {showNewMessage && (
        <AddMessage
          sendMessage={sendMessage}
          closeMessage={setShowNewMessage}
        />
      )}
      <Button
        onClick={() => setShowNewMessage(!showNewMessage)}
        variant="outline"
        size="icon"
        className="self-end"
      >
        {showNewMessage ? <X /> : <Plus />}
      </Button>
    </div>
  );
};

const AddMessage = ({
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
      <textarea
        className="w-full"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default App;
