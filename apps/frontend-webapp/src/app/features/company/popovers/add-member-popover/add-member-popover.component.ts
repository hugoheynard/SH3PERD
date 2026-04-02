import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverFrameComponent } from '../../../../shared/ui-frames/popover-frame/popover-frame.component';
import { INJECTION_DATA } from '../../../../core/main-layout/main-layout.component';
import { CompanyStore } from '../../company.store';
import { LayoutService } from '../../../../core/services/layout.service';
import type {
  TCompanyContractViewModel,
  TCompanyId,
  TOrgNodeId,
  TOrgNodeMemberViewModel,
  TTeamRole,
  TUserId,
} from '@sh3pherd/shared-types';

export type TAddMemberPopoverData = {
  nodeId: TOrgNodeId;
  nodeName: string;
  companyId: TCompanyId;
  existingMembers: TOrgNodeMemberViewModel[];
};

type PopoverMode = 'contract' | 'guest';

const TEAM_ROLES: TTeamRole[] = ['director', 'manager', 'member', 'viewer'];

const NODE_PALETTE = [
  '#63b3ed', '#68d391', '#f6ad55', '#fc8181', '#b794f4',
  '#76e4f7', '#fbb6ce', '#f6e05e', '#4fd1c5', '#a3bffa',
] as const;

@Component({
  selector: 'app-add-member-popover',
  standalone: true,
  imports: [CommonModule, PopoverFrameComponent],
  templateUrl: './add-member-popover.component.html',
  styleUrl: './add-member-popover.component.scss',
})
export class AddMemberPopoverComponent {
  private readonly config = inject<TAddMemberPopoverData>(INJECTION_DATA);
  private readonly store = inject(CompanyStore);
  readonly layout = inject(LayoutService);

  readonly teamRoles = TEAM_ROLES;
  readonly mode = signal<PopoverMode>('contract');

  // Contract mode
  readonly searchQuery = signal('');
  readonly selectedContractId = signal<string | null>(null);
  readonly selectedRole = signal<TTeamRole>('member');

  // Guest mode
  readonly guestName = signal('');
  readonly guestTitle = signal('');
  readonly guestRole = signal<TTeamRole>('member');

  readonly nodeName = this.config.nodeName;

  get filteredContracts(): TCompanyContractViewModel[] {
    const existingUserIds = new Set(this.config.existingMembers.map(m => m.user_id));
    const q = this.searchQuery().toLowerCase();
    return this.store.contracts().filter(c => {
      if (c.status !== 'active' || existingUserIds.has(c.user_id)) return false;
      if (!q) return true;
      const fullName = `${c.user_first_name ?? ''} ${c.user_last_name ?? ''}`.toLowerCase();
      const email = (c.user_email ?? '').toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }

  setMode(mode: PopoverMode): void {
    this.mode.set(mode);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  selectContract(contractId: string): void {
    this.selectedContractId.set(contractId);
  }

  selectRole(role: TTeamRole): void {
    this.selectedRole.set(role);
  }

  selectGuestRole(role: TTeamRole): void {
    this.guestRole.set(role);
  }

  onGuestNameInput(event: Event): void {
    this.guestName.set((event.target as HTMLInputElement).value);
  }

  onGuestTitleInput(event: Event): void {
    this.guestTitle.set((event.target as HTMLInputElement).value);
  }

  getMemberColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return NODE_PALETTE[Math.abs(hash) % NODE_PALETTE.length];
  }

  get canConfirm(): boolean {
    if (this.mode() === 'contract') return !!this.selectedContractId();
    return this.guestName().trim().length > 0;
  }

  confirm(): void {
    if (this.mode() === 'contract') {
      this.confirmContract();
    } else {
      this.confirmGuest();
    }
  }

  private confirmContract(): void {
    const contractId = this.selectedContractId();
    if (!contractId) return;

    const contract = this.store.contracts().find(c => c.id === contractId);
    if (!contract) return;

    this.store.addOrgNodeMember(
      this.config.nodeId,
      contract.user_id as TUserId,
      contractId,
      this.selectedRole(),
      () => {
        this.store.loadOrgChart(this.config.companyId);
        this.layout.clearPopover();
      },
    );
  }

  private confirmGuest(): void {
    const name = this.guestName().trim();
    if (!name) return;

    const title = this.guestTitle().trim() || undefined;

    this.store.addGuestMember(
      this.config.nodeId,
      { display_name: name, title, team_role: this.guestRole() },
      () => {
        this.store.loadOrgChart(this.config.companyId);
        this.layout.clearPopover();
      },
    );
  }
}
