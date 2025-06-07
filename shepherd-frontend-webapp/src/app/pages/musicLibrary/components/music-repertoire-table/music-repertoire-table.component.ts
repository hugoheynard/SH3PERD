import {
  Component, EventEmitter, inject, Input, OnInit, Output
} from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DurationPipe} from '../../../../../pipes/duration.pipe';
import {MusicRepertoireService} from '../../../../services/music-repertoire.service';
import {ITabDefinition} from '../../../../components/tab-system/ITabDefinition';

@Component({
  selector: 'music-repertoire-table',
  standalone: true,
  imports: [CdkTableModule, NgForOf, NgIf, FormsModule, NgStyle, DurationPipe],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss'
})
export class MusicRepertoireTableComponent implements OnInit {
  private musicRepertoireService: MusicRepertoireService = inject(MusicRepertoireService);
  @Output() openTab: EventEmitter<ITabDefinition> = new EventEmitter<ITabDefinition>();
  @Input() configData: any = {};

  public entries: any[] = [];
  public displayedColumns: { key: string; order: number }[] = [];
  public columnKeys: string[] = [];

  private excludedColumns = ['music_id', 'musicVersion_id', 'updatedAt', 'userId', 'versions'];



  public filter: string = '';

  //---------- Pagination properties----------//
  public pageSize = 10;
  public currentPage = 0;


  get filteredData(): any[] {
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

  async ngOnInit(): Promise<void> {

    if (!this.configData) {
      await this.musicRepertoireFallBack();
    }

    this.entries = await this.musicRepertoireService.executeConfigStrategy({ config: this.configData });


      // Filter out excluded columns and set displayedColumns
      if (this.entries.length > 0) {
        this.displayedColumns = Object.keys(this.entries[0])
          .filter(key => !this.excludedColumns.includes(key))
          .map((key, index) => ({key, order: index}));

        this.columnKeys = this.displayedColumns.map(col => col.key);
      }
  };

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
      hasConfigurator: false,
      configComponentKey: 'music-version-details',
      displayComponentKey: 'music-version-details',
      configMode: false,
      configData: row,
      isActive: true,
      isDeletable: true,
      isSearchable: false,
      default: false,
    });
  }
}
