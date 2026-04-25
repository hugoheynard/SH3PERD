import { DomainError } from '../../../utils/errorManagement/DomainError.js';
import { documentId, makeContract, makeDocument, makeSignature } from './test-helpers.js';

/** Capture the DomainError thrown by `fn` and return its `code`. */
function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (err) {
    if (err instanceof DomainError) return err.code;
    throw err;
  }
}

describe('ContractEntity', () => {
  describe('resolveSignerRole', () => {
    it('returns "company" when any role is in CONTRACT_COMPANY_ROLES', () => {
      const c = makeContract();
      expect(c.resolveSignerRole(['owner'])).toBe('company');
      expect(c.resolveSignerRole(['admin', 'artist'])).toBe('company');
      expect(c.resolveSignerRole(['rh'])).toBe('company');
    });

    it('returns "user" for roles outside CONTRACT_COMPANY_ROLES', () => {
      const c = makeContract();
      expect(c.resolveSignerRole(['artist'])).toBe('user');
      expect(c.resolveSignerRole(['viewer'])).toBe('user');
      expect(c.resolveSignerRole([])).toBe('user');
    });
  });

  describe('addSignature', () => {
    it('records the company signature on a draft contract', () => {
      const c = makeContract();
      c.addSignature(makeSignature('company'));
      expect(c.isSignedByCompany()).toBe(true);
      expect(c.isSignedByUser()).toBe(false);
    });

    it('rejects user-sign before company-sign', () => {
      const c = makeContract();
      expect(codeOf(() => c.addSignature(makeSignature('user')))).toBe('CONTRACT_NOT_SENT_YET');
    });

    it('accepts user-sign once company has signed', () => {
      const c = makeContract({ signatures: { company: makeSignature('company') } });
      c.addSignature(makeSignature('user'));
      expect(c.isFullySigned()).toBe(true);
    });

    it('rejects double signing on the same side', () => {
      const c = makeContract({ signatures: { company: makeSignature('company') } });
      expect(codeOf(() => c.addSignature(makeSignature('company')))).toBe(
        'CONTRACT_ALREADY_SIGNED',
      );
    });
  });

  describe('isLocked', () => {
    it('is false on a draft with no signatures', () => {
      expect(makeContract().isLocked()).toBe(false);
    });

    it('is true the moment the company signs (before user-sign)', () => {
      const c = makeContract({ signatures: { company: makeSignature('company') } });
      expect(c.isLocked()).toBe(true);
    });

    it('is true on an active fully-signed contract', () => {
      const c = makeContract({
        status: 'active',
        signatures: {
          company: makeSignature('company'),
          user: makeSignature('user'),
        },
      });
      expect(c.isLocked()).toBe(true);
    });
  });

  describe('signDocument', () => {
    it('rejects when the document is not on the contract', () => {
      const c = makeContract();
      expect(codeOf(() => c.signDocument(documentId(99), makeSignature('user')))).toBe(
        'CONTRACT_DOCUMENT_NOT_FOUND',
      );
    });

    it('rejects when the doc has requiresSignature=false', () => {
      const c = makeContract({
        documents: [makeDocument({ requiresSignature: false })],
      });
      expect(codeOf(() => c.signDocument(documentId(), makeSignature('user')))).toBe(
        'CONTRACT_DOCUMENT_NOT_SIGNABLE',
      );
    });

    it('records the user signature on a signable doc', () => {
      const c = makeContract({
        documents: [makeDocument({ requiresSignature: true })],
      });
      c.signDocument(documentId(), makeSignature('user'));
      const doc = c.toDomain.documents?.[0];
      expect(doc?.signatures?.user).toBeDefined();
      expect(doc?.signatures?.company).toBeUndefined();
    });

    it('rejects double-sign on the same side', () => {
      const c = makeContract({
        documents: [
          makeDocument({
            requiresSignature: true,
            signatures: { user: makeSignature('user') },
          }),
        ],
      });
      expect(codeOf(() => c.signDocument(documentId(), makeSignature('user')))).toBe(
        'CONTRACT_DOCUMENT_ALREADY_SIGNED',
      );
    });

    it('document signing has no order constraint (independent of contract sign flow)', () => {
      // Per sh3-contracts.md: per-document signatures are independent
      // of the contract-level dual-sign. Either side can sign first.
      const c = makeContract({
        documents: [makeDocument({ requiresSignature: true })],
      });
      expect(() => c.signDocument(documentId(), makeSignature('company'))).not.toThrow();
    });
  });

  describe('promoteToActive', () => {
    it('flips the status to active', () => {
      const c = makeContract();
      c.promoteToActive();
      expect(c.toDomain.status).toBe('active');
    });
  });
});
