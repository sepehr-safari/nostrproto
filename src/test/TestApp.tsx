import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NostrLoginProvider } from '@nostrify/react/login';
import NostrProvider from '@/components/NostrProvider';
import { AppProvider } from '@/components/AppProvider';

interface TestAppProps {
  children: React.ReactNode;
}

export function TestApp({ children }: TestAppProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <NostrLoginProvider storageKey='test-login'>
        <AppProvider>
          <NostrProvider relays={['wss://relay.example.com']}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </NostrProvider>
        </AppProvider>
      </NostrLoginProvider>
    </BrowserRouter>
  );
}

export default TestApp;