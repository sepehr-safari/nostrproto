import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows comment menu with delete option for comment owner', async () => {
    const user = userEvent.setup();
    
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

    // Look for the menu trigger button
    const menuButton = screen.getByRole('button', { name: 'Comment options' });
    expect(menuButton).toBeInTheDocument();

    // Click to open the menu
    await user.click(menuButton);

    // Wait for menu items to appear
    await waitFor(() => {
      expect(screen.getByText('Delete comment')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('View source')).toBeInTheDocument();
  });

  it('does not show delete option for non-owner', async () => {
    const user = userEvent.setup();
    
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

    // Menu should still be present
    const menuButton = screen.getByRole('button', { name: 'Comment options' });
    expect(menuButton).toBeInTheDocument();

    // Click to open the menu
    await user.click(menuButton);

    // Wait for menu to open and check items
    await waitFor(() => {
      expect(screen.getByText('View source')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.queryByText('Delete comment')).not.toBeInTheDocument();
  });

  it('does not show delete option when user is not logged in', async () => {
    const user = userEvent.setup();
    
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    // Menu should still be present
    const menuButton = screen.getByRole('button', { name: 'Comment options' });
    expect(menuButton).toBeInTheDocument();

    // Click to open the menu
    await user.click(menuButton);

    // Wait for menu to open and check items
    await waitFor(() => {
      expect(screen.getByText('View source')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.queryByText('Delete comment')).not.toBeInTheDocument();
  });

  it('opens confirmation dialog when delete option is clicked', async () => {
    const user = userEvent.setup();
    
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

    // Open the menu
    const menuButton = screen.getByRole('button', { name: 'Comment options' });
    await user.click(menuButton);

    // Wait for menu to open and click delete option
    await waitFor(() => {
      expect(screen.getByText('Delete comment')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const deleteOption = screen.getByText('Delete comment');
    await user.click(deleteOption);

    expect(screen.getByText('Delete Comment')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this comment/)).toBeInTheDocument();
  });

  it('opens source dialog when view source is clicked', async () => {
    const user = userEvent.setup();
    
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      users: [],
    });

    render(
      <TestApp>
        <Comment comment={mockComment} naddr={mockNaddr} />
      </TestApp>
    );

    // Open the menu
    const menuButton = screen.getByRole('button', { name: 'Comment options' });
    await user.click(menuButton);

    // Wait for menu to open and click view source option
    await waitFor(() => {
      expect(screen.getByText('View source')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const viewSourceOption = screen.getByText('View source');
    await user.click(viewSourceOption);

    expect(screen.getByText('Event Source')).toBeInTheDocument();
    // Check for individual parts since syntax highlighting splits the text
    // Check for individual parts since syntax highlighting splits the text
    expect(screen.getByText('"kind"')).toBeInTheDocument();
    expect(screen.getByText('1111')).toBeInTheDocument();
    expect(screen.getByText('"This is a test comment"')).toBeInTheDocument();
  });
});
