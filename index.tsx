
import './src/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AudioEngineProvider } from './src/context/AudioEngineContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { MotionProvider } from './contexts/MotionContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Error handler for error boundary
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Application error caught:', error);
  console.error('Error info:', errorInfo);

  // Send to error tracking service in production
  if (import.meta.env.PROD) {
    // Example: sendToErrorTrackingService(error, errorInfo);
  }
};

// Handle audio engine errors
const handleAudioEngineError = (error: Error) => {
  console.error('AudioEngine error:', error);
  // Can log to error tracking service here
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary onError={handleError}>
      <ThemeProvider>
        <MotionProvider>
          <AudioEngineProvider onError={handleAudioEngineError}>
            <App />
          </AudioEngineProvider>
        </MotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
