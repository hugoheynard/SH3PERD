import {
  Component, EventEmitter, inject, Input, OnInit, Output
} from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DurationPipe} from '../../../../../pipes/duration.pipe';
import {MusicRepertoireService} from '../../services/music-repertoire.service';
import {ITabDefinition} from '../../../../components/tabSystem/tab-system/ITabDefinition';
import {TMusicTabConfiguration} from '../../types/TMusicTabConfiguration';
import { ButtonPrimaryComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'music-repertoire-table',
  standalone: true,
  imports: [CdkTableModule, NgForOf, NgIf, FormsModule, NgStyle, DurationPipe, ButtonPrimaryComponent],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss'
})
export class MusicRepertoireTableComponent implements OnInit {
  public hasError404 = false;
  public hasNoMatch = false;

  private musicRepertoireService: MusicRepertoireService = inject(MusicRepertoireService);
  @Output() openTab: EventEmitter<ITabDefinition> = new EventEmitter<ITabDefinition>();
  @Output() backToConfig: EventEmitter<void> = new EventEmitter<void>();
  @Input() configuratorData: TMusicTabConfiguration | undefined;

  public entries: any[] = [];
  public displayedColumns: { key: string; order: number }[] = [];
  public columnKeys: string[] = [];

  private excludedColumns = ['music_id', 'musicVersion_id', 'updatedAt', 'userId', 'versions'];

  // ──────────── LIFECYCLE ────────────
  async ngOnInit(): Promise<void> {
    try {
      if (!this.configuratorData || Object.keys(this.configuratorData).length === 0) {
        await this.musicRepertoireFallBack();
      } else {
        this.entries = await this.musicRepertoireService
          .executeConfigStrategy({ config: this.configuratorData }) ?? [];
      }

      if (!Array.isArray(this.entries) || this.entries.length === 0) {
        this.entries = [];
        this.hasNoMatch = true;
      } else {
        this.displayedColumns = Object.keys(this.entries[0])
          .filter(key => !this.excludedColumns.includes(key))
          .map((key, index) => ({key, order: index}));
        this.columnKeys = this.displayedColumns.map(col => col.key);
      }

    } catch (error: any) {
      if (error.status === 404) {
        this.hasError404 = true;
      } else {
        console.error('Unhandled error:', error);
      }
    }
  }

  public filter: string = '';

  //---------- Pagination properties----------//
  public pageSize = 10;
  public currentPage = 0;


  get filteredData(): any[] {
    if (!Array.isArray(this.entries)) {
      return [];
    }
    const filterValue = this.filter.toLowerCase().trim();
    return this.entries.filter(row =>
      this.columnKeys.some(key =>
        (row[key] + '').toLowerCase().includes(filterValue)
      )
    );
  }

  get pagedData(): any[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }



  async musicRepertoireFallBack(): Promise<void> {
    console.log('No config provided, falling back to default music repertoire fetch');
    this.entries = await this.musicRepertoireService.getMusicRepertoire_Me();
  }

  setPage(page: number): void {
    this.currentPage = Math.max(0, Math.min(page, this.totalPages - 1));
  };

  /**
   * Opens the details of a track entry in a new tab.
   * @param row
   */
  openDetails(row: any): void {
    // This method should be implemented to handle opening details of the entry
    this.openTab.emit({
      id: `track-${row.id}`,
      title: `Track #${row.title}`,
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
}
