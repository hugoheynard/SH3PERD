import { inject, Injectable, signal } from '@angular/core';
import { OrgChartService } from './orgchart.service';
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
      error: (err) => console.error('[OrgChartStore] loadOrgChart failed', err),
    });
  }

  // ── Org Nodes ──────────────────────────────────────────────

  loadOrgNodes(companyId: TCompanyId): void {
    this.service.getCompanyOrgNodes(companyId).subscribe({
      next: (res) => this._orgNodes.set(res.data),
      error: (err) => console.error('[OrgChartStore] loadOrgNodes failed', err),
    });
  }

  createOrgNode(
    dto: { company_id: TCompanyId; name: string; parent_id?: TOrgNodeId; type?: TTeamType; color?: string },
    onSuccess?: () => void,
  ): void {
    this.service.createOrgNode(dto).subscribe({
      next: (res) => {
        this._orgNodes.update(nodes => [...nodes, res.data]);
        onSuccess?.();
      },
      error: (err) => console.error('[OrgChartStore] createOrgNode failed', err),
    });
  }

  updateOrgNode(
    nodeId: TOrgNodeId,
    dto: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] },
    onSuccess?: () => void,
  ): void {
    this.service.updateOrgNode(nodeId, dto).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[OrgChartStore] updateOrgNode failed', err),
    });
  }

  // ── Members ────────────────────────────────────────────────

  addOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId, contractId: string, teamRole?: TTeamRole, onSuccess?: () => void): void {
    this.service.addOrgNodeMember(nodeId, { user_id: userId, contract_id: contractId, team_role: teamRole }).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[OrgChartStore] addOrgNodeMember failed', err),
    });
  }

  removeOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId, onSuccess?: () => void): void {
    this.service.removeOrgNodeMember(nodeId, userId).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[OrgChartStore] removeOrgNodeMember failed', err),
    });
  }

  // ── Guest Members ──────────────────────────────────────────

  addGuestMember(nodeId: TOrgNodeId, dto: { display_name: string; title?: string; team_role: TTeamRole }, onSuccess?: () => void): void {
    this.service.addGuestMember(nodeId, dto).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[OrgChartStore] addGuestMember failed', err),
    });
  }

  removeGuestMember(nodeId: TOrgNodeId, guestId: string, onSuccess?: () => void): void {
    this.service.removeGuestMember(nodeId, guestId).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[OrgChartStore] removeGuestMember failed', err),
    });
  }

  // ── Archive ───────────────────────────────────────────────

  archiveOrgNode(nodeId: TOrgNodeId, onSuccess?: () => void): void {
    this.service.archiveOrgNode(nodeId).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[OrgChartStore] archiveOrgNode failed', err),
    });
  }
}
