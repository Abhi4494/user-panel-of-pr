import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Shown instead of `children` once something below throws (e.g. a lazy chunk failed to load). */
  fallback: ReactNode;
  children: ReactNode;
}

/**
 * Keeps a render/loading error local to one widget instead of blanking the whole app. React only supports error
 * boundaries as classes. Typical use: around a `lazy()` component, whose chunk can fail to load (offline, or a
 * new deploy replaced the old file names).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
