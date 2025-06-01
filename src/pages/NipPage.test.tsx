import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import NipPage from './NipPage';

// Mock the hooks
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: {
      pubkey: 'c'.repeat(64), // Valid 64-character hex string
      signer: {},
    },
  }),
}));

vi.mock('@/hooks/useCustomNip', () => ({
  useCustomNip: () => ({
    data: {
      kind: 30817,
      pubkey: 'a'.repeat(64), // Valid 64-character hex string
      content: 'Custom NIP content',
      created_at: 1234567890,
      tags: [
        ['d', 'test-nip'],
        ['title', 'Test Custom NIP'],
        ['k', '1000'],
        ['fork', '30817:' + 'b'.repeat(64) + ':source-identifier'],
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useOfficialNip', () => ({
  useOfficialNip: () => ({
    data: {
      content: 'Official NIP content',
      nipNumber: '01',
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAuthor', () => ({
  useAuthor: () => ({
    data: {
      metadata: {
        name: 'Test Author',
        picture: 'https://example.com/avatar.jpg',
      },
    },
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('NipPage', () => {
  it('renders official NIP with fork button', () => {
    render(
      <TestApp>
        <NipPage nipId="01" isOfficialNip={true} />
      </TestApp>
    );

    expect(screen.getByText('NIP-01')).toBeInTheDocument();
    expect(screen.getByText('Fork NIP')).toBeInTheDocument();
    expect(screen.getByText('Official Protocol')).toBeInTheDocument();
  });

  it('renders custom NIP with fork badge when forked', () => {
    render(
      <TestApp>
        <NipPage nipId="test-naddr" isOfficialNip={false} />
      </TestApp>
    );

    expect(screen.getByRole('heading', { name: 'Test Custom NIP' })).toBeInTheDocument();
    // Look for the fork badge specifically by checking for multiple Fork texts
    const forkTexts = screen.getAllByText('Fork');
    expect(forkTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Custom Protocol')).toBeInTheDocument();
  });

  it('shows fork information for forked NIPs', () => {
    render(
      <TestApp>
        <NipPage nipId="test-naddr" isOfficialNip={false} />
      </TestApp>
    );

    expect(screen.getByText('Forked from')).toBeInTheDocument();
  });

  it('includes fork option in dropdown menu for custom NIPs', () => {
    render(
      <TestApp>
        <NipPage nipId="test-naddr" isOfficialNip={false} />
      </TestApp>
    );

    // The fork option should be in the dropdown menu
    const forkLinks = screen.getAllByText('Fork NIP');
    expect(forkLinks.length).toBeGreaterThan(0);
  });
});