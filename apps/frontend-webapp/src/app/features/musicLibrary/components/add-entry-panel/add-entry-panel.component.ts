import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import { PopoverFrameComponent } from '../../../../shared/ui-frames/popover-frame/popover-frame.component';
import { LayoutService } from '../../../../core/services/layout.service';
import { MusicLibrarySelectorService } from '../../services/selector-layer/music-library-selector.service';
import { MusicReferenceService } from '../../services/music-reference.service';
import { MusicRepertoireApiService } from '../../services/music-repertoire-api.service';
import { MusicReferenceMutationService } from '../../services/mutations-layer/music-reference-mutation.service';
import { MusicRepertoireMutationService } from '../../services/mutations-layer/music-repertoire-mutation.service';

@Component({
  selector: 'app-add-entry-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, BadgeComponent, PopoverFrameComponent],
  templateUrl: './add-entry-panel.component.html',
  styleUrl: './add-entry-panel.component.scss',
})
export class AddEntryPanelComponent {

  private readonly layout = inject(LayoutService);
  private readonly selector = inject(MusicLibrarySelectorService);

  // API services
  private readonly refApi = inject(MusicReferenceService);
  private readonly repertoireApi = inject(MusicRepertoireApiService);

  // Local state mutation (micro-update after API success)
  private readonly refMutation = inject(MusicReferenceMutationService);
  private readonly repertoireMut = inject(MusicRepertoireMutationService);

  // UI state
  readonly query = signal('');
  readonly newArtist = signal('');
  readonly showNewForm = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

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
    return new Set(this.selector.entriesByReferenceId().keys());
  });

  readonly hasExactMatch = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.selector.references().some(r => r.title.toLowerCase() === q);
  });

  /** Add an existing reference to the repertoire. */
  selectRef(referenceId: string): void {
    if (this.inRepertoire().has(referenceId) || this.saving()) return;

    this.saving.set(true);
    this.error.set('');

    this.repertoireApi.addEntry(referenceId).subscribe({
      next: () => {
        this.repertoireMut.addEntry(referenceId);
        this.close();
      },
      error: (err) => {
        console.error('Failed to add repertoire entry', err);
        this.error.set('Failed to add entry. Please try again.');
        this.saving.set(false);
      },
    });
  }

  /** Create a new reference then add it to the repertoire. */
  async submitNew(): Promise<void> {
    const title = this.query().trim();
    const artist = this.newArtist().trim();
    if (!title || !artist || this.saving()) return;

    this.saving.set(true);
    this.error.set('');

    // Step 1: Create reference via API (real POST)
    const created = await this.refApi.createOne({ title, artist });

    if (!created) {
      this.error.set('Failed to create reference.');
      this.saving.set(false);
      return;
    }

    // Micro-update local state with the new reference
    this.refMutation.addReference(created.title, created.artist);

    // Step 2: Add to repertoire (stub)
    this.repertoireApi.addEntry(created.musicReference_id).subscribe({
      next: () => {
        this.repertoireMut.addEntry(created.musicReference_id);
        this.close();
      },
      error: (err) => {
        console.error('Reference created but failed to add to repertoire', err);
        this.error.set('Reference created but could not be added to repertoire.');
        this.saving.set(false);
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close();
  }

  close(): void {
    this.layout.clearPopover();
  }
}
