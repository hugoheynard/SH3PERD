import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/buttons/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';

export type AddEntryResult =
  | { type: 'existing'; referenceId: string }
  | { type: 'new'; title: string; originalArtist: string };

@Component({
  selector: 'app-add-entry-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  templateUrl: './add-entry-panel.component.html',
  styleUrl: './add-entry-panel.component.scss',
})
export class AddEntryPanelComponent {

  private selector = inject(MusicLibrarySelectorService);

  readonly confirmed = output<AddEntryResult>();
  readonly closed    = output<void>();

  readonly query = signal('');
  readonly newArtist = signal('');
  readonly showNewForm = signal(false);

  readonly filteredRefs = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.selector.references().slice(0, 8);
    return this.selector.references()
      .filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.originalArtist.toLowerCase().includes(q)
      )
      .slice(0, 8);
  });

  readonly inRepertoire = computed(() => {
    const set = new Set(
      this.selector.entriesByReferenceId().keys()
    );
    return set;
  });

  readonly hasExactMatch = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.selector.references().some(r => r.title.toLowerCase() === q);
  });

  selectRef(referenceId: string): void {
    this.confirmed.emit({ type: 'existing', referenceId });
    this.reset();
  }

  submitNew(): void {
    const title = this.query().trim();
    const artist = this.newArtist().trim();
    if (!title || !artist) return;
    this.confirmed.emit({ type: 'new', title, originalArtist: artist });
    this.reset();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closed.emit();
      this.reset();
    }
  }

  close(): void {
    this.closed.emit();
    this.reset();
  }

  private reset(): void {
    this.query.set('');
    this.newArtist.set('');
    this.showNewForm.set(false);
  }
}
