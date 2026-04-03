import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverFrameComponent } from '../../../../shared/ui-frames/popover-frame/popover-frame.component';
import { INJECTION_DATA } from '../../../../core/main-layout/main-layout.component';
import { OrgChartStore } from '../../orgchart.store';
import { LayoutService } from '../../../../core/services/layout.service';
import type {
  TCompanyId,
  TOrgNodeCommunication,
  TOrgNodeHierarchyViewModel,
  TOrgNodeId,
  TCommunicationPlatform,
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

const PLATFORMS: { key: TCommunicationPlatform; label: string; icon: string }[] = [
  { key: 'slack',    label: 'Slack',    icon: 'slack' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { key: 'teams',    label: 'Teams',    icon: 'teams' },
  { key: 'discord',  label: 'Discord',  icon: 'discord' },
  { key: 'telegram', label: 'Telegram', icon: 'telegram' },
];

@Component({
  selector: 'app-node-settings-popover',
  standalone: true,
  imports: [CommonModule, PopoverFrameComponent],
  templateUrl: './node-settings-popover.component.html',
  styleUrl: './node-settings-popover.component.scss',
})
export class NodeSettingsPopoverComponent {
  private readonly config = inject<TNodeSettingsPopoverData>(INJECTION_DATA);
  private readonly store = inject(OrgChartStore);
  readonly layout = inject(LayoutService);

  readonly platforms = PLATFORMS;
  readonly colorPalette = NODE_PALETTE;
  readonly depth = this.config.depth;
  readonly nodeName = signal(this.config.node.name);
  readonly nodeColor = signal(this.config.node.color || NODE_PALETTE[0]);

  // Communications — editable copy
  readonly communications = signal<TOrgNodeCommunication[]>(
    [...(this.config.node.communications ?? [])],
  );

  // Adding a new channel
  readonly addingChannel = signal(false);
  readonly newPlatform = signal<TCommunicationPlatform>('slack');
  readonly newUrl = signal('');

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

  startAddChannel(): void {
    // Default to first platform not already added
    const existing = new Set(this.communications().map(c => c.platform));
    const available = PLATFORMS.find(p => !existing.has(p.key));
    this.newPlatform.set(available?.key ?? 'slack');
    this.newUrl.set('');
    this.addingChannel.set(true);
  }

  cancelAddChannel(): void {
    this.addingChannel.set(false);
  }

  selectNewPlatform(platform: TCommunicationPlatform): void {
    this.newPlatform.set(platform);
  }

  onNewUrlInput(event: Event): void {
    this.newUrl.set((event.target as HTMLInputElement).value);
  }

  confirmAddChannel(): void {
    const url = this.newUrl().trim();
    if (!url) return;
    this.communications.update(list => [
      ...list,
      { platform: this.newPlatform(), url },
    ]);
    this.addingChannel.set(false);
  }

  removeChannel(platform: TCommunicationPlatform): void {
    this.communications.update(list => list.filter(c => c.platform !== platform));
  }

  get availablePlatforms(): typeof PLATFORMS {
    const existing = new Set(this.communications().map(c => c.platform));
    return PLATFORMS.filter(p => !existing.has(p.key));
  }

  // ── Save ────────────────────────────────────────────────

  save(): void {
    const dto: Record<string, any> = {};
    const name = this.nodeName().trim();
    if (name && name !== this.config.node.name) dto['name'] = name;
    if (this.depth === 0) dto['color'] = this.nodeColor();
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
