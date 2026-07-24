import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    const ThrowingChild = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('resets when resetKey changes', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey={1}>
        <div>View 1</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('View 1')).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKey={2}>
        <div>View 2</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('View 2')).toBeInTheDocument();
  });
});
