import { inject, Injectable, signal } from '@angular/core';
import { OrgChartService } from './orgchart.service';
import { ToastService } from '../../shared/toast/toast.service';
import type {
  TCompanyId,
  TCompanyOrgChartViewModel,
  TOrgNodeId,
  TOrgNodeRecord,
  TTeamRole,
  TTeamType,
  TOrgNodeCommunication,
  TUserId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class OrgChartStore {
  private readonly service = inject(OrgChartService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────
  private readonly _orgChart = signal<TCompanyOrgChartViewModel | null>(null);
  private readonly _orgNodes = signal<TOrgNodeRecord[]>([]);

  // ── Selectors ──────────────────────────────────────────────
  readonly orgChart = this._orgChart.asReadonly();
  readonly orgNodes = this._orgNodes.asReadonly();

  // ── Org Chart ──────────────────────────────────────────────

  loadOrgChart(companyId: TCompanyId): void {
    this.service.getOrgChart(companyId).subscribe({
      next: (res) => this._orgChart.set(res.data),
    });
  }

  // ── Org Nodes ──────────────────────────────────────────────

  loadOrgNodes(companyId: TCompanyId): void {
    this.service.getCompanyOrgNodes(companyId).subscribe({
      next: (res) => this._orgNodes.set(res.data),
    });
  }

  createOrgNode(
    dto: { company_id: TCompanyId; name: string; parent_id?: TOrgNodeId; type?: TTeamType; color?: string },
    onSuccess?: () => void,
  ): void {
    this.service.createOrgNode(dto).subscribe({
      next: (res) => {
        this._orgNodes.update(nodes => [...nodes, res.data]);
        this.toast.show(`Node "${dto.name}" created`, 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to create node', 'error');
      },
    });
  }

  updateOrgNode(
    nodeId: TOrgNodeId,
    dto: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] },
    onSuccess?: () => void,
  ): void {
    this.service.updateOrgNode(nodeId, dto).subscribe({
      next: () => {
        this.toast.show('Node updated', 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to update node', 'error');
      },
    });
  }

  // ── Members ────────────────────────────────────────────────

  addOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId, contractId: string, teamRole?: TTeamRole, onSuccess?: () => void): void {
    this.service.addOrgNodeMember(nodeId, { user_id: userId, contract_id: contractId, team_role: teamRole }).subscribe({
      next: () => {
        this.toast.show('Member added', 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to add member', 'error');
      },
    });
  }

  removeOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId, onSuccess?: () => void): void {
    this.service.removeOrgNodeMember(nodeId, userId).subscribe({
      next: () => {
        this.toast.show('Member removed', 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to remove member', 'error');
      },
    });
  }

  // ── Guest Members ──────────────────────────────────────────

  addGuestMember(nodeId: TOrgNodeId, dto: { display_name: string; title?: string; team_role: TTeamRole }, onSuccess?: () => void): void {
    this.service.addGuestMember(nodeId, dto).subscribe({
      next: () => {
        this.toast.show(`Guest "${dto.display_name}" added`, 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to add guest', 'error');
      },
    });
  }

  removeGuestMember(nodeId: TOrgNodeId, guestId: string, onSuccess?: () => void): void {
    this.service.removeGuestMember(nodeId, guestId).subscribe({
      next: () => {
        this.toast.show('Guest removed', 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to remove guest', 'error');
      },
    });
  }

  // ── Archive ───────────────────────────────────────────────

  archiveOrgNode(nodeId: TOrgNodeId, onSuccess?: () => void): void {
    this.service.archiveOrgNode(nodeId).subscribe({
      next: () => {
        this.toast.show('Node archived', 'success');
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to archive node', 'error');
      },
    });
  }

  // ── Reorder ──────────────────────────────────────────────

  reorderOrgNodes(companyId: TCompanyId, parentId: TOrgNodeId | undefined, orderedIds: TOrgNodeId[], onSuccess?: () => void): void {
    this.service.reorderOrgNodes(companyId, parentId, orderedIds).subscribe({
      next: () => {
        onSuccess?.();
      },
      error: () => {
        this.toast.show('Failed to reorder nodes', 'error');
      },
    });
  }
}
