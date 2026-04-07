import { Component, computed, ElementRef, inject, type OnInit, signal, ViewChild } from '@angular/core';
import { MusicLibrarySelectorService } from '../services/selector-layer/music-library-selector.service';
import { MusicLibraryStateService } from '../services/music-library-state.service';
import { MusicTabMutationService } from '../services/mutations-layer/music-tab-mutation.service';
import { MusicLibraryMutationService } from '../services/mutations-layer/music-library-mutation.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ConfigurableTabBarComponent, provideTabHandlers } from '../../../shared/configurable-tab-bar';
import { FormsModule } from '@angular/forms';
import { MusicLibrarySidePanelComponent } from '../components/music-library-side-panel/music-library-side-panel.component';
import { MusicReferenceCardComponent } from '../components/music-reference-card/music-reference-card.component';
import { MusicRepertoireTableComponent } from '../components/music-repertoire-table/music-repertoire-table.component';
import { AddEntryPanelComponent } from '../components/add-entry-panel/add-entry-panel.component';
import { MusicCrossTableComponent } from '../components/music-cross-table/music-cross-table.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ViewToggleComponent } from '../../../shared/view-toggle/view-toggle.component';
import type { AddVersionPayload } from '../services/mutations-layer/music-library-mutation.service';
import type { VersionEditPayload } from '../components/music-repertoire-table/music-repertoire-table.component';
import { MusicVersionApiService } from '../services/music-version-api.service';
import { MusicTrackApiService } from '../services/music-track-api.service';
import { MusicRepertoireApiService } from '../services/music-repertoire-api.service';
import { VersionType } from '../music-library-types';
import type { TCreateMusicVersionPayload, TMusicReferenceId } from '@sh3pherd/shared-types';
import { ToastService } from '../../../shared/toast/toast.service';
import { InfoDirective } from '../../../shared/help/info.directive';

@Component({
  selector: 'app-music-library-page',
  standalone: true,
  imports: [
    ConfigurableTabBarComponent,
    FormsModule,
    MusicLibrarySidePanelComponent,
    MusicReferenceCardComponent,
    MusicRepertoireTableComponent,
    MusicCrossTableComponent,
    ButtonComponent,
    ViewToggleComponent,
    InfoDirective,
  ],
  templateUrl: './music-library-page.component.html',
  styleUrl: './music-library-page.component.scss',
  providers: [provideTabHandlers(MusicTabMutationService)],
})
export class MusicLibraryPageComponent implements OnInit {

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  public selector         = inject(MusicLibrarySelectorService);
  private stateService    = inject(MusicLibraryStateService);
  private tabService      = inject(MusicTabMutationService);
  private mutation        = inject(MusicLibraryMutationService);
  private versionApi      = inject(MusicVersionApiService);
  private trackApi        = inject(MusicTrackApiService);
  private repertoireApi   = inject(MusicRepertoireApiService);
  private layout          = inject(LayoutService);
  private toast           = inject(ToastService);

  readonly activeSearchQuery = computed(() => {
    const tab = this.selector.activeTab();
    return tab?.config.searchQuery ?? '';
  });

  ngOnInit(): void {
    this.stateService.loadLibrary();
  }

  readonly viewMode            = signal<'cards' | 'table'>('cards');
  readonly analysingVersionIds = signal<Set<string>>(new Set());
  readonly mobilePanelOpen     = signal(false);

  /** Pending upload context. */
  private pendingEntryId: string | null = null;
  private pendingVersionId: string | null = null;
  private trackFiles = new Map<string, File>();

  /* ── Tabs ── */

  onSearchQueryChange(query: string): void {
    this.tabService.setSearchQuery(this.selector.activeTabId(), query);
  }

  toggleView(): void {
    this.viewMode.update(v => v === 'cards' ? 'table' : 'cards');
  }

  toggleMobilePanel(): void {
    this.mobilePanelOpen.update(v => !v);
  }

  /* ── Add entry ── */

  openAddEntryPanel(): void {
    this.layout.setPopover(AddEntryPanelComponent);
  }

  /* ── Add version ── */

  onVersionAdded(payload: AddVersionPayload): void {
    const entry = this.selector.findEntry(payload.entryId);
    if (!entry) return;

    const apiPayload: TCreateMusicVersionPayload = {
      musicReference_id: entry.reference.id as TMusicReferenceId,
      label: payload.label,
      genre: payload.genre,
      type: VersionType.Original,
      bpm: payload.bpm ?? null,
      pitch: null,
      mastery: payload.mastery,
      energy: payload.energy,
      effort: payload.effort,
      notes: payload.notes,
    };

    this.versionApi.create(apiPayload).subscribe({
      next: (created) => {
        this.mutation.addVersionFromApi(payload.entryId, {
          id: created.id,
          label: created.label,
          genre: created.genre,
          type: created.type,
          bpm: created.bpm,
          pitch: created.pitch,
          notes: created.notes,
          mastery: created.mastery,
          energy: created.energy,
          effort: created.effort,
          tracks: created.tracks,
        });
        this.toast.show(`Version "${payload.label}" added`, 'success');
      },
      error: () => {
        this.toast.show('Failed to create version', 'error');
      },
    });
  }

  onVersionUpdated(payload: VersionEditPayload): void {
    const { entryId, versionId, ...patch } = payload;
    this.versionApi.update(versionId as any, patch).subscribe({
      next: () => {
        this.mutation.updateVersion(entryId, versionId, patch);
        this.toast.show('Version updated', 'success');
      },
      error: () => {
        this.toast.show('Failed to update version', 'error');
      },
    });
  }

  onEditVersionFromCard(_versionId: string): void {
    this.viewMode.set('table');
    this.toast.show('Switched to table view for editing', 'info');
  }

  /* ── Delete ── */

  onVersionDeleted(event: { entryId: string; versionId: string }): void {
    this.versionApi.delete(event.versionId as any).subscribe({
      next: () => {
        this.mutation.removeVersion(event.entryId, event.versionId);
        this.toast.show('Version deleted', 'info');
      },
      error: () => {
        this.toast.show('Failed to delete version', 'error');
      },
    });
  }

  onEntryDeleted(entryId: string): void {
    this.repertoireApi.deleteEntry(entryId as any).subscribe({
      next: () => {
        this.mutation.removeEntry(entryId);
        this.toast.show('Entry removed from repertoire', 'info');
      },
      error: () => {
        this.toast.show('Failed to remove entry', 'error');
      },
    });
  }

  /* ── Track upload / analysis ── */

  onTrackUploadRequested(event: { entryId: string; versionId: string }): void {
    this.pendingEntryId = event.entryId;
    this.pendingVersionId = event.versionId;
    this.fileInputRef.nativeElement.click();
  }

  onTrackDownloadRequested(event: { versionId: string; trackId: string }): void {
    // Try local cache first (freshly uploaded files)
    const file = this.trackFiles.get(event.trackId);
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Otherwise fetch presigned URL from backend
    this.trackApi.getDownloadUrl(event.versionId as any, event.trackId as any).subscribe({
      next: (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.target = '_blank';
        a.click();
      },
      error: () => {
        // Toast already shown by trackApi
      },
    });
  }

  onFavoriteChanged(event: { entryId: string; versionId: string; trackId: string }): void {
    this.mutation.setFavoriteTrack(event.entryId, event.versionId, event.trackId);
    this.trackApi.setFavorite(event.versionId as any, event.trackId as any).subscribe({
      error: () => {
        // Revert optimistic update on failure — toast already shown
      },
    });
  }

  onTrackDeleteRequested(event: { entryId: string; versionId: string; trackId: string }): void {
    this.trackApi.delete(event.versionId as any, event.trackId as any).subscribe({
      next: () => {
        this.mutation.removeTrack(event.entryId, event.versionId, event.trackId);
        this.trackFiles.delete(event.trackId);
        this.toast.show('Track deleted', 'success');
      },
      error: () => {
        // Toast already shown by trackApi
      },
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file || !this.pendingVersionId || !this.pendingEntryId) return;
    const entryId = this.pendingEntryId;
    const versionId = this.pendingVersionId as any;
    this.pendingEntryId = null;
    this.pendingVersionId = null;

    this.trackApi.upload(versionId, file).subscribe({
      next: (track) => {
        this.mutation.addTrackFromApi(entryId, versionId, track);
        this.trackFiles.set(track.id, file);
        this.toast.show(`Track "${file.name}" uploaded — analysis in progress`, 'success');
      },
      error: () => {
        // Toast already shown by trackApi
      },
    });
  }

}
