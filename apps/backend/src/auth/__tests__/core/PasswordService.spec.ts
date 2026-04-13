import { PasswordService } from '../../core/password-manager/PasswordService';
import type { IHasherStrategy } from '../../core/password-manager/types/Interfaces';

describe('PasswordService', () => {
  // Simple mock hasher that prefixes with "hashed:" for testing
  const mockHasher: jest.Mocked<IHasherStrategy> = {
    hashPassword: jest
      .fn()
      .mockImplementation(({ password }) =>
        Promise.resolve(`argon2:::argon2id:::v1:::2026-01-01:::hashed_${password}`),
      ),
    comparePassword: jest.fn().mockImplementation(({ password, hashedPassword }) =>
      Promise.resolve({
        isValid: hashedPassword.endsWith(`hashed_${password}`),
        wasRehashed: false,
      }),
    ),
  };

  const oldHasher: jest.Mocked<IHasherStrategy> = {
    hashPassword: jest
      .fn()
      .mockImplementation(({ password }) =>
        Promise.resolve(`bcrypt:::$2b$:::v1:::2024-01-01:::old_${password}`),
      ),
    comparePassword: jest.fn().mockImplementation(({ password, hashedPassword }) =>
      Promise.resolve({
        isValid: hashedPassword.endsWith(`old_${password}`),
        wasRehashed: false,
      }),
    ),
  };

  function createService(currentKey = 'argon2id:v1', rehashAfterDays = 30) {
    // Reset mocks
    mockHasher.hashPassword.mockClear();
    mockHasher.comparePassword.mockClear();
    oldHasher.hashPassword.mockClear();
    oldHasher.comparePassword.mockClear();

    return new PasswordService({
      currentStrategyKey: currentKey,
      registry: {
        'argon2id:v1': mockHasher,
        '$2b$:v1': oldHasher,
      },
      rehashAfterDays,
    });
  }

  describe('constructor', () => {
    it('should throw if the strategy key is not in the registry', () => {
      expect(
        () =>
          new PasswordService({
            currentStrategyKey: 'unknown:v1',
            registry: { 'argon2id:v1': mockHasher },
            rehashAfterDays: 30,
          }),
      ).toThrow('Invalid strategy key');
    });
  });

  describe('hashPassword', () => {
    it('should hash using the current strategy', async () => {
      const service = createService();

      const hash = await service.hashPassword({ password: 'myPassword' });

      expect(mockHasher.hashPassword).toHaveBeenCalledWith({ password: 'myPassword' });
      expect(hash).toContain('hashed_myPassword');
    });
  });

  describe('comparePassword', () => {
    it('should return isValid=true for a correct password', async () => {
      const service = createService();
      const hash = 'argon2:::argon2id:::v1:::2026-01-01:::hashed_correct';

      const result = await service.comparePassword({ password: 'correct', hashedPassword: hash });

      expect(result.isValid).toBe(true);
    });

    it('should return isValid=false for a wrong password', async () => {
      const service = createService();
      const hash = 'argon2:::argon2id:::v1:::2026-01-01:::hashed_correct';

      const result = await service.comparePassword({ password: 'wrong', hashedPassword: hash });

      expect(result.isValid).toBe(false);
      expect(result.wasRehashed).toBe(false);
    });

    it('should rehash when the strategy has changed', async () => {
      const service = createService('argon2id:v1');
      // Hash made with old bcrypt strategy
      const oldHash = 'bcrypt:::$2b$:::v1:::2024-01-01:::old_mypass';

      const result = await service.comparePassword({ password: 'mypass', hashedPassword: oldHash });

      expect(result.isValid).toBe(true);
      expect(result.wasRehashed).toBe(true);
      expect(result.newHash).toContain('hashed_mypass');
      expect(mockHasher.hashPassword).toHaveBeenCalledWith({ password: 'mypass' });
    });

    it('should rehash when hash date exceeds rehashAfterDays', async () => {
      const service = createService('argon2id:v1', 30);
      // Hash date far in the past
      const oldHash = 'argon2:::argon2id:::v1:::2020-01-01:::hashed_mypass';

      const result = await service.comparePassword({ password: 'mypass', hashedPassword: oldHash });

      expect(result.isValid).toBe(true);
      expect(result.wasRehashed).toBe(true);
    });

    it('should NOT rehash when hash is recent and same strategy', async () => {
      const service = createService('argon2id:v1', 30);
      const today = new Date().toISOString().split('T')[0];
      const recentHash = `argon2:::argon2id:::v1:::${today}:::hashed_mypass`;

      const result = await service.comparePassword({
        password: 'mypass',
        hashedPassword: recentHash,
      });

      expect(result.isValid).toBe(true);
      expect(result.wasRehashed).toBe(false);
    });

    it('should throw for an unsupported hash strategy', async () => {
      const service = createService();
      const unknownHash = 'scrypt:::scrypt:::v1:::2024-01-01:::somehash';

      await expect(
        service.comparePassword({ password: 'test', hashedPassword: unknownHash }),
      ).rejects.toThrow('Unsupported hash strategy');
    });
  });
});
