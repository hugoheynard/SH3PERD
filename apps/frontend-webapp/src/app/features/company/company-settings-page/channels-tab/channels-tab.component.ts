import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { CompanyStore } from '../../company.store';
import { IntegrationsPanelComponent } from './integrations-panel/integrations-panel.component';
import { PlatformChannelsComponent } from './platform-channels/platform-channels.component';
import { PlatformIconComponent } from './platform-icon/platform-icon.component';
import type {
  TCompanyChannel,
  TCompanyId,
  TCompanyIntegration,
  TCommunicationPlatform,
} from '@sh3pherd/shared-types';

@Component({
  selector: 'app-channels-tab',
  standalone: true,
  imports: [IntegrationsPanelComponent, PlatformChannelsComponent, PlatformIconComponent],
  templateUrl: './channels-tab.component.html',
  styleUrl: './channels-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelsTabComponent {
  private readonly store = inject(CompanyStore);

  readonly companyId = input.required<TCompanyId>();

  // ── State ──────────────────────────────────────────────
  readonly integrations = signal<TCompanyIntegration[]>([]);
  readonly channels = signal<TCompanyChannel[]>([]);

  // ── Sub-tab ────────────────────────────────────────────
  readonly activePlatform = signal<TCommunicationPlatform | null>(null);

  readonly connectedPlatforms = computed(() =>
    this.integrations().filter(i => i.status === 'connected').map(i => i.platform),
  );

  readonly activeChannels = computed(() => {
    const p = this.activePlatform();
    if (!p) return [];
    return this.channels().filter(ch => ch.platform === p);
  });

  private populated = false;

  constructor() {
    // Populate once from store, then component owns its state
    effect(() => {
      const c = this.store.company();
      if (!c || this.populated) return;
      this.populated = true;
      this.integrations.set([...(c.integrations ?? [])]);
      this.channels.set([...(c.channels ?? [])]);

      // Auto-select first connected platform
      const first = (c.integrations ?? []).find(i => i.status === 'connected');
      if (first) this.activePlatform.set(first.platform);
    });
  }

  // ── Integration events ─────────────────────────────────

  onPlatformConnected(event: { platform: TCommunicationPlatform; config: Record<string, string> }): void {
    this.integrations.update(list => {
      const filtered = list.filter(i => i.platform !== event.platform);
      return [...filtered, { platform: event.platform, status: 'connected' as const, config: event.config, connectedAt: new Date() }];
    });
    this.activePlatform.set(event.platform);
    this.save();
  }

  onPlatformDisconnected(platform: TCommunicationPlatform): void {
    this.integrations.update(list => list.filter(i => i.platform !== platform));
    this.channels.update(list => list.filter(ch => ch.platform !== platform));

    // If disconnected platform was active, switch to first remaining
    if (this.activePlatform() === platform) {
      const remaining = this.connectedPlatforms();
      this.activePlatform.set(remaining.length > 0 ? remaining[0] : null);
    }

    this.save();
  }

  // ── Channel events ─────────────────────────────────────

  onChannelAdded(event: { name: string; url: string }): void {
    const platform = this.activePlatform();
    if (!platform) return;
    const id = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.channels.update(list => [...list, { id, name: event.name, platform, url: event.url }]);
    this.save();
  }

  onChannelRemoved(channelId: string): void {
    this.channels.update(list => list.filter(ch => ch.id !== channelId));
    this.save();
  }

  // ── Persist ────────────────────────────────────────────

  private save(): void {
    this.store.updateCompanyInfo(this.companyId(), {
      integrations: this.integrations(),
      channels: this.channels(),
    });
  }
}
