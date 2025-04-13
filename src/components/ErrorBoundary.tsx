import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md max-w-2xl mx-auto mt-8">
          <h3 className="text-lg font-medium text-red-800">Error Occurred</h3>
          <p className="mt-1 text-sm text-red-700 font-medium">
            {this.state.error?.message || 'An error occurred during rendering'}
          </p>
          
          {this.state.error?.stack && (
            <div className="mt-3 p-3 bg-red-100 rounded-md overflow-auto max-h-60">
              <h4 className="text-sm font-medium text-red-800 mb-1">Error Stack:</h4>
              <pre className="text-xs text-red-700 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={this.handleReset}
              className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}