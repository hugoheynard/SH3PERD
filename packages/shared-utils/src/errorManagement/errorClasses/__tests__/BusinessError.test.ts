import {BusinessError} from "../BusinessError";

describe('BusinessError', () => {
    it('should correctly assign message, errorCode and statusCode', () => {
        const error = new BusinessError('User already exists', 'USER_ALREADY_EXISTS', 409);

        expect(error).toBeInstanceOf(BusinessError);
        expect(error).toBeInstanceOf(Error); // ✅ doit aussi être un Error natif
        expect(error.message).toBe('User already exists');
        expect(error.errorCode).toBe('USER_ALREADY_EXISTS');
        expect(error.statusCode).toBe(409);
        expect(error.name).toBe('BusinessError');
    });

    it('should default statusCode to 400 if not provided', () => {
        const error = new BusinessError('Invalid request', 'INVALID_REQUEST');

        expect(error.statusCode).toBe(400);
    });

    it('should preserve the prototype chain (instanceof works)', () => {
        const error = new BusinessError('Some message', 'SOME_ERROR');

        // Important pour garantir que instanceof marche même après transpilation
        expect(error instanceof BusinessError).toBe(true);
    });
});
