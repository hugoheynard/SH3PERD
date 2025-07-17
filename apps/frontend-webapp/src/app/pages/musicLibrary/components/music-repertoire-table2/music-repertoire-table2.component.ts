import { Component } from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef,
  CdkTable,
} from '@angular/cdk/table';
import {DurationPipe} from '../../../../../pipes/duration.pipe';

import { NgForOf, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-music-repertoire-table2',
  imports: [
    CdkTable,
    CdkColumnDef,
    CdkHeaderCell,
    NgForOf,
    CdkHeaderCellDef,
    CdkCell,
    CdkCellDef,
    NgIf,
    CdkHeaderRow,
    CdkRow,
    CdkRowDef,
    NgStyle,
    CdkHeaderRowDef,
    DurationPipe,
  ],
  templateUrl: './music-repertoire-table2.component.html',
  standalone: true,
  styleUrl: './music-repertoire-table2.component.scss',
})
export class MusicRepertoireTable2Component {
  public entries: any[] = [];
  public displayedColumns: { key: string; order: number }[] = [ {
    key: 'Title', order: 1
  }];
  public columnKeys: string[] = [];


  public filter: string = '';
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

  //---------- Pagination properties----------//
  public pageSize = 10;
  public currentPage = 0;
  get pagedData(): any[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }
}
