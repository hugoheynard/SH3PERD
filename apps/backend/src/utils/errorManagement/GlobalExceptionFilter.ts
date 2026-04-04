import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from './errorClasses/DomainError.js';
import { BusinessError } from './errorClasses/BusinessError.js';
import { TechnicalError } from './errorClasses/TechnicalError.js';

/**
 * Unified error response shape sent to the client.
 */
interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
}

/**
 * Global exception filter — catches all errors and returns a consistent JSON response.
 *
 * - **DomainError** → 400 (domain rule violated in entity/aggregate)
 * - **BusinessError** → its statusCode (application-level: 400, 403, 404)
 * - **TechnicalError** → its statusCode (infrastructure failure, typically 500) + logged as error
 * - **HttpException** → NestJS built-in (BadRequest, Unauthorized, etc.)
 * - **Unknown Error** → 500 + logged as error (unexpected crash)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const result = this.resolve(exception);

    // Log technical and unexpected errors for investigation
    if (result.statusCode >= 500) {
      this.logger.error(
        `[${result.errorCode}] ${result.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(result.statusCode).json(result);
  }

  private resolve(exception: unknown): ErrorResponse {
    // Domain rule violated (entity/policy layer)
    if (exception instanceof DomainError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: exception.code ?? 'DOMAIN_ERROR',
        message: exception.message,
      };
    }

    // Business rule violated (handler/controller layer)
    if (exception instanceof BusinessError) {
      return {
        statusCode: exception.statusCode,
        errorCode: exception.errorCode,
        message: exception.message,
      };
    }

    // Infrastructure failure (DB, external service)
    if (exception instanceof TechnicalError) {
      return {
        statusCode: exception.statusCode,
        errorCode: exception.errorCode,
        message: 'An internal error occurred.',
      };
    }

    // NestJS built-in HttpException (BadRequestException, UnauthorizedException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return {
        statusCode: status,
        errorCode: typeof body === 'object' && body !== null && 'error' in body
          ? String((body as any).error)
          : 'HTTP_ERROR',
        message: typeof body === 'object' && body !== null && 'message' in body
          ? this.extractMessage((body as any).message)
          : exception.message,
      };
    }

    // Generic Error with error code pattern (e.g. throw new Error('COMPANY_NAME_REQUIRED'))
    if (exception instanceof Error && /^[A-Z_]+$/.test(exception.message)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: exception.message,
        message: exception.message,
      };
    }

    // Unknown / unexpected error
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    };
  }

  /**
   * NestJS validation pipes can return string or string[].
   */
  private extractMessage(msg: unknown): string {
    if (Array.isArray(msg)) return msg.join(', ');
    return String(msg);
  }
}
