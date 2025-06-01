import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { CommentsSection } from './CommentsSection';

// Mock the hooks
vi.mock('@/hooks/useNipComments', () => ({
  useNipComments: () => ({
    data: {
      allComments: [],
      topLevelComments: [],
      getDescendants: () => [],
      getDirectReplies: () => [],
    },
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
    render(
      <TestApp>
        <CommentsSection naddr="naddr1test" />
      </TestApp>
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to share your thoughts on this NIP!')).toBeInTheDocument();
  });
});