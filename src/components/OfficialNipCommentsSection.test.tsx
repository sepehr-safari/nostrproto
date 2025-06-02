import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { OfficialNipCommentsSection } from './OfficialNipCommentsSection';

// Mock the hooks
vi.mock('@/hooks/useOfficialNipComments', () => ({
  useOfficialNipComments: vi.fn(),
}));

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ user: null }),
}));

import { useOfficialNipComments } from '@/hooks/useOfficialNipComments';

describe('OfficialNipCommentsSection', () => {
  it('renders loading state', () => {
    vi.mocked(useOfficialNipComments).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useOfficialNipComments>);

    render(
      <TestApp>
        <OfficialNipCommentsSection nipNumber="01" />
      </TestApp>
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
    // Should show skeleton loaders
    expect(document.querySelectorAll('[data-testid="skeleton"]')).toBeTruthy();
  });

  it('renders empty state when no comments', () => {
    vi.mocked(useOfficialNipComments).mockReturnValue({
      data: {
        topLevelComments: [],
        allComments: [],
        deletedCommentIds: new Set(),
        getDescendants: () => [],
        getDirectReplies: () => [],
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useOfficialNipComments>);

    render(
      <TestApp>
        <OfficialNipCommentsSection nipNumber="01" />
      </TestApp>
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('(0)')).toBeInTheDocument();
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to share your thoughts on this NIP!')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(useOfficialNipComments).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as unknown as ReturnType<typeof useOfficialNipComments>);

    render(
      <TestApp>
        <OfficialNipCommentsSection nipNumber="01" />
      </TestApp>
    );

    expect(screen.getByText('Failed to load comments')).toBeInTheDocument();
  });
});