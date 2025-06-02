import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { usePostOfficialNipComment } from './usePostOfficialNipComment';

// Mock the publish hook
const mockPublishEvent = vi.fn();
vi.mock('@/hooks/useNostrPublish', () => ({
  useNostrPublish: () => ({
    mutateAsync: mockPublishEvent,
  }),
}));

describe('usePostOfficialNipComment', () => {
  it('creates top-level comment with correct tags', async () => {
    const nipNumber = '01';
    const content = 'This is a test comment';
    const expectedGithubUrl = 'https://github.com/nostr-protocol/nips/blob/master/01.md';
    
    mockPublishEvent.mockResolvedValue({ id: 'new-comment-id' });

    const { result } = renderHook(
      () => usePostOfficialNipComment(),
      { wrapper: TestApp }
    );

    result.current.mutate({ content, nipNumber });

    await waitFor(() => {
      expect(mockPublishEvent).toHaveBeenCalledWith({
        kind: 1111,
        content,
        tags: [
          ['I', expectedGithubUrl],
          ['K', 'https://github.com'],
          ['i', expectedGithubUrl],
          ['k', 'https://github.com'],
        ],
      });
    });
  });

  it('creates reply comment with correct tags', async () => {
    const nipNumber = '01';
    const content = 'This is a reply';
    const expectedGithubUrl = 'https://github.com/nostr-protocol/nips/blob/master/01.md';
    const parentComment = {
      id: 'parent-id',
      pubkey: 'parent-pubkey',
      kind: 1111,
      created_at: 1000,
      content: 'Parent comment',
      tags: [],
      sig: 'mock-signature',
    };
    
    mockPublishEvent.mockResolvedValue({ id: 'new-reply-id' });

    const { result } = renderHook(
      () => usePostOfficialNipComment(),
      { wrapper: TestApp }
    );

    result.current.mutate({ content, nipNumber, parentComment });

    await waitFor(() => {
      expect(mockPublishEvent).toHaveBeenCalledWith({
        kind: 1111,
        content,
        tags: [
          ['I', expectedGithubUrl],
          ['K', 'https://github.com'],
          ['e', 'parent-id'],
          ['k', '1111'],
          ['p', 'parent-pubkey'],
        ],
      });
    });
  });
});