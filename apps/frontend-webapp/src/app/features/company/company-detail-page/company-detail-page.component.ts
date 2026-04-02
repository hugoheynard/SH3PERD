import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { ContractCreationPanelComponent } from '../contract-creation-panel/contract-creation-panel.component';
import { CompanyHeaderComponent } from './company-header/company-header.component';
import { LayoutService } from '../../../core/services/layout.service';
import { AddMemberPopoverComponent, type TAddMemberPopoverData } from '../popovers/add-member-popover/add-member-popover.component';
import { NodeSettingsPopoverComponent, type TNodeSettingsPopoverData } from '../popovers/node-settings-popover/node-settings-popover.component';
import type {
  TCompanyId,
  TContractId,
  TOrgNodeHierarchyViewModel,
  TOrgNodeId,
  TUserId,
} from '@sh3pherd/shared-types';

type CompanyTab = 'orgchart' | 'contracts';

/** Preset color palette for root nodes */
const NODE_PALETTE = [
  '#63b3ed', // blue
  '#68d391', // green
  '#f6ad55', // orange
  '#fc8181', // red
  '#b794f4', // purple
  '#76e4f7', // cyan
  '#fbb6ce', // pink
  '#f6e05e', // yellow
  '#4fd1c5', // teal
  '#a3bffa', // indigo
] as const;

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [CommonModule, ContractCreationPanelComponent, CompanyHeaderComponent],
  templateUrl: './company-detail-page.component.html',
  styleUrl: './company-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly layout = inject(LayoutService);

  readonly activeTab = signal<CompanyTab>('orgchart');
  readonly editMode = signal(false);
  readonly showContractPanel = signal(false);

  // Org chart expand/collapse state (tracks node IDs)
  readonly expandedNodes = signal<Set<string>>(new Set());

  // Org node creation state
  readonly addingNode = signal(false);
  readonly newNodeName = signal('');
  readonly newNodeParentId = signal<string | undefined>(undefined);
  readonly newNodeColor = signal<string>(NODE_PALETTE[0]);

  // (Node settings are now a popover — no inline state needed)

  // Color palette exposed to template
  readonly colorPalette = NODE_PALETTE;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    if (id) {
      this.store.loadCompanyById(id);
      this.store.loadOrgChart(id);
      this.store.loadCompanyContracts(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/app/company']);
  }

  goToSettings(): void {
    const company = this.store.company();
    if (!company) return;
    this.router.navigate(['/app/company', company.id, 'settings']);
  }

  setTab(tab: CompanyTab): void {
    this.activeTab.set(tab);
  }

  toggleEditMode(): void {
    const entering = !this.editMode();
    this.editMode.set(entering);
    if (!entering) {
      this.cancelAddNode();
    }
  }

  // ── Org chart helpers ──────────────────────────────────────

  toggleNode(nodeId: string): void {
    const s = new Set(this.expandedNodes());
    s.has(nodeId) ? s.delete(nodeId) : s.add(nodeId);
    this.expandedNodes.set(s);
  }

  isNodeExpanded(nodeId: string): boolean {
    return this.expandedNodes().has(nodeId);
  }

  /** Get the orgLayers label for a given depth index */
  getLayerLabel(depth: number): string {
    const chart = this.store.orgChart();
    return chart?.orgLayers?.[depth] ?? `Level ${depth}`;
  }

  memberCount(node: TOrgNodeHierarchyViewModel): number {
    return node.members.length + (node.guest_members?.length ?? 0);
  }

  /** Count unique persons across a node and all its descendants */
  totalDescendantMembers(node: TOrgNodeHierarchyViewModel): number {
    const userIds = new Set<string>();
    let guestCount = 0;
    const walk = (n: TOrgNodeHierarchyViewModel): void => {
      for (const m of n.members) userIds.add(m.user_id);
      guestCount += (n.guest_members?.length ?? 0);
      for (const child of n.children) walk(child);
    };
    walk(node);
    return userIds.size + guestCount;
  }

  // ── Color system ───────────────────────────────────────────

  getNodeColorForDepth(node: TOrgNodeHierarchyViewModel, depth: number, rootColor?: string): string {
    if (depth === 0) {
      return node.color || NODE_PALETTE[0];
    }
    const base = rootColor || NODE_PALETTE[0];
    const pct = Math.max(40, 100 - depth * 20);
    return `color-mix(in srgb, ${base} ${pct}%, var(--card-color, #2c323d))`;
  }

  getRootColor(node: TOrgNodeHierarchyViewModel): string {
    return node.color || NODE_PALETTE[0];
  }

  // ── Node creation ──────────────────────────────────────────

  startAddNode(parentId?: string): void {
    this.newNodeParentId.set(parentId);
    this.newNodeColor.set(NODE_PALETTE[0]);
    this.addingNode.set(true);
  }

  cancelAddNode(): void {
    this.addingNode.set(false);
    this.newNodeName.set('');
    this.newNodeParentId.set(undefined);
  }

  confirmAddNode(): void {
    const name = this.newNodeName().trim();
    const company = this.store.company();
    if (!name || !company) return;

    const isRoot = !this.newNodeParentId();
    this.store.createOrgNode(
      {
        company_id: company.id,
        name,
        parent_id: this.newNodeParentId() as any,
        ...(isRoot ? { color: this.newNodeColor() } : {}),
      },
      () => this.store.loadOrgChart(company.id),
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

  // ── Member assignment ──────────────────────────────────────

  openAddMemberPopover(node: TOrgNodeHierarchyViewModel): void {
    const company = this.store.company();
    if (!company) return;

    this.layout.setPopover<AddMemberPopoverComponent, TAddMemberPopoverData>(
      AddMemberPopoverComponent,
      {
        nodeId: node.id as TOrgNodeId,
        nodeName: node.name,
        companyId: company.id,
        existingMembers: node.members,
      },
    );
  }

  removeMember(nodeId: string, userId: string): void {
    const company = this.store.company();
    if (!company) return;

    this.store.removeOrgNodeMember(
      nodeId as TOrgNodeId,
      userId as TUserId,
      () => this.store.loadOrgChart(company.id),
    );
  }

  removeGuestMember(nodeId: string, guestId: string): void {
    const company = this.store.company();
    if (!company) return;

    this.store.removeGuestMember(
      nodeId as TOrgNodeId,
      guestId,
      () => this.store.loadOrgChart(company.id),
    );
  }

  /** Get contract display name from a contract ID */
  getContractLabel(contractId: string): string {
    const c = this.store.contracts().find(ct => ct.id === contractId);
    if (!c) return contractId;
    const name = [c.user_first_name, c.user_last_name].filter(Boolean).join(' ');
    return name || c.user_email || c.user_id;
  }

  // ── Node settings (popover) ────────────────────────────────

  openNodeSettings(node: TOrgNodeHierarchyViewModel, depth: number): void {
    const company = this.store.company();
    if (!company) return;

    this.layout.setPopover<NodeSettingsPopoverComponent, TNodeSettingsPopoverData>(
      NodeSettingsPopoverComponent,
      {
        node,
        companyId: company.id,
        depth,
      },
    );
  }

  // ── UI helpers ─────────────────────────────────────────────

  getInitials(name?: string): string {
    if (!name) return '?';
    return name[0].toUpperCase();
  }

  getMemberColor(userId: string): string {
    const colors = NODE_PALETTE;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  goToContract(contractId: TContractId): void {
    const company = this.store.company();
    if (!company) return;
    this.router.navigate(['/app/company', company.id, 'contracts', contractId]);
  }
}
