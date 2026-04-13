import { hashToken } from '../hashToken.js';

describe('hashToken', () => {
  it('should return a hex string of 64 chars (SHA-256)', () => {
    const result = hashToken('refreshToken_abc-123');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should be deterministic — same input always produces same hash', () => {
    const token = 'refreshToken_test-deterministic';
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('should produce different hashes for different tokens', () => {
    const hash1 = hashToken('refreshToken_aaa');
    const hash2 = hashToken('refreshToken_bbb');
    expect(hash1).not.toBe(hash2);
  });

  it('should not return the original token', () => {
    const token = 'refreshToken_should-not-appear';
    const hash = hashToken(token);
    expect(hash).not.toContain(token);
    expect(hash).not.toBe(token);
  });
});
