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
import { MusicLibraryMutationService } from '../../services/mutations-layer/music-library-mutation.service';

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
  private readonly refApi = inject(MusicReferenceService);
  private readonly repertoireApi = inject(MusicRepertoireApiService);
  private readonly mutation = inject(MusicLibraryMutationService);

  // UI state
  readonly query = signal('');
  readonly newArtist = signal('');
  readonly showNewForm = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  /** All references extracted from entries. */
  private readonly allRefs = computed(() =>
    this.selector.entries().map(e => e.reference),
  );

  /** Set of reference IDs that are already in the repertoire. */
  readonly inRepertoire = computed(() =>
    new Set(this.selector.entries().map(e => e.reference.id)),
  );

  readonly filteredRefs = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.allRefs().slice(0, 8);
    return this.allRefs()
      .filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.originalArtist.toLowerCase().includes(q)
      )
      .slice(0, 8);
  });

  readonly hasExactMatch = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.allRefs().some(r => r.title.toLowerCase() === q);
  });

  /** Add an existing reference to the repertoire. */
  selectRef(referenceId: string): void {
    if (this.inRepertoire().has(referenceId as any) || this.saving()) return;

    this.saving.set(true);
    this.error.set('');

    const ref = this.allRefs().find(r => r.id === referenceId);
    if (!ref) return;

    this.repertoireApi.addEntry(referenceId).subscribe({
      next: () => {
        this.mutation.addEntry(ref);
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

    const created = await this.refApi.createOne({ title, artist });

    if (!created) {
      this.error.set('Failed to create reference.');
      this.saving.set(false);
      return;
    }

    this.repertoireApi.addEntry(created.id).subscribe({
      next: () => {
        this.mutation.addEntry({
          id: created.id,
          title: created.title,
          originalArtist: created.artist,
        });
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
