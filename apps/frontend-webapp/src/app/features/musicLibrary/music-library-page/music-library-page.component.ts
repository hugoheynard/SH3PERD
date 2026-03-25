import { Component, inject, signal } from '@angular/core';
import { MusicLibrarySelectorService } from '../services/selector-layer/music-library-selector.service';
import { MusicTabMutationService } from '../services/mutations-layer/music-tab-mutation.service';
import { MusicReferenceMutationService } from '../services/mutations-layer/music-reference-mutation.service';
import { MusicRepertoireMutationService } from '../services/mutations-layer/music-repertoire-mutation.service';
import { MusicVersionMutationService } from '../services/mutations-layer/music-version-mutation.service';
import { MusicLibraryHeaderComponent } from '../components/music-library-header/music-library-header.component';
import { MusicTabBarComponent } from '../components/music-tab-bar/music-tab-bar.component';
import { MusicLibrarySidePanelComponent } from '../components/music-library-side-panel/music-library-side-panel.component';
import { MusicReferenceCardComponent } from '../components/music-reference-card/music-reference-card.component';
import { MusicRepertoireTableComponent } from '../components/music-repertoire-table/music-repertoire-table.component';
import { AddEntryPanelComponent } from '../components/add-entry-panel/add-entry-panel.component';
import type { AddEntryResult } from '../components/add-entry-panel/add-entry-panel.component';
import type { AddVersionPayload } from '../services/mutations-layer/music-version-mutation.service';
import type { VersionEditPayload } from '../components/music-repertoire-table/music-repertoire-table.component';

@Component({
  selector: 'app-music-library-page',
  standalone: true,
  imports: [
    MusicLibraryHeaderComponent,
    MusicTabBarComponent,
    MusicLibrarySidePanelComponent,
    MusicReferenceCardComponent,
    MusicRepertoireTableComponent,
    AddEntryPanelComponent,
  ],
  templateUrl: './music-library-page.component.html',
  styleUrl: './music-library-page.component.scss',
})
export class MusicLibraryPageComponent {

  public selector = inject(MusicLibrarySelectorService);
  private tabService       = inject(MusicTabMutationService);
  private refMutation      = inject(MusicReferenceMutationService);
  private repertoireMut    = inject(MusicRepertoireMutationService);
  private versionMut       = inject(MusicVersionMutationService);

  readonly viewMode      = signal<'cards' | 'table'>('cards');
  readonly entryPanelOpen = signal(false);

  /* ── Tabs ── */

  onTabSelect(id: string): void { this.tabService.setActiveTab(id); }
  onTabAdd(): void               { this.tabService.addDefaultTab(); }
  onTabClose(id: string): void   { this.tabService.closeTab(id); }

  toggleView(): void {
    this.viewMode.update(v => v === 'cards' ? 'table' : 'cards');
  }

  /* ── Add entry ── */

  onAddEntryConfirmed(result: AddEntryResult): void {
    if (result.type === 'existing') {
      this.repertoireMut.addEntry(result.referenceId);
    } else {
      const ref = this.refMutation.addReference(result.title, result.originalArtist);
      this.repertoireMut.addEntry(ref.id);
    }
    this.entryPanelOpen.set(false);
  }

  /* ── Add version ── */

  onVersionAdded(payload: AddVersionPayload): void {
    this.versionMut.addVersion(payload);
  }

  onVersionUpdated(payload: VersionEditPayload): void {
    const { versionId, ...patch } = payload;
    this.versionMut.updateVersion(versionId, patch);
  }

  /* ── Track upload / analysis ── */

  onTrackUploadRequested(versionId: string): void {
    // TODO: open file picker, upload to storage, then:
    // this.versionMut.markTrackUploaded(versionId);
    console.log('[MusicLibrary] Upload track requested for version', versionId);
  }

  onAnalyzeRequested(versionId: string): void {
    // TODO: open file picker (or use already-uploaded track), pipe through AudioAnalyzerService, then:
    // this.versionMut.saveAnalysis(versionId, snapshot);
    console.log('[MusicLibrary] Analysis requested for version', versionId);
  }

  /* ── Helpers ── */

  entryIdForRef(refId: string): string | null {
    return this.selector.entriesByReferenceId().get(refId)?.id ?? null;
  }
}
