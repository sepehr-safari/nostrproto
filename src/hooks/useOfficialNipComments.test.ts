import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { useOfficialNipComments } from './useOfficialNipComments';

// Mock the nostr query
const mockQuery = vi.fn();
vi.mock('@nostrify/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nostrify/react')>();
  return {
    ...actual,
    useNostr: () => ({
      nostr: {
        query: mockQuery,
      },
    }),
  };
});

describe('useOfficialNipComments', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  it('queries for comments with correct I tag filter', async () => {
    const nipNumber = '01';
    const expectedGithubUrl = 'https://github.com/nostr-protocol/nips/blob/master/01.md';
    
    // Mock empty results
    mockQuery.mockResolvedValue([]);

    const { result } = renderHook(
      () => useOfficialNipComments(nipNumber),
      { wrapper: TestApp }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the query was called with correct filters
    expect(mockQuery).toHaveBeenCalledWith(
      [{
        kinds: [1111],
        '#I': [expectedGithubUrl],
        limit: 500,
      }],
      expect.any(Object)
    );
  });

  it('filters top-level comments correctly', async () => {
    const nipNumber = '01';
    const githubUrl = 'https://github.com/nostr-protocol/nips/blob/master/01.md';
    
    const mockComments = [
      {
        id: 'comment1',
        kind: 1111,
        pubkey: 'pubkey1',
        created_at: 1000,
        content: 'Top level comment',
        tags: [
          ['I', githubUrl],
          ['K', 'https://github.com'],
          ['i', githubUrl], // lowercase i tag indicates top-level
          ['k', 'https://github.com'],
        ],
        sig: 'mock-signature-1',
      },
      {
        id: 'comment2',
        kind: 1111,
        pubkey: 'pubkey2',
        created_at: 2000,
        content: 'Reply comment',
        tags: [
          ['I', githubUrl],
          ['K', 'https://github.com'],
          ['e', 'comment1'], // reply to comment1
          ['k', '1111'],
          ['p', 'pubkey1'],
        ],
        sig: 'mock-signature-2',
      },
    ];

    // Mock the first call (comments) and second call (deletions)
    mockQuery.mockImplementation((filters) => {
      if (filters[0].kinds[0] === 1111) {
        return Promise.resolve(mockComments);
      } else if (filters[0].kinds[0] === 5) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    const { result } = renderHook(
      () => useOfficialNipComments(nipNumber),
      { wrapper: TestApp }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data!;
    expect(data.topLevelComments).toHaveLength(1);
    expect(data.topLevelComments[0].id).toBe('comment1');
    expect(data.getDirectReplies('comment1')).toHaveLength(1);
    expect(data.getDirectReplies('comment1')[0].id).toBe('comment2');
  });
});