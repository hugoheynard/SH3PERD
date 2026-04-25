import type {
  TContractDocumentId,
  TContractDomainModel,
  TContractId,
  TContractSignature,
  TUserId,
} from '@sh3pherd/shared-types';
import type { TContractRole } from '@sh3pherd/shared-types';
import { CONTRACT_COMPANY_ROLES } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import { DomainError } from '../../utils/errorManagement/DomainError.js';

/**
 * Contract entity — represents a binding agreement between a user and a company.
 *
 * The `roles` array is the single source of truth for what a user can do
 * within a company. A single contract can carry multiple roles.
 */
export class ContractEntity extends Entity<TContractDomainModel> {
  constructor(props: TEntityInput<TContractDomainModel>) {
    super(props, 'contract');
  }

  // ── Role management ──────────────────────────────────

  /** Add a role to this contract. No-op if already present. */
  assignRole(role: TContractRole): void {
    if (this.props.roles.includes(role)) return;
    this.props = { ...this.props, roles: [...this.props.roles, role] };
  }

  /** Remove a role from this contract. Throws if not present. */
  removeRole(role: TContractRole): void {
    if (!this.props.roles.includes(role)) {
      throw new DomainError('Role not assigned to this contract', {
        code: 'CONTRACT_ROLE_NOT_FOUND',
        context: { role, contractId: this.id },
      });
    }
    this.props = { ...this.props, roles: this.props.roles.filter((r) => r !== role) };
  }

  /** Replace all roles on this contract. */
  setRoles(roles: TContractRole[]): void {
    this.props = { ...this.props, roles: [...new Set(roles)] };
  }

  hasRole(role: TContractRole): boolean {
    return this.props.roles.includes(role);
  }

  get roles(): TContractRole[] {
    return [...this.props.roles];
  }

  // ── Status queries ───────────────────────────────────

  isActive(date?: Date): boolean {
    const d = date ?? new Date();
    return this.props.startDate <= d && (this.props.endDate ? d <= this.props.endDate : true);
  }

  isSignedByUser(): boolean {
    return !!this.props.signatures?.user;
  }

  isSignedByCompany(): boolean {
    return !!this.props.signatures?.company;
  }

  getSnapshot(): { contract_id: TContractId; user_id: TUserId; roles: TContractRole[] } {
    return {
      contract_id: this.props.id,
      user_id: this.props.user_id,
      roles: this.roles,
    };
  }

  // ── Signature / lock ─────────────────────────────────

  /** Which side of the contract does this set of roles represent? */
  resolveSignerRole(roles: TContractRole[]): 'company' | 'user' {
    return roles.some((r) => CONTRACT_COMPANY_ROLES.includes(r)) ? 'company' : 'user';
  }

  /** Record a signature from one party. Throws if that side already signed. */
  addSignature(sig: TContractSignature): void {
    const side = sig.signer_role;
    if (this.props.signatures?.[side]) {
      throw new DomainError(`Contract already signed by ${side}`, {
        code: 'CONTRACT_ALREADY_SIGNED',
        context: { side, contractId: this.id },
      });
    }
    this.props = {
      ...this.props,
      signatures: { ...this.props.signatures, [side]: sig },
    };
  }

  isFullySigned(): boolean {
    return this.isSignedByUser() && this.isSignedByCompany();
  }

  /** Contract is locked for direct edits once fully signed (status active). */
  isLocked(): boolean {
    return this.props.status === 'active' && this.isFullySigned();
  }

  promoteToActive(): void {
    this.props = { ...this.props, status: 'active' };
  }

  // ── Document signature ───────────────────────────────

  /**
   * Record a signature on a specific document. Throws if the document does not
   * exist, does not require signature, or is already signed by that side.
   */
  signDocument(documentId: TContractDocumentId, sig: TContractSignature): void {
    const documents = this.props.documents ?? [];
    const idx = documents.findIndex((d) => d.id === documentId);
    if (idx === -1) {
      throw new DomainError('Document not found on this contract', {
        code: 'CONTRACT_DOCUMENT_NOT_FOUND',
        context: { documentId, contractId: this.id },
      });
    }
    const doc = documents[idx];
    if (!doc.requiresSignature) {
      throw new DomainError('Document does not require signature', {
        code: 'CONTRACT_DOCUMENT_NOT_SIGNABLE',
        context: { documentId, contractId: this.id },
      });
    }
    const side = sig.signer_role;
    if (doc.signatures?.[side]) {
      throw new DomainError(`Document already signed by ${side}`, {
        code: 'CONTRACT_DOCUMENT_ALREADY_SIGNED',
        context: { side, documentId, contractId: this.id },
      });
    }
    const updated = {
      ...doc,
      signatures: { ...doc.signatures, [side]: sig },
    };
    const next = [...documents];
    next[idx] = updated;
    this.props = { ...this.props, documents: next };
  }
}
