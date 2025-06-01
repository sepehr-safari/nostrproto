import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import Index from './Index';

// Mock the hooks
vi.mock('@/hooks/useRecentCustomNips', () => ({
  useRecentCustomNips: vi.fn(),
}));

vi.mock('@/hooks/useOfficialNips', () => ({
  useOfficialNips: vi.fn(),
}));

vi.mock('@/hooks/useAuthor', () => ({
  useAuthor: vi.fn(),
}));

import { useRecentCustomNips } from '@/hooks/useRecentCustomNips';
import { useOfficialNips } from '@/hooks/useOfficialNips';
import { useAuthor } from '@/hooks/useAuthor';

const mockUseRecentCustomNips = useRecentCustomNips as ReturnType<typeof vi.fn>;
const mockUseOfficialNips = useOfficialNips as ReturnType<typeof vi.fn>;
const mockUseAuthor = useAuthor as ReturnType<typeof vi.fn>;

describe('Index', () => {
  beforeEach(() => {
    mockUseOfficialNips.mockReturnValue({
      data: [
        {
          number: '01',
          title: 'Basic protocol flow description',
          note: null,

          deprecated: false,
        },
      ],
      isLoading: false,
      error: null,
    });

    mockUseAuthor.mockReturnValue({
      data: {
        metadata: {
          name: 'Test Author',
          picture: 'https://example.com/avatar.jpg',
        },
      },
    });
  });

  it('renders kind badges as clickable links', () => {
    const mockCustomNips = [
      {
        id: 'event1',
        pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        created_at: 1000000,
        kind: 30817,
        tags: [
          ['title', 'Test NIP'],
          ['d', 'test-nip'],
          ['k', '1'],
          ['k', '42'],
        ],
        content: 'This is a test NIP content.',
        sig: 'sig1',
      },
    ];

    mockUseRecentCustomNips.mockReturnValue({
      data: mockCustomNips,
      isLoading: false,
    });

    render(
      <TestApp>
        <Index />
      </TestApp>
    );

    // Check that kind badges are rendered as clickable links
    const kind1Link = screen.getByRole('link', { name: '1' });
    const kind42Link = screen.getByRole('link', { name: '42' });
    
    expect(kind1Link).toHaveAttribute('href', '/kind/1');
    expect(kind42Link).toHaveAttribute('href', '/kind/42');
  });

  it('renders loading state for custom NIPs', () => {
    mockUseRecentCustomNips.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <TestApp>
        <Index />
      </TestApp>
    );

    expect(screen.getByText('Custom NIPs')).toBeInTheDocument();
  });

  it('renders empty state when no custom NIPs exist', () => {
    mockUseRecentCustomNips.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <TestApp>
        <Index />
      </TestApp>
    );

    expect(screen.getByText('No custom NIPs found. Be the first to create one!')).toBeInTheDocument();
  });
});