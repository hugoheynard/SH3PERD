import { AggregateRoot } from '@nestjs/cqrs';
import { CompanyEntity } from './CompanyEntity.js';
import { OrgNodeEntity } from './OrgNodeEntity.js';
import { CompanyPolicy } from './CompanyPolicy.js';
import type {
  TCompanyId,
  TOrgNodeId,
} from '@sh3pherd/shared-types';
import type { TTeamType } from '@sh3pherd/shared-types';

/**
 * Aggregate root for the Company domain.
 *
 * Composes:
 * - The company entity (identity, settings, integrations)
 * - The org node tree (structural hierarchy)
 *
 * Used for **structural operations** (create/delete/move nodes).
 * Per-node mutations (addMember, etc.) stay on OrgNodeEntity standalone.
 */
export class CompanyAggregate extends AggregateRoot {

  private readonly _originalNodeIds: Set<string>;
  private readonly _removedNodes: OrgNodeEntity[] = [];

  constructor(
    private readonly company: CompanyEntity,
    private readonly nodes: OrgNodeEntity[],
    private readonly policy: CompanyPolicy = new CompanyPolicy(),
  ) {
    super();
    this._originalNodeIds = new Set(nodes.map(n => n.id));
  }

  /* ── Identity ── */

  get id(): TCompanyId {
    return this.company.id;
  }

  get companyEntity(): CompanyEntity {
    return this.company;
  }

  /* ── Dirty tracking ── */

  /** Nodes added after load (not in original set). */
  get newNodes(): OrgNodeEntity[] {
    return this.nodes.filter(n => !this._originalNodeIds.has(n.id));
  }

  /** Nodes removed since load. */
  get removedNodes(): readonly OrgNodeEntity[] {
    return this._removedNodes;
  }

  /** Nodes that existed at load and still exist. */
  get existingNodes(): OrgNodeEntity[] {
    return this.nodes.filter(n => this._originalNodeIds.has(n.id));
  }

  /* ── Constraints ── */

  /** Max allowed depth (0-indexed). Derived from company orgLayers count. */
  get maxDepth(): number {
    return this.company.orgLayers.length - 1;
  }

  /* ── Query ── */

  findNode(nodeId: TOrgNodeId): OrgNodeEntity | undefined {
    return this.nodes.find(n => n.id === nodeId);
  }

  /* ── Structural commands ── */

  /**
   * Add a new org node to the company hierarchy.
   * Enforces: company active, parent valid, max depth, name uniqueness.
   */
  addOrgNode(dto: {
    company_id: TCompanyId;
    name: string;
    parent_id?: TOrgNodeId;
    type?: TTeamType;
    color?: string;
  }): OrgNodeEntity {
    this.policy.ensureIsActive(this.company);

    if (dto.parent_id) {
      this.policy.ensureParentBelongsToCompany(dto.parent_id, this.nodes);
      this.policy.ensureParentIsActive(dto.parent_id, this.nodes);
      this.policy.ensureMaxDepthNotExceeded(dto.parent_id, this.nodes, this.maxDepth);
    }

    this.policy.ensureNameUniqueAmongSiblings(dto.name, dto.parent_id, this.nodes);

    // Auto-assign position: append after last sibling
    const siblings = this.nodes.filter(n =>
      n.toDomain.parent_id === dto.parent_id && n.toDomain.status === 'active',
    );
    const nextPosition = siblings.length > 0
      ? Math.max(...siblings.map(n => n.toDomain.position ?? 0)) + 1
      : 0;

    const node = new OrgNodeEntity({
      company_id: dto.company_id,
      name: dto.name,
      parent_id: dto.parent_id,
      type: dto.type,
      color: dto.color,
      position: nextPosition,
      communications: [],
      members: [],
      guest_members: [],
      status: 'active',
    });

    this.nodes.push(node);
    return node;
  }

  /**
   * Remove an org node. Must have no children.
   * Returns the removed entity for cleanup.
   */
  removeNode(nodeId: TOrgNodeId): OrgNodeEntity {
    const idx = this.nodes.findIndex(n => n.id === nodeId);
    if (idx === -1) throw new Error('ORGNODE_NOT_FOUND');

    this.policy.ensureNodeHasNoChildren(nodeId, this.nodes);

    const [removed] = this.nodes.splice(idx, 1);
    this._removedNodes.push(removed);
    return removed;
  }
}
