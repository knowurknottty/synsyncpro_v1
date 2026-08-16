import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log to error tracking service
    console.error('Error caught by boundary:', error, errorInfo);

    // Call user-provided error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You could also log to an error tracking service like Sentry here
    // reportErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neuro-950 p-4" role="alert">
          <div className="bg-neuro-900 border border-red-500 rounded-lg p-8 max-w-md w-full text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <AlertCircle size={48} className="text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-red-500 mb-2">
              Oops! Something Went Wrong
            </h2>

            <p className="text-gray-300 mb-6 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-left mb-6 text-xs text-gray-400">
                <summary className="cursor-pointer hover:text-gray-300 font-semibold">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 bg-black p-3 rounded overflow-auto max-h-48 text-xs whitespace-pre-wrap break-words">
                  {this.state.error?.stack}
                  {'\n\n'}
                  Component Stack:
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
