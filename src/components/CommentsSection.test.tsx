import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NostrLoginProvider } from '@nostrify/react/login';
import NostrProvider from '@/components/NostrProvider';
import { CommentsSection } from './CommentsSection';

// Mock the hooks
vi.mock('@/hooks/useNipComments', () => ({
  useNipComments: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: null,
  }),
}));

vi.mock('@/hooks/usePostComment', () => ({
  usePostComment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('CommentsSection', () => {
  it('renders comments section with empty state', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <NostrLoginProvider storageKey='test-login'>
        <NostrProvider relays={['wss://relay.example.com']}>
          <QueryClientProvider client={queryClient}>
            <CommentsSection naddr="naddr1test" />
          </QueryClientProvider>
        </NostrProvider>
      </NostrLoginProvider>
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to share your thoughts on this NIP!')).toBeInTheDocument();
  });
});