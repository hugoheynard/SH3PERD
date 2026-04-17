import { ContractContextGuard } from './contract-context.guard.js';
import type { Reflector } from '@nestjs/core';
import { CONTRACT_SCOPED_KEY } from '../../utils/nest/decorators/ContractScoped.js';
import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jest } from '@jest/globals';
import type { TContractId, TUserId } from '@sh3pherd/shared-types';

/**
 * Shape helpers — minimal repo doubles. We only call the methods the guard
 * uses (`findOne`), so we don't need a full interface mock here.
 */
type MockRepo = { findOne: jest.Mock };

type MockReq = {
  headers: Record<string, string | undefined>;
  user_id: TUserId;
  contract_id?: TContractId;
  contract_roles?: string[];
};

function mockContext(
  req: MockReq,
  reflectorReturn: boolean,
): { ctx: ExecutionContext; req: MockReq; reflector: Reflector } {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(reflectorReturn),
  } as unknown as Reflector;

  const ctx = {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;

  return { ctx, req, reflector };
}

describe('ContractContextGuard', () => {
  let userPrefsRepo: MockRepo;
  let contractRepo: MockRepo;

  const USER = 'user_42' as TUserId;
  const CONTRACT = 'contract_abc' as TContractId;

  beforeEach(() => {
    userPrefsRepo = { findOne: jest.fn() };
    contractRepo = { findOne: jest.fn() };
  });

  function makeGuard(reflectorReturn: boolean): {
    guard: ContractContextGuard;
    reflector: Reflector;
  } {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(reflectorReturn),
    } as unknown as Reflector;
    const guard = new ContractContextGuard(
      userPrefsRepo as never,
      contractRepo as never,
      reflector,
    );
    return { guard, reflector };
  }

  /* ── Pass-through when the route isn't @ContractScoped ── */

  it('should pass through without touching repos when the route is not @ContractScoped', async () => {
    const { guard, reflector } = makeGuard(false);
    const req: MockReq = { headers: {}, user_id: USER };

    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      CONTRACT_SCOPED_KEY,
      expect.any(Array),
    );
    expect(contractRepo.findOne).not.toHaveBeenCalled();
    expect(userPrefsRepo.findOne).not.toHaveBeenCalled();
    // Nothing attached when the guard passes through
    expect(req.contract_id).toBeUndefined();
    expect(req.contract_roles).toBeUndefined();
  });

  /* ── Resolution order: header first, then DB fallback ── */

  describe('resolution order', () => {
    it('should prefer X-Contract-Id header over user preferences', async () => {
      const { guard } = makeGuard(true);
      const req: MockReq = {
        headers: { 'x-contract-id': CONTRACT },
        user_id: USER,
      };
      contractRepo.findOne.mockResolvedValue({
        id: CONTRACT,
        user_id: USER,
        roles: ['owner'],
      });

      await guard.canActivate(
        mockContext(req, true).ctx, // ctx ignored, using shape above
      );

      // Fallback repo never touched when header wins
      expect(userPrefsRepo.findOne).not.toHaveBeenCalled();
      expect(contractRepo.findOne).toHaveBeenCalledWith({
        filter: { id: CONTRACT, user_id: USER },
      });
      expect(req.contract_id).toBe(CONTRACT);
      expect(req.contract_roles).toEqual(['owner']);
    });

    it('should fall back to user preferences when the header is missing', async () => {
      const { guard } = makeGuard(true);
      const req: MockReq = { headers: {}, user_id: USER };
      userPrefsRepo.findOne.mockResolvedValue({
        id: 'pref_1',
        user_id: USER,
        contract_workspace: CONTRACT,
        theme: 'dark',
      });
      contractRepo.findOne.mockResolvedValue({
        id: CONTRACT,
        user_id: USER,
        roles: ['admin', 'member'],
      });

      await guard.canActivate(mockContext(req, true).ctx);

      expect(userPrefsRepo.findOne).toHaveBeenCalledWith({
        filter: { user_id: USER },
      });
      expect(contractRepo.findOne).toHaveBeenCalledWith({
        filter: { id: CONTRACT, user_id: USER },
      });
      expect(req.contract_id).toBe(CONTRACT);
      expect(req.contract_roles).toEqual(['admin', 'member']);
    });

    it('should ignore a non-string X-Contract-Id header (defensive against array headers)', async () => {
      const { guard } = makeGuard(true);
      // Express can surface repeated headers as arrays — the guard's
      // `typeof !== 'string'` check protects against that shape.
      const req: MockReq = {
        headers: { 'x-contract-id': ['a', 'b'] as unknown as string },
        user_id: USER,
      };
      userPrefsRepo.findOne.mockResolvedValue({
        id: 'pref_1',
        user_id: USER,
        contract_workspace: CONTRACT,
        theme: 'light',
      });
      contractRepo.findOne.mockResolvedValue({
        id: CONTRACT,
        user_id: USER,
        roles: [],
      });

      await guard.canActivate(mockContext(req, true).ctx);

      // Fell back to preferences — header was rejected
      expect(userPrefsRepo.findOne).toHaveBeenCalled();
      expect(req.contract_id).toBe(CONTRACT);
    });
  });

  /* ── Rejection paths ── */

  describe('rejection paths', () => {
    it('should throw 401 "no contract context" when both header and preferences are missing', async () => {
      const { guard } = makeGuard(true);
      const req: MockReq = { headers: {}, user_id: USER };
      userPrefsRepo.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockContext(req, true).ctx)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(contractRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw 401 when the contract does not belong to the authenticated user', async () => {
      // Tenant isolation: a user passing someone else's contract id must
      // not get access. The guard's `findOne` filter scopes by user_id so
      // a foreign contract returns `null`, which triggers the 401.
      const { guard } = makeGuard(true);
      const req: MockReq = {
        headers: { 'x-contract-id': CONTRACT },
        user_id: USER,
      };
      contractRepo.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockContext(req, true).ctx)).rejects.toThrow(
        new UnauthorizedException('Contract not found or does not belong to this user'),
      );
      expect(req.contract_id).toBeUndefined();
      expect(req.contract_roles).toBeUndefined();
    });

    it('should throw 401 when the preferences record exists but has no contract_workspace', async () => {
      const { guard } = makeGuard(true);
      const req: MockReq = { headers: {}, user_id: USER };
      userPrefsRepo.findOne.mockResolvedValue({
        id: 'pref_1',
        user_id: USER,
        contract_workspace: null,
        theme: 'dark',
      });

      await expect(guard.canActivate(mockContext(req, true).ctx)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(contractRepo.findOne).not.toHaveBeenCalled();
    });
  });

  /* ── Role propagation contract ── */

  it('should default contract_roles to [] when the contract record has no roles field', async () => {
    const { guard } = makeGuard(true);
    const req: MockReq = {
      headers: { 'x-contract-id': CONTRACT },
      user_id: USER,
    };
    contractRepo.findOne.mockResolvedValue({
      id: CONTRACT,
      user_id: USER,
      // no roles
    });

    await guard.canActivate(mockContext(req, true).ctx);

    expect(req.contract_roles).toEqual([]);
  });
});
