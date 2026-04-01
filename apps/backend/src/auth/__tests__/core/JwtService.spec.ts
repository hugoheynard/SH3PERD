import { JwtService } from '../../core/token-manager/JwtService';
import { generateKeyPairSync } from 'crypto';
import { userId } from '../test-helpers';

describe('JwtService', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  function createService(expiresIn: number | string = 900) {
    return new JwtService({
      options: {
        privateKey,
        publicKey,
        accessTokenExpiresIn: expiresIn,
      },
    });
  }

  describe('generateAuthToken', () => {
    it('should return a signed JWT string', async () => {
      const service = createService();

      const token = await service.generateAuthToken({ payload: { user_id: userId() } });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should embed the user_id in the payload', async () => {
      const service = createService();
      const uid = userId(42);

      const token = await service.generateAuthToken({ payload: { user_id: uid } });
      const result = await service.verifyAuthToken({ authToken: token });

      expect(result).not.toBeNull();
      expect(result!.user_id).toBe(uid);
    });
  });

  describe('verifyAuthToken', () => {
    it('should return the payload for a valid token', async () => {
      const service = createService();
      const uid = userId();

      const token = await service.generateAuthToken({ payload: { user_id: uid } });
      const result = await service.verifyAuthToken({ authToken: token });

      expect(result).toEqual(expect.objectContaining({ user_id: uid }));
    });

    it('should return null for an invalid token', async () => {
      const service = createService();

      const result = await service.verifyAuthToken({ authToken: 'invalid.token.here' });

      expect(result).toBeNull();
    });

    it('should return null for a token signed with a different key', async () => {
      const { privateKey: otherKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      const otherService = new JwtService({
        options: {
          privateKey: otherKey,
          publicKey,
          accessTokenExpiresIn: 900,
        },
      });

      // Sign with otherKey, verify with original publicKey
      const token = await otherService.generateAuthToken({ payload: { user_id: userId() } });
      const result = await createService().verifyAuthToken({ authToken: token });

      expect(result).toBeNull();
    });

    it('should return null for an expired token', async () => {
      const service = createService(0); // expires immediately

      const token = await service.generateAuthToken({ payload: { user_id: userId() } });
      // Small delay to ensure expiration
      await new Promise(r => setTimeout(r, 50));
      const result = await service.verifyAuthToken({ authToken: token });

      expect(result).toBeNull();
    });
  });
});
