import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { PopoverFrameComponent } from '../../../../shared/ui-frames/popover-frame/popover-frame.component';
import { INJECTION_DATA } from '../../../../core/main-layout/main-layout.component';
import { OrgChartStore } from '../../orgchart.store';
import { ContractStore } from '../../contract.store';
import { CompanyService, type TSlackChannel } from '../../company.service';
import { LayoutService } from '../../../../core/services/layout.service';
import type {
  TCompanyId,
  TCompanyContractViewModel,
  TOrgNodeCommunication,
  TOrgNodeHierarchyViewModel,
  TOrgNodeId,
  TCommunicationPlatform,
  TTeamRole,
  TUserId,
} from '@sh3pherd/shared-types';

export type TNodeSettingsPopoverData = {
  node: TOrgNodeHierarchyViewModel;
  companyId: TCompanyId;
  depth: number;
};

const NODE_PALETTE = [
  '#63b3ed', '#68d391', '#f6ad55', '#fc8181', '#b794f4',
  '#76e4f7', '#fbb6ce', '#f6e05e', '#4fd1c5', '#a3bffa',
] as const;

const PLATFORM_LABELS: Record<TCommunicationPlatform, string> = {
  slack: 'Slack',
  whatsapp: 'WhatsApp',
  teams: 'Teams',
  discord: 'Discord',
  telegram: 'Telegram',
  other: 'Other',
};

@Component({
  selector: 'app-node-settings-popover',
  standalone: true,
  imports: [CommonModule, PopoverFrameComponent],
  templateUrl: './node-settings-popover.component.html',
  styleUrl: './node-settings-popover.component.scss',
})
export class NodeSettingsPopoverComponent {
  readonly config = inject<TNodeSettingsPopoverData>(INJECTION_DATA);
  private readonly store = inject(OrgChartStore);
  private readonly contractStore = inject(ContractStore);
  private readonly companyService = inject(CompanyService);
  readonly layout = inject(LayoutService);

  readonly colorPalette = NODE_PALETTE;
  readonly depth = this.config.depth;
  readonly nodeName = signal(this.config.node.name);
  readonly nodeColor = signal(this.config.node.color || NODE_PALETTE[0]);
  readonly editMode = signal(true); // popover is always in edit context
  readonly activeTab = signal<'members' | 'comms' | 'settings'>('members');

  // Communications — editable copy
  readonly communications = signal<TOrgNodeCommunication[]>(
    [...(this.config.node.communications ?? [])],
  );

  // Platforms with a connected integration — loaded on init
  readonly connectedPlatforms = signal<{ key: TCommunicationPlatform; label: string }[]>([]);

  // ── Add channel flow ───────────────────────────────────
  readonly addingChannel = signal(false);
  readonly newPlatform = signal<TCommunicationPlatform>('slack');
  readonly channelQuery = signal('');
  readonly newChannelPrivate = signal(false);
  readonly suggestions = signal<TSlackChannel[]>([]);
  readonly searching = signal(false);
  readonly creating = signal(false);

  // Debounced search
  private readonly searchSubject = new Subject<string>();

  constructor() {
    // Load connected integrations
    this.companyService.getIntegrations(this.config.companyId).subscribe({
      next: (data) => {
        this.connectedPlatforms.set(
          data
            .filter(i => i.status === 'connected')
            .map(i => ({ key: i.platform, label: PLATFORM_LABELS[i.platform] ?? i.platform })),
        );
      },
      error: (err) => console.error('[NodeSettings] loadIntegrations failed', err),
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) return of([]);
        this.searching.set(true);
        return this.companyService.searchSlackChannels(this.config.companyId, query);
      }),
    ).subscribe({
      next: (results) => {
        this.suggestions.set(results);
        this.searching.set(false);
      },
      error: () => {
        this.suggestions.set([]);
        this.searching.set(false);
      },
    });
  }

  onNameInput(event: Event): void {
    this.nodeName.set((event.target as HTMLInputElement).value);
  }

  selectColor(color: string): void {
    this.nodeColor.set(color);
  }

  // ── Communication channels ──────────────────────────────

  getChannelForPlatform(platform: TCommunicationPlatform): TOrgNodeCommunication | undefined {
    return this.communications().find(c => c.platform === platform);
  }

  get availablePlatforms() {
    const existing = new Set(this.communications().map(c => c.platform));
    return this.connectedPlatforms().filter(p => !existing.has(p.key));
  }

  startAddChannel(): void {
    const available = this.availablePlatforms;
    if (available.length === 0) return;
    this.newPlatform.set(available[0].key);
    this.channelQuery.set('');
    this.newChannelPrivate.set(false);
    this.suggestions.set([]);
    this.addingChannel.set(true);
  }

  cancelAddChannel(): void {
    this.addingChannel.set(false);
    this.suggestions.set([]);
  }

  selectNewPlatform(platform: TCommunicationPlatform): void {
    this.newPlatform.set(platform);
    this.channelQuery.set('');
    this.suggestions.set([]);
  }

  onChannelQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.channelQuery.set(value);
    this.searchSubject.next(value);
  }

  /** Select an existing Slack channel from suggestions. */
  selectExistingChannel(channel: TSlackChannel): void {
    const platform = this.newPlatform();
    // TODO: check if this channel is already linked to another org node
    this.communications.update(list => [
      ...list,
      { platform, url: channel.url },
    ]);
    this.addingChannel.set(false);
    this.suggestions.set([]);
  }

  /** Create a new Slack channel with the typed name. */
  confirmCreateChannel(): void {
    const name = this.channelQuery().trim();
    if (!name) return;
    const platform = this.newPlatform();
    this.creating.set(true);

    this.companyService.createSlackChannel(this.config.companyId, name, this.newChannelPrivate()).subscribe({
      next: (channel) => {
        this.communications.update(list => [
          ...list,
          { platform, url: channel.url },
        ]);
        this.addingChannel.set(false);
        this.suggestions.set([]);
        this.creating.set(false);
      },
      error: (err) => {
        console.error('[NodeSettings] createChannel failed', err);
        this.creating.set(false);
      },
    });
  }

  removeChannel(platform: TCommunicationPlatform): void {
    this.communications.update(list => list.filter(c => c.platform !== platform));
  }

  // ── Members ─────────────────────────────────────────────

  getMemberColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return NODE_PALETTE[Math.abs(hash) % NODE_PALETTE.length];
  }

  // ── Remove confirmation ─────────────────────────────────

  readonly confirmingRemove = signal<string | null>(null); // user_id or guest_id being confirmed

  startRemoveMember(id: string): void {
    this.confirmingRemove.set(id);
  }

  cancelRemove(): void {
    this.confirmingRemove.set(null);
  }

  confirmRemoveMember(userId: string): void {
    this.store.removeOrgNodeMember(
      this.config.node.id as TOrgNodeId,
      userId as any,
      () => {
        this.store.loadOrgChart(this.config.companyId);
        this.layout.clearPopover();
      },
    );
  }

  confirmRemoveGuest(guestId: string): void {
    this.store.removeGuestMember(
      this.config.node.id as TOrgNodeId,
      guestId,
      () => {
        this.store.loadOrgChart(this.config.companyId);
        this.layout.clearPopover();
      },
    );
  }

  // ── Add member ─────────────────────────────────────────

  readonly addingMember = signal(false);
  readonly addMemberMode = signal<'contract' | 'guest'>('contract');
  readonly memberSearchQuery = signal('');
  readonly selectedContractId = signal<string | null>(null);
  readonly selectedRole = signal<TTeamRole>('member');
  readonly guestName = signal('');
  readonly guestTitle = signal('');
  readonly guestRole = signal<TTeamRole>('member');
  readonly teamRoles: TTeamRole[] = ['director', 'manager', 'member', 'viewer'];

  startAddMember(): void {
    this.addingMember.set(true);
    this.addMemberMode.set('contract');
    this.memberSearchQuery.set('');
    this.selectedContractId.set(null);
    this.selectedRole.set('member');
  }

  cancelAddMember(): void {
    this.addingMember.set(false);
  }

  get filteredContracts(): TCompanyContractViewModel[] {
    const existingUserIds = new Set(this.config.node.members.map(m => m.user_id));
    const q = this.memberSearchQuery().toLowerCase();
    return this.contractStore.contracts().filter(c => {
      if (c.status !== 'active' || existingUserIds.has(c.user_id)) return false;
      if (!q) return true;
      const fullName = `${c.user_first_name ?? ''} ${c.user_last_name ?? ''}`.toLowerCase();
      const email = (c.user_email ?? '').toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }

  onMemberSearch(event: Event): void {
    this.memberSearchQuery.set((event.target as HTMLInputElement).value);
  }

  selectContract(contractId: string): void {
    this.selectedContractId.set(contractId);
  }

  onGuestNameInput(event: Event): void {
    this.guestName.set((event.target as HTMLInputElement).value);
  }

  onGuestTitleInput(event: Event): void {
    this.guestTitle.set((event.target as HTMLInputElement).value);
  }

  confirmAddMember(): void {
    if (this.addMemberMode() === 'contract') {
      const contractId = this.selectedContractId();
      if (!contractId) return;
      const contract = this.contractStore.contracts().find(c => c.id === contractId);
      if (!contract) return;
      this.store.addOrgNodeMember(
        this.config.node.id as TOrgNodeId,
        contract.user_id as TUserId,
        contractId,
        this.selectedRole(),
        () => {
          this.store.loadOrgChart(this.config.companyId);
          this.layout.clearPopover();
        },
      );
    } else {
      const name = this.guestName().trim();
      if (!name) return;
      this.store.addGuestMember(
        this.config.node.id as TOrgNodeId,
        { display_name: name, title: this.guestTitle().trim() || undefined, team_role: this.guestRole() },
        () => {
          this.store.loadOrgChart(this.config.companyId);
          this.layout.clearPopover();
        },
      );
    }
  }

  // ── Archive (delete) ────────────────────────────────────

  readonly archiveStep = signal<'idle' | 'confirm' | 'type-name'>('idle');
  readonly archiveInput = signal('');
  readonly archiving = signal(false);

  startArchive(): void {
    this.archiveStep.set('confirm');
  }

  cancelArchive(): void {
    this.archiveStep.set('idle');
    this.archiveInput.set('');
  }

  proceedToTypeName(): void {
    this.archiveStep.set('type-name');
    this.archiveInput.set('');
  }

  onArchiveInput(event: Event): void {
    this.archiveInput.set((event.target as HTMLInputElement).value);
  }

  get archiveNameMatches(): boolean {
    return this.archiveInput().trim().toLowerCase() === this.config.node.name.trim().toLowerCase();
  }

  confirmArchive(): void {
    if (!this.archiveNameMatches) return;
    this.archiving.set(true);
    this.store.archiveOrgNode(
      this.config.node.id as TOrgNodeId,
      () => {
        this.store.loadOrgChart(this.config.companyId);
        this.layout.clearPopover();
      },
    );
  }

  // ── Save ────────────────────────────────────────────────

  save(): void {
    const dto: Record<string, any> = {};
    const name = (this.nodeName() ?? '').trim();
    if (name && name !== this.config.node.name) dto['name'] = name;
    if (this.depth === 0 && this.nodeColor() !== this.config.node.color) dto['color'] = this.nodeColor();
    dto['communications'] = this.communications();

    this.store.updateOrgNode(
      this.config.node.id as TOrgNodeId,
      dto,
      () => {
        this.store.loadOrgChart(this.config.companyId);
        this.layout.clearPopover();
      },
    );
  }
}
