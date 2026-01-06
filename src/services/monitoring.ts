/**
 * Monitoring and logging service for Tele Heal
 * Implements error tracking, performance monitoring, and analytics
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private logs: LogEntry[] = [];
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_LOGS = 1000;
  private readonly MAX_METRICS = 500;

  /**
   * Log a message
   */
  log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: Record<string, any>,
    stack?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack,
    };

    this.logs.push(entry);

    // Keep logs under MAX_LOGS
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Send to external service if configured
    if (process.env.SENTRY_DSN) {
      this.sendToSentry(entry);
    }

    // Console output
    console[level](message, context || '');
  }

  /**
   * Log info level message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error level message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error?.stack);

    // Send to error tracking service
    if (process.env.SENTRY_DSN) {
      this.captureException(error || new Error(message));
    }
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep metrics under MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Send to monitoring service
    if (process.env.DATADOG_API_KEY) {
      this.sendToDatadog(metric);
    }
  }

  /**
   * Measure execution time of a function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, status: 'success' });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, status: 'error' });
      throw error;
    }
  }

  /**
   * Measure execution time of a synchronous function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, status: 'success' });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, status: 'error' });
      throw error;
    }
  }

  /**
   * Track user action
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (process.env.GOOGLE_ANALYTICS_ID) {
      this.sendToAnalytics(eventName, properties);
    }

    this.info(`Event tracked: ${eventName}`, properties);
  }

  /**
   * Track user property
   */
  setUserProperty(userId: string, properties: Record<string, any>): void {
    if (process.env.MIXPANEL_TOKEN) {
      this.sendToMixpanel(userId, properties);
    }

    this.info(`User property set for ${userId}`, properties);
  }

  /**
   * Get logs
   */
  getLogs(level?: string, limit: number = 100): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get metrics
   */
  getMetrics(name?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter((metric) => metric.name === name);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const metrics = this.metrics.filter((m) => m.name === name);

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      average: sum / metrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
    };
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Send to Sentry (error tracking)
   */
  private sendToSentry(entry: LogEntry): void {
    // Implementation would use Sentry SDK
    // For now, just a placeholder
  }

  /**
   * Capture exception in Sentry
   */
  private captureException(error: Error): void {
    // Implementation would use Sentry SDK
    // For now, just a placeholder
  }

  /**
   * Send metric to Datadog
   */
  private sendToDatadog(metric: PerformanceMetric): void {
    // Implementation would use Datadog API
    // For now, just a placeholder
  }

  /**
   * Send event to Google Analytics
   */
  private sendToAnalytics(eventName: string, properties?: Record<string, any>): void {
    // Implementation would use Google Analytics API
    // For now, just a placeholder
  }

  /**
   * Send user property to Mixpanel
   */
  private sendToMixpanel(userId: string, properties: Record<string, any>): void {
    // Implementation would use Mixpanel API
    // For now, just a placeholder
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

/**
 * Create a performance monitoring decorator
 */
export function Monitor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = performance.now();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - startTime;
      monitoringService.recordMetric(`${target.constructor.name}.${propertyKey}`, duration, {
        status: 'success',
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      monitoringService.recordMetric(`${target.constructor.name}.${propertyKey}`, duration, {
        status: 'error',
      });
      throw error;
    }
  };

  return descriptor;
}

/**
 * Health check endpoint
 */
export const healthCheck = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  logs: monitoringService.getLogs(undefined, 10),
  metrics: monitoringService.getMetrics(undefined, 10),
};
