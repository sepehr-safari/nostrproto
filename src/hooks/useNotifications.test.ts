import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { TestApp } from '@/test/TestApp';
import { useNotifications } from './useNotifications';

// Mock the useCurrentUser hook
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: {
      pubkey: 'test-pubkey-123',
    },
  }),
}));

// Mock the useNostr hook
vi.mock('@nostrify/react', () => ({
  useNostr: () => ({
    nostr: {
      query: vi.fn().mockResolvedValue([
        {
          id: 'reaction-1',
          pubkey: 'author-1',
          created_at: 1700000000,
          kind: 7,
          tags: [
            ['k', '30817'],
            ['p', 'test-pubkey-123'],
            ['a', '30817:test-pubkey-123:my-nip'],
          ],
          content: '+',
          sig: 'sig1',
        },
        {
          id: 'comment-1',
          pubkey: 'author-2',
          created_at: 1700000001,
          kind: 1111,
          tags: [
            ['k', '30817'],
            ['p', 'test-pubkey-123'],
            ['a', '30817:test-pubkey-123:my-nip'],
          ],
          content: 'Great NIP!',
          sig: 'sig2',
        },
      ]),
    },
  }),
  NostrContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

describe('useNotifications', () => {
  it('should fetch notifications for the current user', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: TestApp,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].kind).toBe(1111); // Comment (newer)
    expect(result.current.data?.[1].kind).toBe(7); // Reaction (older)
  });

  it('should sort notifications by creation time (newest first)', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: TestApp,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const notifications = result.current.data;
    expect(notifications?.[0].created_at).toBeGreaterThan(notifications?.[1].created_at || 0);
  });
});