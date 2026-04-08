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
   * Ungroup a node: move all its children up to its parent, then archive the node.
   * The inverse of groupNodes().
   */
  ungroupNode(nodeId: TOrgNodeId): void {
    const node = this.findNode(nodeId);
    if (!node) throw new Error('ORGNODE_NOT_FOUND');

    const nodeParentId = node.toDomain.parent_id;

    // Re-parent all children to the node's parent
    const children = this.nodes.filter(n => n.toDomain.parent_id === nodeId && n.toDomain.status === 'active');
    for (const child of children) {
      child.setParent(nodeParentId as TOrgNodeId | undefined);
    }

    // Remove the now-empty node (children were already moved)
    this.removeNode(nodeId);
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

  /**
   * Group selected sibling nodes under a new parent.
   *
   * 1. Validates all selected nodes are active siblings (same parent_id)
   * 2. Creates a new parent node at the same level
   * 3. Re-parents each selected node under the new parent
   */
  groupNodes(parentName: string, nodeIds: TOrgNodeId[]): OrgNodeEntity {
    // Validate all nodes exist and are active
    const selected = nodeIds.map(id => {
      const node = this.findNode(id);
      if (!node) throw new Error('ORGNODE_NOT_FOUND');
      if (node.toDomain.status !== 'active') throw new Error('ORGNODE_NOT_ACTIVE');
      return node;
    });

    // Validate all are siblings (same parent_id)
    const commonParentId = selected[0].toDomain.parent_id;
    if (!selected.every(n => n.toDomain.parent_id === commonParentId)) {
      throw new Error('ORGNODE_NOT_SIBLINGS');
    }

    // Create new parent at the same level
    const newParent = this.addOrgNode({
      company_id: this.id,
      name: parentName,
      parent_id: commonParentId,
    });

    // Re-parent each selected node
    for (const node of selected) {
      node.setParent(newParent.id as TOrgNodeId);
    }

    return newParent;
  }
}
