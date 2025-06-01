import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders kind badges as clickable elements', () => {
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

    // Check that kind badges are rendered as clickable elements
    const kind1Badge = screen.getByText('1');
    const kind42Badge = screen.getByText('42');
    
    expect(kind1Badge).toBeInTheDocument();
    expect(kind42Badge).toBeInTheDocument();
    expect(kind1Badge).toHaveClass('cursor-pointer');
    expect(kind42Badge).toHaveClass('cursor-pointer');
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

  it('filters custom NIPs based on search term', () => {
    const mockCustomNips = [
      {
        id: 'event1',
        pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        created_at: 1000000,
        kind: 30817,
        tags: [
          ['title', 'Lightning Network NIP'],
          ['d', 'lightning-nip'],
          ['k', '1'],
        ],
        content: 'This NIP describes lightning network integration.',
        sig: 'sig1',
      },
      {
        id: 'event2',
        pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        created_at: 1000001,
        kind: 30817,
        tags: [
          ['title', 'Relay Management'],
          ['d', 'relay-nip'],
          ['k', '42'],
        ],
        content: 'This NIP describes relay management features.',
        sig: 'sig2',
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

    // Initially both NIPs should be visible
    expect(screen.getByText('Lightning Network NIP')).toBeInTheDocument();
    expect(screen.getByText('Relay Management')).toBeInTheDocument();

    // Search for "lightning" - should only show the first NIP
    const searchInput = screen.getByPlaceholderText('Search the protocol universe...');
    fireEvent.change(searchInput, { target: { value: 'lightning' } });

    expect(screen.getByText('Lightning Network NIP')).toBeInTheDocument();
    expect(screen.queryByText('Relay Management')).not.toBeInTheDocument();

    // Search for kind "42" - should only show the second NIP
    fireEvent.change(searchInput, { target: { value: '42' } });

    expect(screen.queryByText('Lightning Network NIP')).not.toBeInTheDocument();
    expect(screen.getByText('Relay Management')).toBeInTheDocument();

    // Search for content "relay" - should only show the second NIP
    fireEvent.change(searchInput, { target: { value: 'relay' } });

    expect(screen.queryByText('Lightning Network NIP')).not.toBeInTheDocument();
    expect(screen.getByText('Relay Management')).toBeInTheDocument();

    // Clear search - both should be visible again
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('Lightning Network NIP')).toBeInTheDocument();
    expect(screen.getByText('Relay Management')).toBeInTheDocument();
  });

  it('shows no results message when search yields no custom NIPs', () => {
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

    // Search for something that doesn't match
    const searchInput = screen.getByPlaceholderText('Search the protocol universe...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No custom NIPs found matching your search.')).toBeInTheDocument();
    expect(screen.queryByText('Test NIP')).not.toBeInTheDocument();
  });
});