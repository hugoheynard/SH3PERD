import { Component, computed, ElementRef, inject, type OnInit, signal, ViewChild } from '@angular/core';
import { MusicLibrarySelectorService } from '../services/selector-layer/music-library-selector.service';
import { MusicLibraryStateService } from '../services/music-library-state.service';
import { MusicTabMutationService } from '../services/mutations-layer/music-tab-mutation.service';
import { MusicLibraryMutationService } from '../services/mutations-layer/music-library-mutation.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ConfigurableTabBarComponent } from '../../../shared/configurable-tab-bar/configurable-tab-bar.component';
import { FormsModule } from '@angular/forms';
import type { MusicTab } from '../music-library-types';
import { MusicLibrarySidePanelComponent } from '../components/music-library-side-panel/music-library-side-panel.component';
import { MusicReferenceCardComponent } from '../components/music-reference-card/music-reference-card.component';
import { MusicRepertoireTableComponent } from '../components/music-repertoire-table/music-repertoire-table.component';
import { AddEntryPanelComponent } from '../components/add-entry-panel/add-entry-panel.component';
import { MusicCrossTableComponent } from '../components/music-cross-table/music-cross-table.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import type { AddVersionPayload } from '../services/mutations-layer/music-library-mutation.service';
import type { VersionEditPayload } from '../components/music-repertoire-table/music-repertoire-table.component';
import { AudioAnalyzerService } from '../../audioAnalyzer/audio-analyzer.service';
import { MusicVersionApiService } from '../services/music-version-api.service';
import { MusicRepertoireApiService } from '../services/music-repertoire-api.service';
import { VersionType } from '../music-library-types';
import type { AudioAnalysisSnapshot, Rating, SavedTabConfig } from '../music-library-types';
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
    InfoDirective,
  ],
  templateUrl: './music-library-page.component.html',
  styleUrl: './music-library-page.component.scss',
})
export class MusicLibraryPageComponent implements OnInit {

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  public selector         = inject(MusicLibrarySelectorService);
  private stateService    = inject(MusicLibraryStateService);
  private tabService      = inject(MusicTabMutationService);
  private mutation        = inject(MusicLibraryMutationService);
  private versionApi      = inject(MusicVersionApiService);
  private repertoireApi   = inject(MusicRepertoireApiService);
  private audioAnalyzer   = inject(AudioAnalyzerService);
  private layout          = inject(LayoutService);
  private toast           = inject(ToastService);

  readonly activeSearchQuery = computed(() => {
    const tab = this.selector.activeTab();
    return tab?.config.searchQuery ?? '';
  });

  ngOnInit(): void {
    this.tabService.init();
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

  onTabSelect(id: string): void { this.tabService.setActiveTab(id); }
  onTabAdd(): void               { this.tabService.addDefaultTab(); }
  onTabClose(id: string): void   { this.tabService.closeTab(id); }

  onSearchQueryChange(query: string): void {
    this.tabService.setSearchQuery(this.selector.activeTabId(), query);
  }

  onTabRename(event: { id: string; title: string }): void {
    this.tabService.updateTabTitle(event.id, event.title);
  }

  onTabReorder(event: { tabId: string; newIndex: number }): void {
    this.tabService.reorderTab(event.tabId, event.newIndex);
  }

  onTabColorChange(event: { id: string; color: string }): void {
    this.tabService.setTabColor(event.id, event.color);
  }

  onConfigSave(name: string): void {
    this.tabService.saveTabConfig(name);
    this.toast.show(`Config "${name}" saved`, 'success');
  }

  onConfigNew(): void {
this.tabService.newConfig();
    this.toast.show('New configuration started', 'info');
  }

  onConfigLoad(config: SavedTabConfig): void {
    this.tabService.applyTabConfig(config);
    this.toast.show(`Config "${config.name}" applied (${config.tabs.length} tabs)`, 'success');
  }

  onConfigDelete(id: string): void {
    this.tabService.deleteTabConfig(id);
    this.toast.show('Config deleted', 'info');
  }

  onConfigRename(event: { configId: string; name: string }): void {
    this.tabService.renameTabConfig(event.configId, event.name);
  }

  onConfigTabRemove(event: { configId: string; tabId: string }): void {
    this.tabService.removeTabFromConfig(event.configId, event.tabId);
  }

  onConfigTabRename(event: { configId: string; tabId: string; title: string }): void {
    this.tabService.renameTabInConfig(event.configId, event.tabId, event.title);
  }

  onConfigTabMove(event: { sourceConfigId: string; targetConfigId: string; tabId: string }): void {
    this.tabService.moveTabToConfig(event.sourceConfigId, event.targetConfigId, event.tabId);
  }

  onTabMoveToConfig(event: { tab: MusicTab; targetConfigId: string }): void {
    this.tabService.moveActiveTabToConfig(event.tab.id, event.targetConfigId);
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
    const file = this.trackFiles.get(event.trackId);
    if (!file) {
      console.warn('[MusicLibrary] No local track file for track', event.trackId);
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  onFavoriteChanged(event: { entryId: string; versionId: string; trackId: string }): void {
    this.mutation.setFavoriteTrack(event.entryId, event.versionId, event.trackId);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file || !this.pendingVersionId || !this.pendingEntryId) return;
    const entryId = this.pendingEntryId;
    const versionId = this.pendingVersionId;
    this.pendingEntryId = null;
    this.pendingVersionId = null;

    const track = this.mutation.addTrack(entryId, versionId, file.name);
    this.trackFiles.set(track.id, file);
    this.toast.show(`Track "${file.name}" uploaded`, 'success');
    this.startAnalysis(entryId, versionId, track.id, file);
  }

  private startAnalysis(entryId: string, versionId: string, trackId: string, file: File): void {
    this.analysingVersionIds.update(s => new Set([...s, versionId]));
    this.audioAnalyzer.analyze(file).subscribe({
      next: (event) => {
        if (event.type === 'result') {
          const snapshot = this.toSnapshot(event.report);
          this.mutation.saveTrackAnalysis(entryId, versionId, trackId, snapshot);
          this.analysingVersionIds.update(s => { const n = new Set(s); n.delete(versionId); return n; });
          this.toast.show(`Analysis complete — Quality ${snapshot.quality}/4`, 'success');
        }
      },
      error: (err) => {
        console.error('[MusicLibrary] Analysis failed for track', trackId, err);
        this.analysingVersionIds.update(s => { const n = new Set(s); n.delete(versionId); return n; });
        this.toast.show('Analysis failed', 'error');
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
}
