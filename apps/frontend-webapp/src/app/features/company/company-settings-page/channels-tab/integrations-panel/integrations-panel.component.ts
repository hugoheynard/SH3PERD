import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../../shared/button/button.component';
import { PlatformIconComponent } from '../platform-icon/platform-icon.component';
import type { TIntegrationViewModel, TCommunicationPlatform } from '@sh3pherd/shared-types';

export interface PlatformMeta {
  key: TCommunicationPlatform;
  label: string;
  description: string;
  configFields: { key: string; label: string; placeholder: string }[];
  feature_unlocked: boolean;
  oauthFlow?: boolean;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    key: 'slack',
    label: 'Slack',
    description: 'Connect your Slack workspace to link channels to org nodes.',
    configFields: [],
    feature_unlocked: true,
    oauthFlow: true,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    description: 'Connect WhatsApp Business to link group chats.',
    configFields: [
      { key: 'invite_base_url', label: 'Invite base URL', placeholder: 'https://chat.whatsapp.com/...' },
    ],
    feature_unlocked: false,
  },
  {
    key: 'telegram',
    label: 'Telegram',
    description: 'Connect a Telegram bot to manage group links.',
    configFields: [
      { key: 'bot_token', label: 'Bot token', placeholder: '123456:ABC-DEF...' },
    ],
    feature_unlocked: false,
  },
  {
    key: 'discord',
    label: 'Discord',
    description: 'Connect your Discord server.',
    configFields: [
      { key: 'server_invite', label: 'Server invite', placeholder: 'https://discord.gg/...' },
    ],
    feature_unlocked: false,
  },
  {
    key: 'teams',
    label: 'Teams',
    description: 'Connect Microsoft Teams.',
    configFields: [
      { key: 'tenant_id', label: 'Tenant ID', placeholder: 'your-tenant-id' },
    ],
    feature_unlocked: false,
  },
];

@Component({
  selector: 'app-integrations-panel',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent, PlatformIconComponent],
  templateUrl: './integrations-panel.component.html',
  styleUrl: './integrations-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationsPanelComponent {
  readonly integrations = input.required<TIntegrationViewModel[]>();
  readonly connected = output<{ platform: TCommunicationPlatform; config: Record<string, string> }>();
  readonly disconnected = output<TCommunicationPlatform>();
  readonly oauthRequested = output<TCommunicationPlatform>();

  readonly platforms = PLATFORMS;

  // Connect flow
  readonly connectingPlatform = signal<TCommunicationPlatform | null>(null);
  readonly connectConfig = signal<Record<string, string>>({});

  isConnected(platform: TCommunicationPlatform): boolean {
    return this.integrations().some(i => i.platform === platform && i.status === 'connected');
  }

  startConnect(platform: TCommunicationPlatform): void {
    const existing = this.integrations().find(i => i.platform === platform);
    this.connectConfig.set({ ...(existing?.config ?? {}) });
    this.connectingPlatform.set(platform);
  }

  cancelConnect(): void {
    this.connectingPlatform.set(null);
  }

  confirmConnect(): void {
    const platform = this.connectingPlatform();
    if (!platform) return;
    const config = this.connectConfig();
    if (!Object.values(config).some(v => v.trim())) return;

    this.connected.emit({ platform, config });
    this.connectingPlatform.set(null);
  }

  disconnect(platform: TCommunicationPlatform): void {
    this.disconnected.emit(platform);
  }

  patchConfig(key: string, value: string): void {
    this.connectConfig.update(cfg => ({ ...cfg, [key]: value }));
  }
}
