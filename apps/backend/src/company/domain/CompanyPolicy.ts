import type { TOrgNodeId, TUserId } from '@sh3pherd/shared-types';
import { TCompanyStatus } from '@sh3pherd/shared-types';
import type { CompanyEntity } from './CompanyEntity.js';
import type { OrgNodeEntity } from './OrgNodeEntity.js';

/**
 * Business rules enforcement for the Company domain.
 *
 * Centralizes all invariants so handlers stay thin.
 * Each method either passes silently or throws with an explicit error code.
 */
export class CompanyPolicy {
  // ── Ownership ───────────────────────────────────────────

  /** Ensures the actor is the company owner. */
  ensureIsOwner(actorId: TUserId, entity: CompanyEntity): void {
    if (!entity.isOwnedBy(actorId)) {
      throw new Error('COMPANY_NOT_OWNED');
    }
  }

  // ── Status ──────────────────────────────────────────────

  /** Ensures the company is active. */
  ensureIsActive(entity: CompanyEntity): void {
    if (entity.status !== TCompanyStatus.ACTIVE) {
      throw new Error('COMPANY_NOT_ACTIVE');
    }
  }

  // ── Org chart structural rules ─────────────────────────

  /** Ensures the parent node belongs to the same company. */
  ensureParentBelongsToCompany(parentId: TOrgNodeId, nodes: OrgNodeEntity[]): void {
    if (!nodes.some((n) => n.id === parentId)) {
      throw new Error('ORGNODE_PARENT_NOT_IN_COMPANY');
    }
  }

  /** Ensures the parent node is not archived. */
  ensureParentIsActive(parentId: TOrgNodeId, nodes: OrgNodeEntity[]): void {
    const parent = nodes.find((n) => n.id === parentId);
    if (parent?.isArchived()) {
      throw new Error('ORGNODE_PARENT_ARCHIVED');
    }
  }

  /**
   * Ensures adding a child under parentId would not exceed maxDepth.
   * Walks the parent chain from parentId to root, counting depth.
   */
  ensureMaxDepthNotExceeded(parentId: TOrgNodeId, nodes: OrgNodeEntity[], maxDepth: number): void {
    let depth = 0;
    let currentId: TOrgNodeId | undefined = parentId;

    while (currentId) {
      depth++;
      const node = nodes.find((n) => n.id === currentId);
      currentId = node?.toDomain.parent_id;
    }

    if (depth > maxDepth) {
      throw new Error('ORGNODE_MAX_DEPTH_EXCEEDED');
    }
  }

  /** Ensures no active sibling has the same name (case-insensitive). */
  ensureNameUniqueAmongSiblings(
    name: string,
    parentId: TOrgNodeId | undefined,
    nodes: OrgNodeEntity[],
  ): void {
    const normalized = name.trim().toLowerCase();
    const siblings = nodes.filter((n) => {
      const domain = n.toDomain;
      return domain.parent_id === parentId && !n.isArchived();
    });

    if (siblings.some((s) => s.toDomain.name.toLowerCase() === normalized)) {
      throw new Error('ORGNODE_SIBLING_NAME_DUPLICATE');
    }
  }

  /** Ensures the node has no children (required before deletion). */
  ensureNodeHasNoChildren(nodeId: TOrgNodeId, nodes: OrgNodeEntity[]): void {
    if (nodes.some((n) => n.toDomain.parent_id === nodeId)) {
      throw new Error('ORGNODE_HAS_CHILDREN');
    }
  }
}
