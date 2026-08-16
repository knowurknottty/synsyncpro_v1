/**
 * Advanced Error Handling Utilities
 *
 * Provides structured error handling, recovery strategies, and error categorization
 */

/**
 * Error categories for structured error handling
 */
export enum ErrorCategory {
  AUDIO_ENGINE = 'AUDIO_ENGINE',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  UI = 'UI',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error severity levels for prioritization
 */
export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

/**
 * Structured error object with metadata
 */
export interface AppError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;
  recoverable: boolean;
  suggestion?: string;
}

/**
 * Error handler with categorization and recovery
 */
export class ErrorHandler {
  private static listeners: Set<(error: AppError) => void> = new Set();
  private static errorHistory: AppError[] = [];
  private static maxHistorySize = 50;

  /**
   * Categorize error based on message and type
   */
  static categorizeError(error: Error | string): ErrorCategory {
    const message = typeof error === 'string' ? error : error.message;

    if (
      message.includes('AudioContext') ||
      message.includes('Oscillator') ||
      message.includes('GainNode')
    ) {
      return ErrorCategory.AUDIO_ENGINE;
    }

    if (message.includes('fetch') || message.includes('network')) {
      return ErrorCategory.NETWORK;
    }

    if (message.includes('invalid') || message.includes('required')) {
      return ErrorCategory.VALIDATION;
    }

    if (message.includes('render') || message.includes('component')) {
      return ErrorCategory.UI;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  static getSeverity(error: Error | string): ErrorSeverity {
    const message = typeof error === 'string' ? error : error.message;

    if (
      message.includes('fatal') ||
      message.includes('crash') ||
      message.includes('disconnect')
    ) {
      return ErrorSeverity.CRITICAL;
    }

    if (message.includes('error') || message.includes('failed')) {
      return ErrorSeverity.HIGH;
    }

    if (message.includes('warn')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Get recovery suggestion based on error
   */
  static getRecoverySuggestion(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.AUDIO_ENGINE:
        return 'Try reloading the page or checking your browser audio settings';
      case ErrorCategory.NETWORK:
        return 'Check your internet connection and try again';
      case ErrorCategory.VALIDATION:
        return 'Please verify your input and try again';
      case ErrorCategory.UI:
        return 'Try refreshing the page or clearing browser cache';
      default:
        return 'An unexpected error occurred. Please try again later';
    }
  }

  /**
   * Handle error with full context
   */
  static handleError(
    error: Error | string,
    context?: Record<string, any>,
    recoverable: boolean = true
  ): AppError {
    const category = this.categorizeError(error);
    const severity = this.getSeverity(error);
    const message = typeof error === 'string' ? error : error.message;

    const appError: AppError = {
      category,
      severity,
      message,
      originalError: error instanceof Error ? error : undefined,
      timestamp: new Date(),
      context,
      recoverable,
      suggestion: this.getRecoverySuggestion(category),
    };

    this.recordError(appError);
    this.notifyListeners(appError);

    return appError;
  }

  /**
   * Record error in history for debugging
   */
  private static recordError(error: AppError): void {
    this.errorHistory.push(error);

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Notify all registered error listeners
   */
  private static notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Register error listener
   */
  static addListener(listener: (error: AppError) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get error history
   */
  static getErrorHistory(limit: number = 10): AppError[] {
    return this.errorHistory.slice(-limit);
  }

  /**
   * Clear error history
   */
  static clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Get error statistics
   */
  static getStatistics() {
    const stats = {
      total: this.errorHistory.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
    };

    this.errorHistory.forEach((error) => {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

/**
 * Retry strategy for failed operations
 */
export const createRetryStrategy = (
  maxAttempts: number = 3,
  delayMs: number = 1000,
  backoffMultiplier: number = 2
) => {
  return async <T,>(operation: () => Promise<T>): Promise<T> => {
    let lastError: Error | null = null;
    let delay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        }
      }
    }

    throw lastError || new Error('Operation failed after all retries');
  };
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async <T,>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | typeof fallback> => {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.handleError(error as Error);
    return fallback;
  }
};

/**
 * Safe sync operation wrapper
 */
export const safeSync = <T,>(
  operation: () => T,
  fallback?: T
): T | typeof fallback => {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.handleError(error as Error);
    return fallback;
  }
};
