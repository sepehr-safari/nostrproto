import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { Layout } from './Layout';

// Mock the useIsMobile hook to test mobile layout
const mockUseIsMobile = vi.fn();
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Mock the NotificationCounter component
vi.mock('@/components/NotificationCounter', () => ({
  NotificationCounter: () => <div data-testid="notification-counter">Counter</div>,
}));

describe('Layout', () => {
  it('should render notification counter on desktop navigation', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(
      <TestApp>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestApp>
    );

    // Should have notification counters on desktop nav
    const counters = screen.getAllByTestId('notification-counter');
    expect(counters.length).toBeGreaterThan(0);
  });

  it('should render notification counter on mobile hamburger menu', () => {
    mockUseIsMobile.mockReturnValue(true);

    render(
      <TestApp>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestApp>
    );

    // Should have notification counter on mobile hamburger menu
    const counters = screen.getAllByTestId('notification-counter');
    expect(counters.length).toBeGreaterThan(0);
    
    // Should have the hamburger menu button
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('should render the main content', () => {
    mockUseIsMobile.mockReturnValue(false);

    render(
      <TestApp>
        <Layout>
          <div>Test content</div>
        </Layout>
      </TestApp>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});