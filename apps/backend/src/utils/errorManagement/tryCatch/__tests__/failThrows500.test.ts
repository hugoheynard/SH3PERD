import { technicalFailThrows500 } from '../technicalFailThrows500.js';
import { TechnicalError } from '../../errorClasses/TechnicalError.js';

describe('failThrows500', () => {
  class TestService {
    @technicalFailThrows500('TEST_ERROR_CODE', 'Custom failure message')
    async failMethod() {
      throw new Error('Original error');
    }

    @technicalFailThrows500('NO_MESSAGE_CODE')
    async failWithoutMessage() {
      throw new Error('Another error');
    }

    @technicalFailThrows500('OK_SHOULD_NOT_THROW')
    async successMethod() {
      return 'success';
    }
  }

  const service = new TestService();

  it('should wrap error in TechnicalError with custom message', async () => {
    await expect(service.failMethod()).rejects.toThrow(TechnicalError);
    await expect(service.failMethod()).rejects.toMatchObject({
      message: 'Custom failure message',
      errorCode: 'TEST_ERROR_CODE',
      statusCode: 500,
    });
  });

  it('should generate message if not provided', async () => {
    await expect(service.failWithoutMessage()).rejects.toThrow(TechnicalError);
    await expect(service.failWithoutMessage()).rejects.toMatchObject({
      errorCode: 'NO_MESSAGE_CODE',
      statusCode: 500,
    });
  });

  it('should not throw if method succeeds', async () => {
    await expect(service.successMethod()).resolves.toBe('success');
  });

  it('should throw if applied on a non-method member', () => {
    // Simuler une mauvaise utilisation (e.g., décorateur sur une propriété)
    const target = {};
    const prop = 'notAMethod';

    // simulate descriptor undefined
    expect(() => {
      technicalFailThrows500('INVALID_USE')(target, prop, undefined as any);
    }).toThrowError(/@failThrows500 must be applied to a method/);
  });
});
