import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { CustomNipCard } from './CustomNipCard';

// Mock the useAuthor hook
vi.mock('@/hooks/useAuthor', () => ({
  useAuthor: vi.fn(),
}));

import { useAuthor } from '@/hooks/useAuthor';

const mockUseAuthor = useAuthor as ReturnType<typeof vi.fn>;

describe('CustomNipCard', () => {
  const mockEvent = {
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
  };

  beforeEach(() => {
    mockUseAuthor.mockReturnValue({
      data: {
        metadata: {
          name: 'Test Author',
          picture: 'https://example.com/avatar.jpg',
        },
      },
    });
  });

  it('renders NIP card with basic information', () => {
    render(
      <TestApp>
        <CustomNipCard event={mockEvent} />
      </TestApp>
    );

    expect(screen.getByText('Test NIP')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders clickable kind badges', () => {
    render(
      <TestApp>
        <CustomNipCard event={mockEvent} />
      </TestApp>
    );

    const kind1Link = screen.getByRole('link', { name: '1' });
    const kind42Link = screen.getByRole('link', { name: '42' });
    
    expect(kind1Link).toHaveAttribute('href', '/kind/1');
    expect(kind42Link).toHaveAttribute('href', '/kind/42');
  });

  it('limits displayed kinds based on maxKinds prop', () => {
    render(
      <TestApp>
        <CustomNipCard event={mockEvent} maxKinds={1} />
      </TestApp>
    );

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '42' })).not.toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('renders custom actions when provided', () => {
    const actions = <button>Custom Action</button>;
    
    render(
      <TestApp>
        <CustomNipCard event={mockEvent} actions={actions} />
      </TestApp>
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('handles missing title gracefully', () => {
    const eventWithoutTitle = {
      ...mockEvent,
      tags: [
        ['d', 'test-nip'],
        ['k', '1'],
      ],
    };

    render(
      <TestApp>
        <CustomNipCard event={eventWithoutTitle} />
      </TestApp>
    );

    expect(screen.getByText('Untitled NIP')).toBeInTheDocument();
  });

  it('handles missing author metadata gracefully', () => {
    mockUseAuthor.mockReturnValue({
      data: null,
    });

    render(
      <TestApp>
        <CustomNipCard event={mockEvent} />
      </TestApp>
    );

    // Should show truncated pubkey when no author metadata
    expect(screen.getByText('12345678...')).toBeInTheDocument();
  });
});