/**
 * Structured Logger for Production Server Environments
 * Output format is JSON, easily parsable by Datadog, CloudWatch, or Axiom.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, any>;
  error?: any;
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, any>, error?: any): string {
    const payload: LogPayload = {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...(context && { context }),
      ...(error && { error: error instanceof Error ? { message: error.message, stack: error.stack } : error })
    };
    return JSON.stringify(payload);
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.formatLog('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatLog('warn', message, context));
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    console.error(this.formatLog('error', message, context, error));
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, context));
    }
  }
}

export const logger = new Logger();
