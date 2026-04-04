import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { InputComponent } from '../../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../../shared/button/button.component';
import type { TIntegrationChannel, TCommunicationPlatform } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-platform-channels',
  standalone: true,
  imports: [FormsModule, SlicePipe, InputComponent, ButtonComponent],
  templateUrl: './platform-channels.component.html',
  styleUrl: './platform-channels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformChannelsComponent {
  readonly platform = input.required<TCommunicationPlatform>();
  readonly channels = input.required<TIntegrationChannel[]>();

  readonly added = output<{ name: string; url: string }>();
  readonly removed = output<string>();

  // Search
  readonly search = signal('');

  // Add channel flow
  readonly adding = signal(false);
  readonly newName = signal('');
  readonly newUrl = signal('');

  get filtered(): TIntegrationChannel[] {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.channels();
    return this.channels().filter(ch => ch.name.toLowerCase().includes(q));
  }

  startAdd(): void {
    this.newName.set('');
    this.newUrl.set('');
    this.adding.set(true);
  }

  cancelAdd(): void {
    this.adding.set(false);
  }

  confirmAdd(): void {
    const name = this.newName().trim();
    const url = this.newUrl().trim();
    if (!name || !url) return;
    this.added.emit({ name, url });
    this.adding.set(false);
  }

  remove(channelId: string): void {
    this.removed.emit(channelId);
  }
}
