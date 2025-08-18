import { Component, input } from '@angular/core';

@Component({
  selector: 'paginator',
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent {
  pageSize = input<number>(10);
  currentPage: number = 0;

  get totalPages(): number {
    return 0;
  }

  setPage(page: number): void {
    this.currentPage = Math.max(0, Math.min(page, this.totalPages - 1));
  };

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  };

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  };
}
