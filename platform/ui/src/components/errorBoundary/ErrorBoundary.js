import React from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';
import './ErrorFallback.css';

const ErrorFallback = ({ error, componentStack, resetErrorBoundary }) => {
  return (
    <div className="ErrorFallback" role="alert">
      <p>Something went wrong.</p>
      <pre>{error.message}</pre>
      <pre>{componentStack}</pre>
    </div>
  );
};

const OHIFErrorBoundary = ({
  context = 'OHIF',
  onReset = () => { },
  onError = () => { },
  fallbackComponent,
  children,
}) => {
  const onErrorHandler = (error, componentStack) => {
    // Log to console
    console.error(`${context} Error Boundary`, error, componentStack);
    // Send error to Sentry
    Sentry.captureException(error);
    // Optionally, you can also send componentStack or any other data to Sentry:
    // Sentry.captureMessage(`Component Stack: ${componentStack}`, 'info');
    onError(error, componentStack);
  };

  const onResetHandler = () => {
    onReset();
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallbackComponent || ErrorFallback}
      onReset={onResetHandler}
      onError={onErrorHandler}
    >
      {children}
    </ErrorBoundary>
  );
};

OHIFErrorBoundary.propTypes = {
  context: PropTypes.string,
  onReset: PropTypes.func,
  onError: PropTypes.func,
  children: PropTypes.node.isRequired,
  fallbackComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.element]),
};

export default OHIFErrorBoundary;
