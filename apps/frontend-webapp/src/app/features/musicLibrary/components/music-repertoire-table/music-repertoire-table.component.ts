import {
  Component, EventEmitter, inject, Input, type OnInit, Output
} from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { NgForOf, NgIf } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MusicRepertoireService} from '../../services/music-repertoire.service';
import type { ITabDefinition } from '../../../../shared/tabSystem/tab-system/ITabDefinition';
import type { TMusicTabConfiguration } from '../../types/TMusicTabConfiguration';
import {
  ButtonPrimaryComponent, ButtonSecondaryComponent,
} from '@sh3pherd/ui-angular';
import type { TUserMusicLibraryItem } from '@sh3pherd/shared-types';
import { MusicCardComponent } from '../music-card/music-card.component';
import { MusicLibraryStatsComponent } from '../music-library-stats/music-library-stats.component'
import { MusicLibraryFiltersComponent } from '../music-library-filters/music-library-filters.component';
import { PaginatorComponent } from '../../../../shared/paginator/paginator.component';



@Component({
  selector: 'music-repertoire-table',
  standalone: true,
  imports: [CdkTableModule, NgForOf, NgIf, FormsModule, ButtonPrimaryComponent, MusicCardComponent, MusicLibraryStatsComponent, MusicLibraryFiltersComponent, PaginatorComponent, ButtonSecondaryComponent],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss'
})
export class MusicRepertoireTableComponent implements OnInit {
  @Output() openTab: EventEmitter<ITabDefinition> = new EventEmitter<ITabDefinition>();
  @Output() backToConfig: EventEmitter<void> = new EventEmitter<void>();
  @Input() configuratorData: TMusicTabConfiguration | undefined;
  public hasError404: boolean = false;
  public hasNoMatch: boolean = false;
  private musicRepertoireService: MusicRepertoireService = inject(MusicRepertoireService);
  public tableData: any[] = [];
  public columns: { key: string; order: number }[] = [];
  public columnKeys: string[] = [];
  public filter: string = '';
  //---------- Pagination properties----------//
  public pageSize = 10;
  public currentPage = 0;

  public statContainerOpen: boolean = false;

  /**
   * Formats the data for the table display.
   * @param data
   */
  formatTableData(data: TUserMusicLibraryItem[]): any[] {
    this.defineDisplayedColumns();

    return data.map((row: TUserMusicLibraryItem): any => {
      return {
        title: row.version?.title || 'N/A',
        artist: row.version?.artist || 'N/A',
        type: row.version?.type ? row.version.type : 'N/A',
        genre: row.version?.genre ? row.version.genre : 'N/A',
        pitch: row.version?.pitch ? `${row.version.pitch} st` : 'N/A',
        referenceId: !!row.version?.musicReference_id,
        //bpm: row.version?.bpm ? `${row.bpm} BPM` : 'N/A',
        energy: row.repertoireEntry?.energy ? row.repertoireEntry.energy : 'N/A',
        effort: row.repertoireEntry?.effort ? row.repertoireEntry.effort : 'N/A',
        mastery: row.repertoireEntry?.mastery ? row.repertoireEntry.mastery : 'N/A',
        affinity: row.repertoireEntry?.affinity ? row.repertoireEntry.affinity : 'N/A',
      };
    })
  };

  /**
   * Defines the columns to be displayed in the table.
   */
  defineDisplayedColumns(): void {
    this.columns = [
      { key: 'title', order: 0 },
      { key: 'artist', order: 1 },
      //{ key: 'bpm', order: 2 },
      { key: 'type', order: 3 },
      { key: 'genre', order: 2 },
      { key: 'pitch', order: 3 },
      { key: 'referenceId', order: 4 },
      { key: 'energy', order: 4 },
      { key: 'effort', order: 5 },
      { key: 'mastery', order: 6 },
      { key: 'affinity', order: 7 }
    ];
    this.columnKeys = this.columns.map(col => col.key);
  };


  // ──────────── LIFECYCLE ────────────
  async ngOnInit(): Promise<void> {
    try {
      if (!this.configuratorData || Object.keys(this.configuratorData).length === 0) {
        await this.musicRepertoireFallBack();
        return;
      }

      const data: TUserMusicLibraryItem[] = Object
        .values(await this.musicRepertoireService
          .executeConfigStrategy({ config: this.configuratorData }) ?? [])

      if (!Array.isArray(this.tableData) || this.tableData.length === 0) {
        this.tableData = [];
        this.hasNoMatch = true;
        return;
      }

      //this.tableData = this.formatTableData(data);
      this.tableData = data;
      return;

    } catch (error: any) {
      if (error.status === 404) {
        this.hasError404 = true;
        return;
      }
      console.error('Unhandled error:', error);
    }
  };




  get filteredData(): any[] {
    if (!Array.isArray(this.tableData)) {
      return [];
    }
    /*
    const filterValue = this.filter.toLowerCase().trim();
    return this.tableData.filter(row =>
      this.columnKeys.some(key =>
        (row[key] + '').toLowerCase().includes(filterValue)
      )
    );

     */
    return []
  };

  async musicRepertoireFallBack(): Promise<void> {
    console.log('No config provided, falling back to default music repertoire fetch');

    const data: TUserMusicLibraryItem[] = Object
      .values(await this.musicRepertoireService.getSingleUserMusicLibrary_me());
    //this.tableData = this.formatTableData(data);

    this.tableData = data;
  };



  /**
   * Opens the details of a track entry in a new tab.
   * @param row
   */
  openDetails(row: any): void {
    // This method should be implemented to handle opening details of the entry
    this.openTab.emit({
      id: `track-${row.id}`,
      title: `Track #${row.label}`,
      hasConfigurator: true,
      configComponentKey: 'music-version-details',
      displayComponentKey: 'music-version-details',
      configMode: false,
      configuratorData: row,
      isActive: true,
      isDeletable: true,
      isSearchable: false,
      default: false,
    });
  }

  readonly handleBackToConfig = (): void => {
    this.backToConfig.emit();
  };

  createNewVersion(): void {};


  // -------------- UI -----------------
  /**
   * Toggles the visibility of the general statistics container.
   */
  toggleStatContainer(): void {
    this.statContainerOpen = !this.statContainerOpen;
    return;
  };
}
