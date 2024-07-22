import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import PWABadge from './PWABadge.tsx';

import { Day } from './components/Day.tsx';
import { getEntriesLocal } from './lib/queries.ts';

function App({ queryClient }: { queryClient: QueryClient }) {
  return (
    <div className="bg-blue-800 h-dvh">
      {/* Signed out
        <div className="container justify-center flex flex-col gap-8 items-center h-dvh">
          <h1 className="text-3xl font-bold text-blue-100">Daily Reflection</h1>
            <Button className="w-[250px]">Sign in</Button>
        </div>
      */}
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
      <PWABadge />
    </div>
  );
}

const Home = () => {
  const { data } = useQuery({
    queryKey: ['entries'],
    queryFn: getEntriesLocal,
  });

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <Day entries={data} />
    </div>
  );
};

export default App;
