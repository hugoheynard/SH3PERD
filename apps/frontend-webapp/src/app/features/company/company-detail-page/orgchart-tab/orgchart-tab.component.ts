import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgChartStore } from '../../orgchart.store';
import { LayoutService } from '../../../../core/services/layout.service';
import { NodeSettingsPopoverComponent, type TNodeSettingsPopoverData } from '../../popovers/node-settings-popover/node-settings-popover.component';
import type {
  TCompanyId,
  TOrgNodeHierarchyViewModel,
  TOrgNodeId,
  TUserId,
} from '@sh3pherd/shared-types';

/** Preset color palette for root nodes */
const NODE_PALETTE = [
  '#63b3ed', '#68d391', '#f6ad55', '#fc8181', '#b794f4',
  '#76e4f7', '#fbb6ce', '#f6e05e', '#4fd1c5', '#a3bffa',
] as const;

@Component({
  selector: 'app-orgchart-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orgchart-tab.component.html',
  styleUrl: './orgchart-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgchartTabComponent {
  readonly store = inject(OrgChartStore);
  private readonly layout = inject(LayoutService);

  readonly companyId = input.required<TCompanyId>();

  readonly editMode = signal(false);
  readonly expandedNodes = signal<Set<string>>(new Set());

  // Node creation state
  readonly addingNode = signal(false);
  readonly newNodeName = signal('');
  readonly newNodeParentId = signal<string | undefined>(undefined);
  readonly newNodeColor = signal<string>(NODE_PALETTE[0]);
  readonly colorPalette = NODE_PALETTE;

  // ── Edit mode ───────────────────────────────────────────

  toggleEditMode(): void {
    const entering = !this.editMode();
    this.editMode.set(entering);
    if (!entering) this.cancelAddNode();
  }

  // ── Expand / collapse ───────────────────────────────────

  toggleNode(nodeId: string): void {
    const s = new Set(this.expandedNodes());
    s.has(nodeId) ? s.delete(nodeId) : s.add(nodeId);
    this.expandedNodes.set(s);
  }

  isNodeExpanded(nodeId: string): boolean {
    return this.expandedNodes().has(nodeId);
  }

  // ── Layer labels ────────────────────────────────────────

  getLayerLabel(depth: number): string {
    const chart = this.store.orgChart();
    return chart?.orgLayers?.[depth] ?? `Level ${depth}`;
  }

  // ── Member helpers ──────────────────────────────────────

  memberCount(node: TOrgNodeHierarchyViewModel): number {
    return node.members.length + (node.guest_members?.length ?? 0);
  }

  totalDescendantMembers(node: TOrgNodeHierarchyViewModel): number {
    return this.getDescendantAvatars(node).length;
  }

  /**
   * Collects all unique member/guest avatars from a node and all its descendants.
   * Members are deduplicated by user_id. Guests are always included.
   * Returns a flat array suitable for avatar stack rendering.
   */
  getDescendantAvatars(node: TOrgNodeHierarchyViewModel): { id: string; label: string; initials: string; isGuest: boolean }[] {
    const memberMap = new Map<string, { id: string; label: string; initials: string; isGuest: boolean }>();
    const guests: { id: string; label: string; initials: string; isGuest: boolean }[] = [];

    const walk = (n: TOrgNodeHierarchyViewModel): void => {
      for (const m of n.members) {
        if (!memberMap.has(m.user_id)) {
          const name = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();
          memberMap.set(m.user_id, {
            id: m.user_id,
            label: name || m.user_id,
            initials: this.getInitials(m.first_name),
            isGuest: false,
          });
        }
      }
      for (const g of (n.guest_members ?? [])) {
        guests.push({
          id: g.id,
          label: g.display_name + (g.title ? ` · ${g.title}` : ''),
          initials: g.display_name[0]?.toUpperCase() ?? '?',
          isGuest: true,
        });
      }
      for (const child of n.children) walk(child);
    };

    walk(node);
    return [...memberMap.values(), ...guests];
  }

  // ── Color system ────────────────────────────────────────

  getNodeColorForDepth(node: TOrgNodeHierarchyViewModel, depth: number, rootColor?: string): string {
    if (depth === 0) return node.color || NODE_PALETTE[0];
    const base = rootColor || NODE_PALETTE[0];
    const pct = Math.max(40, 100 - depth * 20);
    return `color-mix(in srgb, ${base} ${pct}%, var(--card-color, #2c323d))`;
  }

  getRootColor(node: TOrgNodeHierarchyViewModel): string {
    return node.color || NODE_PALETTE[0];
  }

  // ── Node creation ───────────────────────────────────────

  startAddNode(parentId?: string): void {
    this.newNodeParentId.set(parentId);
    this.newNodeColor.set(NODE_PALETTE[0]);
    this.addingNode.set(true);
    // Auto-expand the parent so the inline form is visible
    if (parentId && !this.isNodeExpanded(parentId)) {
      this.toggleNode(parentId);
    }
  }

  cancelAddNode(): void {
    this.addingNode.set(false);
    this.newNodeName.set('');
    this.newNodeParentId.set(undefined);
  }

  confirmAddNode(): void {
    const name = this.newNodeName().trim();
    if (!name) return;

    const isRoot = !this.newNodeParentId();
    this.store.createOrgNode(
      {
        company_id: this.companyId(),
        name,
        parent_id: this.newNodeParentId() as any,
        ...(isRoot ? { color: this.newNodeColor() } : {}),
      },
      () => this.store.loadOrgChart(this.companyId()),
    );
    this.newNodeName.set('');
    this.addingNode.set(false);
    this.newNodeParentId.set(undefined);
  }

  onNodeNameInput(event: Event): void {
    this.newNodeName.set((event.target as HTMLInputElement).value);
  }

  selectColor(color: string): void {
    this.newNodeColor.set(color);
  }

  // ── Member assignment ───────────────────────────────────

  openAddMemberPopover(node: TOrgNodeHierarchyViewModel, depth: number): void {
    this.layout.setPopover<NodeSettingsPopoverComponent, TNodeSettingsPopoverData>(
      NodeSettingsPopoverComponent,
      { node, companyId: this.companyId(), depth, openAddMember: true },
    );
  }

  removeMember(nodeId: string, userId: string): void {
    this.store.removeOrgNodeMember(
      nodeId as TOrgNodeId,
      userId as TUserId,
      () => this.store.loadOrgChart(this.companyId()),
    );
  }

  removeGuestMember(nodeId: string, guestId: string): void {
    this.store.removeGuestMember(
      nodeId as TOrgNodeId,
      guestId,
      () => this.store.loadOrgChart(this.companyId()),
    );
  }

  // ── Node settings (popover) ─────────────────────────────

  openNodeSettings(node: TOrgNodeHierarchyViewModel, depth: number): void {
    this.layout.setPopover<NodeSettingsPopoverComponent, TNodeSettingsPopoverData>(
      NodeSettingsPopoverComponent,
      { node, companyId: this.companyId(), depth },
    );
  }

  // ── UI helpers ──────────────────────────────────────────

  getInitials(name?: string): string {
    if (!name) return '?';
    return name[0].toUpperCase();
  }

  getMemberColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return NODE_PALETTE[Math.abs(hash) % NODE_PALETTE.length];
  }

  // ── Toolbar actions ──────────────────────────────────────

  /**
   * Move a node left (-1) or right (+1) among its siblings.
   */
  moveNode(node: TOrgNodeHierarchyViewModel, _depth: number, direction: -1 | 1): void {
    const chart = this.store.orgChart();
    if (!chart) return;

    const parentId = node.parent_id as TOrgNodeId | undefined;
    const siblings = parentId
      ? this.findNodeChildren(chart.rootNodes, parentId)
      : chart.rootNodes;

    if (!siblings || siblings.length < 2) return;

    const currentIndex = siblings.findIndex(n => n.id === node.id);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= siblings.length) return;

    // Swap positions
    const reordered = [...siblings];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

    const orderedIds = reordered.map(n => n.id) as TOrgNodeId[];

    this.store.reorderOrgNodes(chart.company_id as TCompanyId, parentId, orderedIds, () => {
      this.store.loadOrgChart(chart.company_id as TCompanyId);
    });
  }

  archiveNode(nodeId: TOrgNodeId): void {
    const chart = this.store.orgChart();
    if (!chart) return;

    this.store.archiveOrgNode(nodeId, () => {
      this.store.loadOrgChart(chart.company_id as TCompanyId);
    });
  }

  /** Find children of a node by walking the tree recursively. */
  private findNodeChildren(
    nodes: TOrgNodeHierarchyViewModel[],
    parentId: TOrgNodeId,
  ): TOrgNodeHierarchyViewModel[] | undefined {
    for (const node of nodes) {
      if (node.id === parentId) return node.children;
      const found = this.findNodeChildren(node.children, parentId);
      if (found) return found;
    }
    return undefined;
  }
}
