import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { CompanyStore } from '../../company.store';
import type {
  TCompanyChannel,
  TCompanyId,
  TCompanyIntegration,
  TCommunicationPlatform,
} from '@sh3pherd/shared-types';

export interface PlatformMeta {
  key: TCommunicationPlatform;
  label: string;
  description: string;
  configFields: { key: string; label: string; placeholder: string }[];
}

const PLATFORMS: PlatformMeta[] = [
  {
    key: 'slack',
    label: 'Slack',
    description: 'Connect your Slack workspace to link channels to org nodes.',
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' },
    ],
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    description: 'Connect WhatsApp Business to link group chats.',
    configFields: [
      { key: 'invite_base_url', label: 'Invite base URL', placeholder: 'https://chat.whatsapp.com/...' },
    ],
  },
  {
    key: 'telegram',
    label: 'Telegram',
    description: 'Connect a Telegram bot to manage group links.',
    configFields: [
      { key: 'bot_token', label: 'Bot token', placeholder: '123456:ABC-DEF...' },
    ],
  },
  {
    key: 'discord',
    label: 'Discord',
    description: 'Connect your Discord server.',
    configFields: [
      { key: 'server_invite', label: 'Server invite', placeholder: 'https://discord.gg/...' },
    ],
  },
  {
    key: 'teams',
    label: 'Teams',
    description: 'Connect Microsoft Teams.',
    configFields: [
      { key: 'tenant_id', label: 'Tenant ID', placeholder: 'your-tenant-id' },
    ],
  },
];

@Component({
  selector: 'app-channels-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './channels-tab.component.html',
  styleUrl: './channels-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelsTabComponent {
  private readonly store = inject(CompanyStore);

  readonly companyId = input.required<TCompanyId>();
  readonly platforms = PLATFORMS;

  // ── State ──────────────────────────────────────────────────
  readonly integrations = signal<TCompanyIntegration[]>([]);
  readonly channels = signal<TCompanyChannel[]>([]);
  readonly channelSearch = signal('');

  // Connect platform flow
  readonly connectingPlatform = signal<TCommunicationPlatform | null>(null);
  readonly connectConfig = signal<Record<string, string>>({});

  // Add channel flow
  readonly addingChannelForPlatform = signal<TCommunicationPlatform | null>(null);
  readonly newChannelName = signal('');
  readonly newChannelUrl = signal('');

  constructor() {
    effect(() => {
      const c = this.store.company();
      if (!c) return;
      this.integrations.set([...(c.integrations ?? [])]);
      this.channels.set([...(c.channels ?? [])]);
    });
  }

  // ── Integrations ─────────────────────────────────────────

  getIntegration(platform: TCommunicationPlatform): TCompanyIntegration | undefined {
    return this.integrations().find(i => i.platform === platform);
  }

  isConnected(platform: TCommunicationPlatform): boolean {
    return this.getIntegration(platform)?.status === 'connected';
  }

  startConnect(platform: TCommunicationPlatform): void {
    const existing = this.getIntegration(platform);
    this.connectConfig.set({ ...(existing?.config ?? {}) });
    this.connectingPlatform.set(platform);
  }

  cancelConnect(): void {
    this.connectingPlatform.set(null);
  }

  onConfigInput(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.connectConfig.update(cfg => ({ ...cfg, [key]: value }));
  }

  confirmConnect(): void {
    const platform = this.connectingPlatform();
    if (!platform) return;
    const config = this.connectConfig();
    const hasValue = Object.values(config).some(v => v.trim());
    if (!hasValue) return;

    this.integrations.update(list => {
      const filtered = list.filter(i => i.platform !== platform);
      return [...filtered, { platform, status: 'connected' as const, config, connectedAt: new Date() }];
    });
    this.connectingPlatform.set(null);
    this.save();
  }

  disconnectPlatform(platform: TCommunicationPlatform): void {
    this.integrations.update(list => list.filter(i => i.platform !== platform));
    this.channels.update(list => list.filter(ch => ch.platform !== platform));
    this.save();
  }

  // ── Channels ─────────────────────────────────────────────

  getChannelsForPlatform(platform: TCommunicationPlatform): TCompanyChannel[] {
    return this.channels().filter(ch => ch.platform === platform);
  }

  get connectedPlatforms(): PlatformMeta[] {
    return PLATFORMS.filter(p => this.isConnected(p.key));
  }

  startAddChannel(platform: TCommunicationPlatform): void {
    this.newChannelName.set('');
    this.newChannelUrl.set('');
    this.addingChannelForPlatform.set(platform);
  }

  cancelAddChannel(): void {
    this.addingChannelForPlatform.set(null);
  }

  onChannelInput(field: 'name' | 'url' | 'search', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'name') this.newChannelName.set(value);
    else if (field === 'url') this.newChannelUrl.set(value);
    else this.channelSearch.set(value);
  }

  confirmAddChannel(): void {
    const platform = this.addingChannelForPlatform();
    const name = this.newChannelName().trim();
    const url = this.newChannelUrl().trim();
    if (!platform || !name || !url) return;
    const id = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.channels.update(list => [...list, { id, name, platform, url }]);
    this.addingChannelForPlatform.set(null);
    this.save();
  }

  removeChannel(channelId: string): void {
    this.channels.update(list => list.filter(ch => ch.id !== channelId));
    this.save();
  }

  // ── Persist ──────────────────────────────────────────────

  private save(): void {
    this.store.updateCompanyInfo(this.companyId(), {
      integrations: this.integrations(),
      channels: this.channels(),
    });
  }
}
