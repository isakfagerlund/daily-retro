import PWABadge from './PWABadge.tsx';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';

// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Day } from './components/Day.tsx';
import { getEntries } from './lib/queries.ts';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

function App() {
  return (
    <div className="bg-blue-800 h-dvh">
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
    <div className="container">
      <Day entries={data} />
    </div>
  );
};

export default App;
