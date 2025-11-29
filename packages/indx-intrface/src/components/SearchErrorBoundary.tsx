import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for graceful error handling in search components.
 *
 * Catches errors during initialization and search operations, displaying
 * user-friendly error messages with suggestions for fixing common issues.
 *
 * @example
 * <SearchErrorBoundary>
 *   <SearchProvider {...props}>
 *     {children}
 *   </SearchProvider>
 * </SearchErrorBoundary>
 *
 * @example Custom fallback
 * <SearchErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h2>Something went wrong</h2>
 *       <p>{error.message}</p>
 *       <button onClick={reset}>Try Again</button>
 *     </div>
 *   )}
 * >
 *   <SearchProvider {...props}>
 *     {children}
 *   </SearchProvider>
 * </SearchErrorBoundary>
 */
export class SearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SearchErrorBoundary] Caught error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default error UI
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#fee',
          border: '2px solid #c33',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '2rem auto',
        }}>
          <h2 style={{ color: '#c33', marginTop: 0 }}>
            ⚠️ Search Initialization Error
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Error:</strong> {this.state.error.message}
          </p>
          <div style={{
            backgroundColor: '#fff',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            <strong>💡 Common fixes:</strong>
            <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
              <li>Check browser console for detailed error messages</li>
              <li>Verify NEXT_PUBLIC_INDX_URL is correct in .env.local</li>
              <li>Verify NEXT_PUBLIC_INDX_EMAIL and NEXT_PUBLIC_INDX_PASSWORD are correct</li>
              <li>Ensure INDX server is running</li>
              <li>Check dataset name spelling</li>
            </ul>
          </div>
          <button
            onClick={this.reset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#c33',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
