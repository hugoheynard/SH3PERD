import { GlobalExceptionFilter } from '../GlobalExceptionFilter.js';
import { DomainError } from '../DomainError.js';
import { BusinessError } from '../BusinessError.js';
import { TechnicalError } from '../TechnicalError.js';
import { BadRequestException, ForbiddenException, HttpException } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    };
  });

  // ── DomainError ──────────────────────────────────────

  it('should handle DomainError → 400', () => {
    const error = new DomainError('Name is required', { code: 'NAME_REQUIRED' });

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      errorCode: 'NAME_REQUIRED',
      message: 'Name is required',
    });
  });

  // ── BusinessError ────────────────────────────────────

  it('should handle BusinessError with custom status → 404', () => {
    const error = new BusinessError('Company not found', {
      code: 'COMPANY_NOT_FOUND',
      status: 404,
    });

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      errorCode: 'COMPANY_NOT_FOUND',
      message: 'Company not found',
    });
  });

  it('should handle BusinessError with default status → 400', () => {
    const error = new BusinessError('Invalid input', { code: 'INVALID_INPUT' });

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Invalid input',
    });
  });

  // ── TechnicalError ───────────────────────────────────

  it('should handle TechnicalError → 500 with generic message', () => {
    const original = new Error('ECONNREFUSED');
    const error = new TechnicalError('MongoDB failed', {
      code: 'MONGO_FAILED',
      cause: original,
      context: { operation: 'findOne' },
    });

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      errorCode: 'MONGO_FAILED',
      message: 'An internal error occurred.',
    });
  });

  // ── NestJS HttpException ─────────────────────────────

  it('should handle NestJS ForbiddenException → 403', () => {
    const error = new ForbiddenException('Missing required permission: company:settings:write');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Missing required permission: company:settings:write',
      }),
    );
  });

  it('should handle NestJS BadRequestException → 400', () => {
    const error = new BadRequestException('Validation failed');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  // ── Generic Error with UPPER_CASE code ───────────────

  it('should handle plain Error with UPPER_CASE message → 400', () => {
    const error = new Error('COMPANY_NAME_REQUIRED');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      errorCode: 'COMPANY_NAME_REQUIRED',
      message: 'COMPANY_NAME_REQUIRED',
    });
  });

  // ── Unknown error ────────────────────────────────────

  it('should handle unknown error → 500', () => {
    filter.catch('something weird', mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    });
  });

  it('should handle null → 500', () => {
    filter.catch(null, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
