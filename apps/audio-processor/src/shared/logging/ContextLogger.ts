import { Logger } from '@nestjs/common';

/**
 * Structured-context logger facade. Mirrors the one in `apps/backend/src/
 * utils/logging/ContextLogger.ts` — kept duplicated rather than pulled
 * into a shared package so each microservice stays independently
 * deployable without a new cross-cutting dependency.
 *
 * See the backend version for full docs. Output format is identical
 * (pretty key=value by default, JSON when `LOG_FORMAT=json` is set) so
 * the two services emit homogeneous logs for ingest.
 */
export type LogContext = Readonly<Record<string, unknown>>;

export interface ContextLogger {
  child(ctx: LogContext): ContextLogger;
  info(message: string, extra?: LogContext): void;
  warn(message: string, extra?: LogContext): void;
  error(message: string, extra?: LogContext): void;
}

export function createContextLogger(
  loggerName: string,
  base: LogContext = {},
): ContextLogger {
  const logger = new Logger(loggerName);
  return build(logger, base);
}

function build(logger: Logger, bound: LogContext): ContextLogger {
  const format = (message: string, extra?: LogContext): string => {
    const merged: LogContext = extra ? { ...bound, ...extra } : bound;
    return serialize(message, merged);
  };
  return {
    child(ctx) {
      return build(logger, { ...bound, ...ctx });
    },
    info(message, extra) {
      logger.log(format(message, extra));
    },
    warn(message, extra) {
      logger.warn(format(message, extra));
    },
    error(message, extra) {
      logger.error(format(message, extra));
    },
  };
}

function serialize(message: string, ctx: LogContext): string {
  if (Object.keys(ctx).length === 0) return message;
  if (process.env['LOG_FORMAT'] === 'json') {
    return JSON.stringify({ message, ...ctx });
  }
  const tokens: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    tokens.push(`${k}=${renderValue(v)}`);
  }
  return `${message} | ${tokens.join(' ')}`;
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v === 'string') {
    return /\s/.test(v) ? JSON.stringify(v) : v;
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return '[unserialisable]';
  }
}
