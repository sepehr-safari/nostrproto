import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import KindPage from './KindPage';

// Mock the hooks
vi.mock('@/hooks/useNipsByKind', () => ({
  useNipsByKind: vi.fn(),
}));

vi.mock('@/hooks/useAuthor', () => ({
  useAuthor: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ k: '1' }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

import { useNipsByKind } from '@/hooks/useNipsByKind';
import { useAuthor } from '@/hooks/useAuthor';

const mockUseNipsByKind = useNipsByKind as ReturnType<typeof vi.fn>;
const mockUseAuthor = useAuthor as ReturnType<typeof vi.fn>;

describe('KindPage', () => {
  beforeEach(() => {
    mockUseAuthor.mockReturnValue({
      data: {
        metadata: {
          name: 'Test Author',
        },
      },
    });
  });

  it('renders loading state', () => {
    mockUseNipsByKind.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(
      <TestApp>
        <KindPage />
      </TestApp>
    );

    expect(screen.getByText('Kind 1 NIPs')).toBeInTheDocument();
    expect(screen.getByText('Custom NIPs that define event kind 1')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseNipsByKind.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(
      <TestApp>
        <KindPage />
      </TestApp>
    );

    expect(screen.getByText('Failed to load NIPs for kind 1. Please try again.')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockUseNipsByKind.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <TestApp>
        <KindPage />
      </TestApp>
    );

    expect(screen.getByText('No NIPs found')).toBeInTheDocument();
    expect(screen.getByText('No custom NIPs have been created for kind 1 yet.')).toBeInTheDocument();
  });

  it('renders NIPs list', () => {
    const mockNips = [
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
        content: 'This is a test NIP content that describes kind 1 events.',
        sig: 'sig1',
      },
    ];

    mockUseNipsByKind.mockReturnValue({
      data: mockNips,
      isLoading: false,
      error: null,
    });

    render(
      <TestApp>
        <KindPage />
      </TestApp>
    );

    expect(screen.getByText('Test NIP')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    
    // Check that the kind badge is clickable
    const kindBadge = screen.getByRole('link', { name: '1' });
    expect(kindBadge).toHaveAttribute('href', '/kind/1');
  });

  it('renders multiple kinds in NIP card', () => {
    const mockNips = [
      {
        id: 'event1',
        pubkey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        created_at: 1000000,
        kind: 30817,
        tags: [
          ['title', 'Multi-Kind NIP'],
          ['d', 'multi-kind'],
          ['k', '1'],
          ['k', '2'],
          ['k', '3'],
          ['k', '4'],
          ['k', '5'],
        ],
        content: 'This NIP defines multiple kinds.',
        sig: 'sig1',
      },
    ];

    mockUseNipsByKind.mockReturnValue({
      data: mockNips,
      isLoading: false,
      error: null,
    });

    render(
      <TestApp>
        <KindPage />
      </TestApp>
    );

    expect(screen.getByText('Multi-Kind NIP')).toBeInTheDocument();
    
    // Check that the kind badges are clickable links
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/kind/1');
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/kind/2');
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/kind/3');
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});