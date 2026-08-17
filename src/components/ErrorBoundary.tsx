import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered instead of the crashed subtree. Defaults to a small inline notice. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Keeps one failing section from blanking the whole site.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Section failed to render:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="container py-10 text-center text-sm text-muted-foreground">
            This section could not be loaded. Please refresh the page.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
