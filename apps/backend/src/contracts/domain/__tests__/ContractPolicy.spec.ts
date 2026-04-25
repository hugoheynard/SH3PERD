import { ContractPolicy } from '../ContractPolicy.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { makeContract, makeSignature } from './test-helpers.js';

describe('ContractPolicy', () => {
  /** Helper: capture the BusinessError thrown by `fn` and return its `code`. */
  function codeOf(fn: () => unknown): string | undefined {
    try {
      fn();
      return undefined;
    } catch (err) {
      if (err instanceof BusinessError) return err.code;
      throw err;
    }
  }

  describe('ensureEditable', () => {
    it('passes on a draft contract with no signatures', () => {
      expect(() => ContractPolicy.ensureEditable(makeContract())).not.toThrow();
    });

    it('rejects once company has signed (CONTRACT_LOCKED)', () => {
      const c = makeContract({ signatures: { company: makeSignature('company') } });
      expect(codeOf(() => ContractPolicy.ensureEditable(c))).toBe('CONTRACT_LOCKED');
    });
  });

  describe('ensureAmendable', () => {
    it('rejects a draft contract', () => {
      expect(codeOf(() => ContractPolicy.ensureAmendable(makeContract()))).toBe(
        'CONTRACT_NOT_AMENDABLE',
      );
    });

    it('rejects a company-signed-but-not-counter-signed contract', () => {
      const c = makeContract({
        status: 'draft',
        signatures: { company: makeSignature('company') },
      });
      expect(codeOf(() => ContractPolicy.ensureAmendable(c))).toBe('CONTRACT_NOT_AMENDABLE');
    });

    it('rejects a terminated contract even if it was once fully signed', () => {
      const c = makeContract({
        status: 'terminated',
        signatures: {
          company: makeSignature('company'),
          user: makeSignature('user'),
        },
      });
      expect(codeOf(() => ContractPolicy.ensureAmendable(c))).toBe('CONTRACT_NOT_AMENDABLE');
    });

    it('passes on an active fully-signed contract', () => {
      const c = makeContract({
        status: 'active',
        signatures: {
          company: makeSignature('company'),
          user: makeSignature('user'),
        },
      });
      expect(() => ContractPolicy.ensureAmendable(c)).not.toThrow();
    });

    it('passes on an active contract whose endDate has passed (extend_period revive case)', () => {
      const c = makeContract({
        status: 'active',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-12-31'),
        signatures: {
          company: makeSignature('company'),
          user: makeSignature('user'),
        },
      });
      expect(() => ContractPolicy.ensureAmendable(c)).not.toThrow();
    });
  });
});
