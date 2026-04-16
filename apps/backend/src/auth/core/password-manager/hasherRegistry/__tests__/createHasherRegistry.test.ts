import { createHasherRegistry } from '../createHasherRegistry.js';

describe('createHasherRegistry', () => {
  it('should return a registry with the expected keys and instances', () => {
    const registry = createHasherRegistry();

    expect(registry).toHaveProperty('argon2id:v1');
    expect(registry).toHaveProperty('bcrypt:v1');

    const argon2Hasher = registry['argon2id:v1'];
    expect(typeof argon2Hasher.hashPassword).toBe('function');
    expect(typeof argon2Hasher.comparePassword).toBe('function');

    const bcryptHasher = registry['bcrypt:v1'];
    expect(typeof bcryptHasher.hashPassword).toBe('function');
    expect(typeof bcryptHasher.comparePassword).toBe('function');
  });
});
