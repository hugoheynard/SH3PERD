import { LoginCommand, LoginHandler } from '../LoginCommand.js';
import {
  mockUserCredentialsRepo,
  mockPasswordService,
  mockAuthService,
} from '../../../__tests__/test-helpers.js';
import { makeCredentialsRecord } from '../../../../user/__tests__/test-helpers.js';
import { BusinessError } from '../../../../utils/errorManagement/BusinessError.js';

describe('LoginHandler', () => {
  function createHandler() {
    const userCredRepo = mockUserCredentialsRepo();
    const passwordService = mockPasswordService();
    const authService = mockAuthService();

    const handler = new (LoginHandler as any)(
      userCredRepo,
      passwordService,
      authService,
    ) as LoginHandler;
    return { handler, userCredRepo, passwordService, authService };
  }

  const validUser = makeCredentialsRecord();

  describe('execute', () => {
    it('should return auth token and user_id on successful login', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      const result = await handler.execute(
        new LoginCommand({ email: 'test@example.com', password: 'correct' }),
      );

      expect(result.authToken).toBeDefined();
      expect(result.user_id).toBe(validUser.id);
      expect(result.refreshTokenSecureCookie).toBeDefined();
    });

    it('should throw INVALID_CREDENTIALS when user is not found', async () => {
      const { handler, userCredRepo } = createHandler();
      userCredRepo.findOne.mockResolvedValue(null);

      await expect(
        handler.execute(new LoginCommand({ email: 'unknown@test.com', password: 'any' })),
      ).rejects.toThrow(BusinessError);

      try {
        await handler.execute(new LoginCommand({ email: 'unknown@test.com', password: 'any' }));
      } catch (e) {
        expect((e as BusinessError).code).toBe('INVALID_CREDENTIALS');
        expect((e as BusinessError).status).toBe(400);
      }
    });

    it('should throw USER_DEACTIVATED when user account is inactive', async () => {
      const { handler, userCredRepo } = createHandler();
      userCredRepo.findOne.mockResolvedValue({ ...validUser, active: false });

      try {
        await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'correct' }));
        fail('Should have thrown');
      } catch (e) {
        expect((e as BusinessError).code).toBe('USER_DEACTIVATED');
        expect((e as BusinessError).status).toBe(403);
      }
    });

    it('should throw INVALID_CREDENTIALS when password is wrong', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: false, wasRehashed: false });

      try {
        await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'wrong' }));
        fail('Should have thrown');
      } catch (e) {
        expect((e as BusinessError).code).toBe('INVALID_CREDENTIALS');
      }
    });

    it('should persist re-hashed password when algorithm was upgraded', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({
        isValid: true,
        wasRehashed: true,
        newHash: 'argon2id:v1$upgraded-hash',
      });

      await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'correct' }));

      expect(userCredRepo.updateOne).toHaveBeenCalledWith({
        filter: { id: validUser.id },
        update: { $set: { password: 'argon2id:v1$upgraded-hash' } },
      });
    });

    it('should NOT call updateOne when password was not re-hashed', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'correct' }));

      expect(userCredRepo.updateOne).not.toHaveBeenCalled();
    });

    it('should create auth session with the user id', async () => {
      const { handler, userCredRepo, passwordService, authService } = createHandler();
      userCredRepo.findOne.mockResolvedValue(validUser);
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'correct' }));

      expect(authService.createAuthSession).toHaveBeenCalledWith({ user_id: validUser.id });
    });

    // ── Account lockout tests ─────────────────────────────
    it('should increment failed_login_count on wrong password', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue({ ...validUser, failed_login_count: 2 });
      passwordService.comparePassword.mockResolvedValue({ isValid: false, wasRehashed: false });

      await expect(
        handler.execute(new LoginCommand({ email: 'test@example.com', password: 'wrong' })),
      ).rejects.toThrow(BusinessError);

      expect(userCredRepo.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { $set: { failed_login_count: 3 } },
        }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue({ ...validUser, failed_login_count: 4 });
      passwordService.comparePassword.mockResolvedValue({ isValid: false, wasRehashed: false });

      await expect(
        handler.execute(new LoginCommand({ email: 'test@example.com', password: 'wrong' })),
      ).rejects.toThrow(BusinessError);

      expect(userCredRepo.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            $set: expect.objectContaining({
              failed_login_count: 5,
              locked_until: expect.any(Date),
            }),
          },
        }),
      );
    });

    it('should reject login when account is locked', async () => {
      const { handler, userCredRepo } = createHandler();
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // locked for 10 more mins
      userCredRepo.findOne.mockResolvedValue({
        ...validUser,
        failed_login_count: 5,
        locked_until: futureDate,
      });

      try {
        await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'correct' }));
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as any).message).toContain('Account temporarily locked');
      }
    });

    it('should allow login after lockout period expires', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      const pastDate = new Date(Date.now() - 1000); // lock expired 1s ago
      userCredRepo.findOne.mockResolvedValue({
        ...validUser,
        failed_login_count: 5,
        locked_until: pastDate,
      });
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      const result = await handler.execute(
        new LoginCommand({ email: 'test@example.com', password: 'correct' }),
      );

      expect(result.authToken).toBeDefined();
      // Should reset the counter
      expect(userCredRepo.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { $set: { failed_login_count: 0, locked_until: null } },
        }),
      );
    });

    it('should reset failed counter on successful login', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      userCredRepo.findOne.mockResolvedValue({ ...validUser, failed_login_count: 3 });
      passwordService.comparePassword.mockResolvedValue({ isValid: true, wasRehashed: false });

      await handler.execute(new LoginCommand({ email: 'test@example.com', password: 'correct' }));

      expect(userCredRepo.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { $set: { failed_login_count: 0, locked_until: null } },
        }),
      );
    });

    /* ── Concurrent lockout race documentation ──
     * The handler reads `failed_login_count` with `findOne`, then
     * writes the new value via `$set: { failed_login_count: n + 1 }`.
     * That's a non-atomic read-modify-write: two simultaneous failed
     * attempts at the same count will both compute the same n+1 and
     * both write it, effectively losing one increment.
     *
     * In practice this is benign for lockout ENFORCEMENT — the lock
     * threshold is 5, so both racers crossing from 4→5 still trigger
     * the lock. The window is only problematic at lower counts: an
     * attacker firing bursts of K concurrent attempts at count=3 may
     * observe count lag by up to K-1 before the lock lands, giving
     * a small effective-attempts bonus per window.
     *
     * The test pins the current behaviour so any future switch to an
     * atomic `$inc` / conditional update surfaces clearly in the diff.
     * If you hit this and want the stricter semantics, the fix is in
     * the handler's update call — not here.
     */
    it('[race] two concurrent 5th attempts both compute count=5 and both attempt the lock', async () => {
      const { handler, userCredRepo, passwordService } = createHandler();
      // Both reads return the same snapshot — the lost-update scenario.
      userCredRepo.findOne.mockResolvedValue({ ...validUser, failed_login_count: 4 });
      passwordService.comparePassword.mockResolvedValue({ isValid: false, wasRehashed: false });

      const results = await Promise.allSettled([
        handler.execute(new LoginCommand({ email: 'test@example.com', password: 'wrong' })),
        handler.execute(new LoginCommand({ email: 'test@example.com', password: 'wrong' })),
      ]);

      // Both fail with INVALID_CREDENTIALS (the handler rejects on wrong
      // password before looking at the lock, then attempts the update).
      expect(results.every((r) => r.status === 'rejected')).toBe(true);
      for (const r of results) {
        if (r.status === 'rejected') {
          expect(r.reason).toBeInstanceOf(BusinessError);
        }
      }

      // Both invocations independently computed failed_login_count: 5
      // and attempted the lock write — read-modify-write is not atomic.
      const lockingCalls = userCredRepo.updateOne.mock.calls.filter((call: unknown[]) => {
        const update = (call[0] as { update?: { $set?: { failed_login_count?: number } } })?.update;
        return update?.$set?.failed_login_count === 5;
      });
      expect(lockingCalls).toHaveLength(2);
      for (const call of lockingCalls) {
        expect(call[0]).toEqual(
          expect.objectContaining({
            update: {
              $set: expect.objectContaining({
                failed_login_count: 5,
                locked_until: expect.any(Date),
              }),
            },
          }),
        );
      }

      // Note on impact: the 6th attempt would read the latest write
      // (count=5, locked_until in future) and be rejected by the
      // lock-check branch, so no bypass of the lock itself. The race
      // only matters for COUNT fidelity at intermediate values.
    });
  });
});
