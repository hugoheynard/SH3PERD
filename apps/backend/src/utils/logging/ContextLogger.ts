import { Logger } from '@nestjs/common';

/**
 * Logger facade that binds a structured context once and merges it into
 * every subsequent log call. Drop-in replacement for `new Logger(name)`
 * in handlers / services that want to emit correlation-ids, user ids,
 * version ids, etc. alongside the message.
 *
 * Usage:
 *
 * ```ts
 * const log = createContextLogger('MasterTrackHandler', {
 *   correlation_id: cmd.correlationId,
 *   user_id: cmd.actorId,
 *   version_id: cmd.versionId,
 * });
 * log.info('Dispatching to audio-processor');
 * // → [MasterTrackHandler] Dispatching to audio-processor | correlation_id=corr_…
 *
 * log.info('Mastering complete', { size_bytes: result.sizeBytes });
 * // merges the extra fields with the bound ones for this call.
 * ```
 *
 * Output format
 * -------------
 * In a TTY / dev environment we stick with `key=value key=value …` so
 * grepping local logs stays cheap. When `LOG_FORMAT=json` is set (prod,
 * staging, CI) every log becomes a single JSON document with the merged
 * fields — easy to ingest by log shippers (Loki, CloudWatch, etc.).
 *
 * Non-goal: this is not a full structured-logging framework. We piggy-back
 * on NestJS's `Logger` so log levels, global silencing, and tests that
 * assert on `Logger` output keep working unchanged.
 */
export type LogContext = Readonly<Record<string, unknown>>;

export type ContextLogger = {
  /** Merges `ctx` into every log call and returns a new bound instance. */
  child(ctx: LogContext): ContextLogger;
  info(message: string, extra?: LogContext): void;
  warn(message: string, extra?: LogContext): void;
  error(message: string, extra?: LogContext): void;
};

export function createContextLogger(loggerName: string, base: LogContext = {}): ContextLogger {
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
  // Dev / TTY: `message | k=v k=v`
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

/** Generate a correlation id for cross-service operations. */
export function newCorrelationId(): string {
  return `corr_${crypto.randomUUID()}`;
}
