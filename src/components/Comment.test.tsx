import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NostrEvent } from '@nostrify/nostrify';

import { TestApp } from '@/test/TestApp';
import { Comment } from './Comment';

// Mock hooks
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@/hooks/useAuthor', () => ({
  useAuthor: () => ({
    data: {
      metadata: {
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      },
    },
  }),
}));

vi.mock('@/hooks/useNipComments', () => ({
  useNipComments: () => ({
    data: {
      getDirectReplies: () => [],
    },
  }),
}));

vi.mock('@/hooks/useDeleteComment', () => ({
  useDeleteComment: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import { useCurrentUser } from '@/hooks/useCurrentUser';

const mockUseCurrentUser = vi.mocked(useCurrentUser);

describe('Comment', () => {
  const mockComment: NostrEvent = {
    id: 'comment-id',
    kind: 1111,
    content: 'This is a test comment',
    tags: [['a', '30024:author-pubkey:test-article']],
    created_at: Math.floor(Date.now() / 1000),
    pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    sig: 'signature',
  };

  const mockNaddr = 'naddr1qqxnzd3cxqmrzv3exgmr2wfeqgsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders comment content and author info', () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  it('shows delete button for comment owner', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        signer: {
          signEvent: vi.fn(),
          getPublicKey: vi.fn(),
        },
        method: 'extension' as const,
      },
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    // Look for the delete button by its aria-label
    const deleteButton = screen.getByRole('button', { name: 'Delete comment' });
    expect(deleteButton).toBeInTheDocument();
  });

  it('does not show delete button for non-owner', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        pubkey: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        signer: {
          signEvent: vi.fn(),
          getPublicKey: vi.fn(),
        },
        method: 'extension' as const,
      },
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    // Delete button should not be present
    expect(screen.queryByRole('button', { name: 'Delete comment' })).not.toBeInTheDocument();
  });

  it('does not show delete button when user is not logged in', () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    // Delete button should not be present
    expect(screen.queryByRole('button', { name: 'Delete comment' })).not.toBeInTheDocument();
  });

  it('opens confirmation dialog when delete button is clicked', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        signer: {
          signEvent: vi.fn(),
          getPublicKey: vi.fn(),
        },
        method: 'extension' as const,
      },
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete comment' });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this comment/)).toBeInTheDocument();
  });
});