import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';

function create(props: { currentPage: number; pageSize: number; totalItems: number; siblingCount?: number; disabled?: boolean }) {
  const fixture: ComponentFixture<PaginatorComponent> = TestBed.createComponent(PaginatorComponent);
  const ref = fixture.componentRef;
  ref.setInput('currentPage', props.currentPage);
  ref.setInput('pageSize', props.pageSize);
  ref.setInput('totalItems', props.totalItems);
  if (props.siblingCount !== undefined) ref.setInput('siblingCount', props.siblingCount);
  if (props.disabled !== undefined) ref.setInput('disabled', props.disabled);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('PaginatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent],
    }).compileComponents();
  });

  describe('derived state', () => {
    it('computes totalPages by dividing totalItems by pageSize', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 237 });
      expect(component.totalPages()).toBe(24);
    });

    it('returns totalPages = 1 when there are no items', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 0 });
      expect(component.totalPages()).toBe(1);
    });

    it('computes the visible item range for the current page', () => {
      const { component } = create({ currentPage: 3, pageSize: 10, totalItems: 237 });
      expect(component.rangeStart()).toBe(21);
      expect(component.rangeEnd()).toBe(30);
    });

    it('clamps the last range to totalItems on the final page', () => {
      const { component } = create({ currentPage: 24, pageSize: 10, totalItems: 237 });
      expect(component.rangeStart()).toBe(231);
      expect(component.rangeEnd()).toBe(237);
    });

    it('reports rangeStart=0 when empty', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 0 });
      expect(component.rangeStart()).toBe(0);
      expect(component.rangeEnd()).toBe(0);
    });
  });

  describe('navigation guards', () => {
    it('disables prev on the first page', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 100 });
      expect(component.canGoPrev()).toBe(false);
      expect(component.canGoNext()).toBe(true);
    });

    it('disables next on the last page', () => {
      const { component } = create({ currentPage: 10, pageSize: 10, totalItems: 100 });
      expect(component.canGoPrev()).toBe(true);
      expect(component.canGoNext()).toBe(false);
    });

    it('disables both when the disabled input is set', () => {
      const { component } = create({ currentPage: 5, pageSize: 10, totalItems: 100, disabled: true });
      expect(component.canGoPrev()).toBe(false);
      expect(component.canGoNext()).toBe(false);
    });
  });

  describe('pageItems (ellipsis algorithm)', () => {
    it('renders every page when total fits without ellipsis', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 50, siblingCount: 1 });
      const pages = component.pageItems().map(i => (i.kind === 'page' ? i.page : '…'));
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('shows a right gap when current page is near the start', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 100, siblingCount: 1 });
      const pages = component.pageItems().map(i => (i.kind === 'page' ? i.page : '…'));
      expect(pages).toEqual([1, 2, '…', 10]);
    });

    it('shows gaps on both sides when current is in the middle', () => {
      const { component } = create({ currentPage: 5, pageSize: 10, totalItems: 100, siblingCount: 1 });
      const pages = component.pageItems().map(i => (i.kind === 'page' ? i.page : '…'));
      expect(pages).toEqual([1, '…', 4, 5, 6, '…', 10]);
    });

    it('shows a left gap when current is near the end', () => {
      const { component } = create({ currentPage: 10, pageSize: 10, totalItems: 100, siblingCount: 1 });
      const pages = component.pageItems().map(i => (i.kind === 'page' ? i.page : '…'));
      expect(pages).toEqual([1, '…', 9, 10]);
    });
  });

  describe('events', () => {
    it('emits pageChange when goToPage moves to a different page', () => {
      const { component } = create({ currentPage: 3, pageSize: 10, totalItems: 100 });
      const spy = jasmine.createSpy('pageChange');
      component.pageChange.subscribe(spy);

      component.goToPage(5);

      expect(spy).toHaveBeenCalledOnceWith(5);
    });

    it('does not emit pageChange when the target equals the current page', () => {
      const { component } = create({ currentPage: 3, pageSize: 10, totalItems: 100 });
      const spy = jasmine.createSpy('pageChange');
      component.pageChange.subscribe(spy);

      component.goToPage(3);

      expect(spy).not.toHaveBeenCalled();
    });

    it('clamps out-of-range targets to [1, totalPages]', () => {
      const { component } = create({ currentPage: 5, pageSize: 10, totalItems: 100 });
      const spy = jasmine.createSpy('pageChange');
      component.pageChange.subscribe(spy);

      component.goToPage(999);
      component.goToPage(-7);

      expect(spy.calls.allArgs()).toEqual([[10], [1]]);
    });

    it('does not emit when disabled', () => {
      const { component } = create({ currentPage: 5, pageSize: 10, totalItems: 100, disabled: true });
      const spy = jasmine.createSpy('pageChange');
      component.pageChange.subscribe(spy);

      component.goToPage(6);
      component.prev();
      component.next();

      expect(spy).not.toHaveBeenCalled();
    });

    it('emits pageSizeChange with the new size', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 100 });
      const spy = jasmine.createSpy('pageSizeChange');
      component.pageSizeChange.subscribe(spy);

      component.onPageSizeChange('25');

      expect(spy).toHaveBeenCalledOnceWith(25);
    });

    it('ignores pageSizeChange when the value is invalid or unchanged', () => {
      const { component } = create({ currentPage: 1, pageSize: 10, totalItems: 100 });
      const spy = jasmine.createSpy('pageSizeChange');
      component.pageSizeChange.subscribe(spy);

      component.onPageSizeChange('not-a-number');
      component.onPageSizeChange('0');
      component.onPageSizeChange('10'); // same as current

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
