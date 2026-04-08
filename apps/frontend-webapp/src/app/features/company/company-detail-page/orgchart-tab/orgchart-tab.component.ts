import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
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

  // Multiselect + group state
  readonly selectedNodeIds = signal<Set<string>>(new Set());
  readonly selectionParentId = signal<string | undefined>(undefined);
  readonly groupName = signal('');

  // Search
  readonly searchQuery = signal('');
  readonly searchMask = signal(false);

  // Zoom
  readonly zoomLevel = signal(1);

  // Filter
  readonly showArchived = signal(false);

  // Move-to modal
  readonly moveModalNode = signal<TOrgNodeHierarchyViewModel | null>(null);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  // ── Keyboard shortcuts ───────────────────────────────────

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Don't intercept when typing in an input
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if ((event.key === '+' || event.key === '=') && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.zoomIn();
    } else if (event.key === '-' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.zoomOut();
    } else if (event.key === '0' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.resetZoom();
    }
  }

  // ── Edit mode ───────────────────────────────────────────

  toggleEditMode(): void {
    const entering = !this.editMode();
    this.editMode.set(entering);
    if (!entering) {
      this.cancelAddNode();
      this.clearSelection();
    }
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

  // ── Node leaders ─────────────────────────────────────────

  private readonly LEADER_ROLES = ['director', 'manager'] as const;
  private readonly ROLE_LABELS: Record<string, string> = {
    director: 'Dir.',
    manager: 'Mgr.',
  };

  getNodeLeaders(node: TOrgNodeHierarchyViewModel): { id: string; name: string; initials: string; roleLabel: string; label: string; isGuest: boolean }[] {
    // Regular members who are directors/managers
    const memberLeaders = node.members
      .filter(m => this.LEADER_ROLES.includes(m.team_role as any))
      .map(m => {
        const first = m.first_name ?? '';
        const last = m.last_name ?? '';
        const name = first || last ? `${first} ${last}`.trim() : m.user_id;
        const initials = ((first?.charAt(0) ?? '') + (last?.charAt(0) ?? '')).toUpperCase() || '?';
        const roleLabel = this.ROLE_LABELS[m.team_role] ?? m.team_role;
        return { id: m.user_id, name, initials, roleLabel, label: `${name} (${roleLabel})`, isGuest: false };
      });

    // Guest members who are directors/managers
    const guestLeaders = (node.guest_members ?? [])
      .filter(g => this.LEADER_ROLES.includes(g.team_role as any))
      .map(g => {
        const name = g.display_name;
        const parts = name.split(' ');
        const initials = ((parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')).toUpperCase() || '?';
        const roleLabel = this.ROLE_LABELS[g.team_role] ?? g.team_role;
        return { id: g.id, name, initials, roleLabel, label: `${name} (${roleLabel})`, isGuest: true };
      });

    return [...memberLeaders, ...guestLeaders];
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

  ungroupNode(node: TOrgNodeHierarchyViewModel): void {
    const chart = this.store.orgChart();
    if (!chart) return;

    this.store.ungroupOrgNode(chart.company_id as TCompanyId, node.id as TOrgNodeId, () => {
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

  // ── Multiselect + Group ─────────────────────────────────

  /**
   * Shift+click toggles selection. Only siblings (same parent) can be selected.
   * Normal click clears selection and expands/collapses.
   */
  onNodeClick(node: TOrgNodeHierarchyViewModel, event: MouseEvent): void {
    if (!this.editMode() || !event.shiftKey) {
      // Normal click — clear selection, toggle expand
      this.clearSelection();
      this.toggleNode(node.id);
      return;
    }

    // Shift+click — toggle selection
    event.stopPropagation();
    const nodeParent = node.parent_id ?? undefined;
    const currentParent = this.selectionParentId();
    const ids = new Set(this.selectedNodeIds());

    // If selecting from a different parent → reset
    if (ids.size > 0 && currentParent !== nodeParent) {
      ids.clear();
    }

    if (ids.has(node.id)) {
      ids.delete(node.id);
    } else {
      ids.add(node.id);
    }

    this.selectedNodeIds.set(ids);
    this.selectionParentId.set(ids.size > 0 ? nodeParent : undefined);
  }

  clearSelection(): void {
    this.selectedNodeIds.set(new Set());
    this.selectionParentId.set(undefined);
    this.groupName.set('');
  }

  onGroupNameInput(event: Event): void {
    this.groupName.set((event.target as HTMLInputElement).value);
  }

  confirmGroup(): void {
    const name = this.groupName().trim();
    const ids = Array.from(this.selectedNodeIds()) as TOrgNodeId[];
    const chart = this.store.orgChart();
    if (!name || ids.length < 2 || !chart) return;

    this.store.groupOrgNodes(chart.company_id as TCompanyId, name, ids, () => {
      this.clearSelection();
      this.store.loadOrgChart(chart.company_id as TCompanyId);
    });
  }

  // ── Collapse / Expand all ───────────────────────────────

  expandAll(): void {
    const chart = this.store.orgChart();
    if (!chart) return;
    const ids = new Set<string>();
    const walk = (nodes: TOrgNodeHierarchyViewModel[]) => {
      for (const n of nodes) {
        ids.add(n.id);
        walk(n.children);
      }
    };
    walk(chart.rootNodes);
    this.expandedNodes.set(ids);
    this.centerScroll();
  }

  collapseAll(): void {
    this.expandedNodes.set(new Set());
    this.centerScroll();
  }

  // ── Search ──────────────────────────────────────────────

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  toggleSearchMask(): void {
    this.searchMask.update(v => !v);
  }

  /** Check if a node or any of its descendants matches the search query. */
  nodeMatchesSearch(node: TOrgNodeHierarchyViewModel): boolean {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    if (node.name.toLowerCase().includes(q)) return true;
    // Check members
    if (node.members.some(m => {
      const name = `${m.first_name ?? ''} ${m.last_name ?? ''}`.toLowerCase();
      return name.includes(q);
    })) return true;
    // Check descendants
    return node.children.some(c => this.nodeMatchesSearch(c));
  }

  /** Check if this specific node name matches (not descendants). */
  nodeNameMatches(node: TOrgNodeHierarchyViewModel): boolean {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return false;
    return node.name.toLowerCase().includes(q);
  }

  // ── Zoom ────────────────────────────────────────────────

  zoomIn(): void {
    this.zoomLevel.update(z => Math.min(z + 0.1, 2));
    this.centerScroll();
  }

  zoomOut(): void {
    this.zoomLevel.update(z => Math.max(z - 0.1, 0.4));
    this.centerScroll();
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
    this.centerScroll();
  }

  private centerScroll(): void {
    requestAnimationFrame(() => {
      const el = this.scrollContainer?.nativeElement;
      if (!el) return;
      const scrollWidth = el.scrollWidth;
      const clientWidth = el.clientWidth;
      el.scrollLeft = (scrollWidth - clientWidth) / 2;
    });
  }

  // ── Move-to modal ───────────────────────────────────────

  openMoveModal(node: TOrgNodeHierarchyViewModel): void {
    this.moveModalNode.set(node);
  }

  closeMoveModal(): void {
    this.moveModalNode.set(null);
  }

  /** Get all possible parents (excludes self and descendants). */
  getMoveTargets(): { id: string | null; label: string }[] {
    const chart = this.store.orgChart();
    const movingNode = this.moveModalNode();
    if (!chart || !movingNode) return [];

    const excluded = new Set([movingNode.id, ...this.collectDescendantIds(movingNode)]);
    const targets: { id: string | null; label: string }[] = [
      { id: null, label: '— Root (no parent) —' },
    ];
    this.flattenForSelect(chart.rootNodes, 0, excluded, targets);
    return targets;
  }

  confirmMove(newParentId: string | null): void {
    const node = this.moveModalNode();
    const chart = this.store.orgChart();
    if (!node || !chart) return;

    this.store.updateOrgNode(
      node.id as TOrgNodeId,
      { parent_id: newParentId } as any,
      () => {
        this.closeMoveModal();
        this.store.loadOrgChart(chart.company_id as TCompanyId);
      },
    );
  }

  private collectDescendantIds(node: TOrgNodeHierarchyViewModel): string[] {
    const ids: string[] = [];
    for (const child of node.children ?? []) {
      ids.push(child.id);
      ids.push(...this.collectDescendantIds(child));
    }
    return ids;
  }

  private flattenForSelect(
    nodes: TOrgNodeHierarchyViewModel[],
    depth: number,
    excluded: Set<string>,
    result: { id: string | null; label: string }[],
  ): void {
    for (const node of nodes) {
      if (excluded.has(node.id)) continue;
      const indent = '\u00A0\u00A0'.repeat(depth);
      result.push({ id: node.id, label: `${indent}${node.name}` });
      this.flattenForSelect(node.children ?? [], depth + 1, excluded, result);
    }
  }
}
