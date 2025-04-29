import {TechnicalError} from "../TechnicalError";

describe('TechnicalError', () => {
    it('should correctly assign message, errorCode and statusCode', () => {
        const error = new TechnicalError('Database unreachable', 'DATABASE_CONNECTION_FAILED', 500);

        expect(error).toBeInstanceOf(TechnicalError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Database unreachable');
        expect(error.errorCode).toBe('DATABASE_CONNECTION_FAILED');
        expect(error.statusCode).toBe(500);
        expect(error.name).toBe('TechnicalError');
    });

    it('should default statusCode to 500 if not provided', () => {
        const error = new TechnicalError('Unexpected failure', 'UNEXPECTED_FAILURE');

        expect(error.statusCode).toBe(500);
    });

    it('should preserve the prototype chain (instanceof works)', () => {
        const error = new TechnicalError('Some message', 'TECHNICAL_ERROR');

        expect(error instanceof TechnicalError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});
