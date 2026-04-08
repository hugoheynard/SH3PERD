import { ChangeDetectionStrategy, Component, computed, inject, input, signal, type OnInit } from '@angular/core';
import { CompanyService } from '../../company.service';
import { IntegrationsPanelComponent } from './integrations-panel/integrations-panel.component';
import { PlatformChannelsComponent } from './platform-channels/platform-channels.component';
import { PlatformIconComponent } from './platform-icon/platform-icon.component';
import type {
  TCompanyId,
  TCommunicationPlatform,
  TIntegrationViewModel,
} from '@sh3pherd/shared-types';

@Component({
  selector: 'app-channels-tab',
  standalone: true,
  imports: [IntegrationsPanelComponent, PlatformChannelsComponent, PlatformIconComponent],
  templateUrl: './channels-tab.component.html',
  styleUrl: './channels-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelsTabComponent implements OnInit {
  private readonly companyService = inject(CompanyService);

  readonly companyId = input.required<TCompanyId>();

  // ── State ──────────────────────────────────────────────
  readonly integrations = signal<TIntegrationViewModel[]>([]);
  readonly activePlatform = signal<TCommunicationPlatform | null>(null);

  readonly connectedPlatforms = computed(() =>
    this.integrations().filter(i => i.status === 'connected').map(i => i.platform),
  );

  readonly activeChannels = computed(() => {
    const p = this.activePlatform();
    if (!p) return [];
    const integration = this.integrations().find(i => i.platform === p);
    return integration?.channels ?? [];
  });

  ngOnInit(): void {
    this.loadIntegrations();
  }

  private loadIntegrations(): void {
    this.companyService.getIntegrations(this.companyId()).subscribe({
      next: (data) => this.integrations.set(data),
    });
  }

  // ── OAuth ───────────────────────────────────────────────

  onOAuthRequested(platform: TCommunicationPlatform): void {
    if (platform !== 'slack') return;
    this.companyService.getSlackAuthUrl(this.companyId()).subscribe({
      next: (res) => { window.location.href = res.url; },
    });
  }

  // ── Integration events ─────────────────────────────────

  onPlatformDisconnected(platform: TCommunicationPlatform): void {
    this.companyService.disconnectIntegration(this.companyId(), platform).subscribe({
      next: () => {
        this.integrations.update(list => list.filter(i => i.platform !== platform));
        if (this.activePlatform() === platform) {
          const remaining = this.connectedPlatforms().filter(p => p !== platform);
          this.activePlatform.set(remaining.length > 0 ? remaining[0] : null);
        }
      },
    });
  }
}
