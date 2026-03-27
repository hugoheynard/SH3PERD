import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MusicLibrarySelectorService } from '../services/selector-layer/music-library-selector.service';
import { MusicTabMutationService } from '../services/mutations-layer/music-tab-mutation.service';
import { MusicVersionMutationService } from '../services/mutations-layer/music-version-mutation.service';
import { MusicRepertoireMutationService } from '../services/mutations-layer/music-repertoire-mutation.service';
import { LayoutService } from '../../../core/services/layout.service';
import { MusicLibraryHeaderComponent } from '../components/music-library-header/music-library-header.component';
import { MusicTabBarComponent } from '../components/music-tab-bar/music-tab-bar.component';
import { MusicLibrarySidePanelComponent } from '../components/music-library-side-panel/music-library-side-panel.component';
import { MusicReferenceCardComponent } from '../components/music-reference-card/music-reference-card.component';
import { MusicRepertoireTableComponent } from '../components/music-repertoire-table/music-repertoire-table.component';
import { AddEntryPanelComponent } from '../components/add-entry-panel/add-entry-panel.component';
import { MusicCrossTableComponent } from '../components/music-cross-table/music-cross-table.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import type { AddVersionPayload } from '../services/mutations-layer/music-version-mutation.service';
import type { VersionEditPayload } from '../components/music-repertoire-table/music-repertoire-table.component';
import { AudioAnalyzerService } from '../../audioAnalyzer/audio-analyzer.service';
import type { AudioAnalysisSnapshot, Rating, SavedTabConfig, MusicSearchConfig } from '../music-library-types';

@Component({
  selector: 'app-music-library-page',
  standalone: true,
  imports: [
    MusicLibraryHeaderComponent,
    MusicTabBarComponent,
    MusicLibrarySidePanelComponent,
    MusicReferenceCardComponent,
    MusicRepertoireTableComponent,
    MusicCrossTableComponent,
    ButtonComponent,
  ],
  templateUrl: './music-library-page.component.html',
  styleUrl: './music-library-page.component.scss',
})
export class MusicLibraryPageComponent {

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  public selector= inject(MusicLibrarySelectorService);
  private tabService= inject(MusicTabMutationService);
  private versionMut= inject(MusicVersionMutationService);
  private repertoireMut= inject(MusicRepertoireMutationService);
  private audioAnalyzer= inject(AudioAnalyzerService);
  private layout= inject(LayoutService);

  readonly viewMode            = signal<'cards' | 'table'>('cards');
  readonly analysingVersionIds = signal<Set<string>>(new Set());
  readonly mobilePanelOpen     = signal(false);

  private pendingVersionId: string | null = null;
  private pendingMode: 'upload' | 'analyse' = 'upload';
  private trackFiles = new Map<string, File>();

  /* ── Tabs ── */

  onTabSelect(id: string): void { this.tabService.setActiveTab(id); }
  onTabAdd(): void               { this.tabService.addDefaultTab(); }
  onTabClose(id: string): void   { this.tabService.closeTab(id); }

  onSearchQueryChange(query: string): void {
    this.tabService.setSearchQuery(query);
  }

  onTabRename(event: { id: string; title: string }): void {
    this.tabService.updateTabTitle(event.id, event.title);
  }

  onConfigSave(event: { name: string; searchConfig: MusicSearchConfig }): void {
    this.tabService.saveTabConfig(event.name, event.searchConfig);
  }

  onConfigLoad(config: SavedTabConfig): void {
    this.tabService.applyTabConfig(this.selector.activeTabId(), config.searchConfig);
  }

  onConfigDelete(id: string): void {
    this.tabService.deleteTabConfig(id);
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
    this.versionMut.addVersion(payload);
  }

  onVersionUpdated(payload: VersionEditPayload): void {
    const { versionId, ...patch } = payload;
    this.versionMut.updateVersion(versionId, patch);
  }

  /* ── Delete ── */

  onVersionDeleted(versionId: string): void {
    this.versionMut.removeVersion(versionId);
  }

  onEntryDeleted(referenceId: string): void {
    // Remove all versions linked to this entry, then the entry itself
    const versions = this.selector.versionsByReferenceId().get(referenceId) ?? [];
    for (const v of versions) {
      this.versionMut.removeVersion(v.id);
    }
    this.repertoireMut.removeEntry(referenceId, 'user_me');
  }

  /* ── Track upload / analysis ── */

  onTrackUploadRequested(versionId: string): void {
    this.pendingVersionId = versionId;
    this.pendingMode = 'upload';
    this.fileInputRef.nativeElement.click();
  }

  onAnalyzeRequested(versionId: string): void {
    const file = this.trackFiles.get(versionId);
    if (file) {
      this.startAnalysis(versionId, file);
    } else {
      this.pendingVersionId = versionId;
      this.pendingMode = 'analyse';
      this.fileInputRef.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file || !this.pendingVersionId) return;
    const versionId = this.pendingVersionId;
    this.pendingVersionId = null;
    this.trackFiles.set(versionId, file);
    if (this.pendingMode === 'upload') {
      this.versionMut.markTrackUploaded(versionId);
    } else {
      this.startAnalysis(versionId, file);
    }
  }

  private startAnalysis(versionId: string, file: File): void {
    this.analysingVersionIds.update(s => new Set([...s, versionId]));
    this.audioAnalyzer.analyze(file).subscribe({
      next: (event) => {
        if (event.type === 'result') {
          const snapshot = this.toSnapshot(event.report);
          this.versionMut.saveAnalysis(versionId, snapshot);
          this.analysingVersionIds.update(s => { const n = new Set(s); n.delete(versionId); return n; });
        }
      },
      error: (err) => {
        console.error('[MusicLibrary] Analysis failed for', versionId, err);
        this.analysingVersionIds.update(s => { const n = new Set(s); n.delete(versionId); return n; });
      },
    });
  }

  private toSnapshot(report: import('../../audioAnalyzer/audio-analysis-types').AudioAnalysisReport): AudioAnalysisSnapshot {
    let quality: Rating;
    if (report.clippingRatio < 0.001 && report.SNRdB > 50 && report.truePeakdBTP < -1) quality = 4;
    else if (report.clippingRatio < 0.005 && report.SNRdB > 35) quality = 3;
    else if (report.clippingRatio < 0.02 && report.SNRdB > 20) quality = 2;
    else quality = 1;
    return {
      integratedLUFS: report.integratedLUFS,
      loudnessRange:  report.loudnessRange,
      truePeakdBTP:   report.truePeakdBTP,
      SNRdB:          report.SNRdB,
      clippingRatio:  report.clippingRatio,
      quality,
    };
  }

  /* ── Helpers ── */

  entryIdForRef(refId: string): string | null {
    return this.selector.entriesByReferenceId().get(refId)?.id ?? null;
  }
}
