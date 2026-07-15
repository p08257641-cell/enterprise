import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  lastResetKey?: string | number;
}

type ErrorBoundaryProps = {
  children?: ReactNode;
  resetKey?: string | number;
};

/**
 * Prevents a single view crash from blanking the entire app.
 * Pass a changing `resetKey` (e.g. the active view) to clear the error
 * when the user navigates to another module.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): ErrorBoundaryState | null {
    // When the resetKey changes (user navigated), clear any previous error
    // and always surface the latest children.
    if (props.resetKey !== state.lastResetKey) {
      return { hasError: false, error: undefined, lastResetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] view crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-8 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-rose-700">Something went wrong</h2>
          <p className="mt-2 text-xs text-rose-600">This view failed to render. Try switching to another module, or reload the page.</p>
          {this.state.error && (
            <pre className="mt-3 max-h-48 overflow-auto rounded bg-white/70 p-3 text-[11px] leading-relaxed text-rose-700">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children ?? null;
  }
}
