import {
  Component, inject, OnInit
} from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import { MusicRepertoireService } from '../../../services/music-repertoire.service';
import {FormsModule} from '@angular/forms';
import {DurationPipe} from '../../../../pipes/duration.pipe';

@Component({
  selector: 'music-repertoire-table',
  standalone: true,
  imports: [CdkTableModule, NgForOf, NgIf, FormsModule, NgStyle, DurationPipe],
  templateUrl: './music-repertoire-table.component.html',
  styleUrl: './music-repertoire-table.component.scss'
})
export class MusicRepertoireTableComponent implements OnInit {
  private musicRepertoireService: MusicRepertoireService = inject(MusicRepertoireService);

  public entries: any[] = [];
  public displayedColumns: { key: string; order: number }[] = [];
  public columnKeys: string[] = [];

  private excludedColumns = ['music_id', 'musicVersion_id', 'updatedAt', 'userId', 'versions'];

  public filter: string = '';
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
    const entries = await this.musicRepertoireService.getMusicRepertoire_Me();
    this.entries = entries;

    if (entries.length > 0) {
      this.displayedColumns = Object.keys(entries[0])
        .filter(key => !this.excludedColumns.includes(key))
        .map((key, index) => ({ key, order: index }));

      this.columnKeys = this.displayedColumns.map(col => col.key);
    }
  }

  setPage(page: number): void {
    this.currentPage = Math.max(0, Math.min(page, this.totalPages - 1));
  }
}
