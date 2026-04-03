import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CompanyStore } from '../../company.store';
import { CompanyService } from '../../company.service';
import { IntegrationsPanelComponent } from './integrations-panel/integrations-panel.component';
import { PlatformChannelsComponent } from './platform-channels/platform-channels.component';
import { PlatformIconComponent } from './platform-icon/platform-icon.component';
import type {
  TCompanyId,
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
  private readonly companyService = inject(CompanyService);

  readonly companyId = input.required<TCompanyId>();

  // ── Sub-tab ────────────────────────────────────────────
  readonly activePlatform = signal<TCommunicationPlatform | null>(null);

  /** Integrations are read directly from the store — single source of truth */
  readonly integrations = computed(() => this.store.company()?.integrations ?? []);

  readonly connectedPlatforms = computed(() =>
    this.integrations().filter(i => i.status === 'connected').map(i => i.platform),
  );

  readonly activeChannels = computed(() => {
    const p = this.activePlatform();
    if (!p) return [];
    const channels = this.store.company()?.channels ?? [];
    return channels.filter(ch => ch.platform === p);
  });

  // ── OAuth ───────────────────────────────────────────────

  onOAuthRequested(platform: TCommunicationPlatform): void {
    if (platform !== 'slack') return;
    this.companyService.getSlackAuthUrl(this.companyId()).subscribe({
      next: (res) => { window.location.href = res.url; },
      error: (err) => console.error('[ChannelsTab] OAuth URL failed', err),
    });
  }

  // ── Integration events ─────────────────────────────────

  onPlatformConnected(event: { platform: TCommunicationPlatform; config: Record<string, string> }): void {
    this.store.connectIntegration(this.companyId(), event.platform, event.config);
    this.activePlatform.set(event.platform);
  }

  onPlatformDisconnected(platform: TCommunicationPlatform): void {
    this.store.disconnectIntegration(this.companyId(), platform);

    // If disconnected platform was active, switch to first remaining
    if (this.activePlatform() === platform) {
      const remaining = this.connectedPlatforms().filter(p => p !== platform);
      this.activePlatform.set(remaining.length > 0 ? remaining[0] : null);
    }
  }

  // ── Channel events ─────────────────────────────────────

  onChannelAdded(event: { name: string; url: string }): void {
    const platform = this.activePlatform();
    if (!platform) return;
    this.store.addChannel(this.companyId(), { name: event.name, platform, url: event.url });
  }

  onChannelRemoved(channelId: string): void {
    this.store.removeChannel(this.companyId(), channelId);
  }
}
