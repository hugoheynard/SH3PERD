import { TestBed } from '@angular/core/testing';
import { TreeUtilsService } from './tree-utils.service';

describe('TreeUtilsService', () => {
  let service: TreeUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeUtilsService);
  });

  it('should expand all nodes', () => {
    const tree = [
      { value: 'A', expanded: false, children: [{ value: 'B', expanded: false, children: [] }] }
    ];

    service.expandAll(tree);
    expect(tree[0].expanded).toBeTrue();
    expect(tree[0].children[0].expanded).toBeTrue();
  });

  it('should set selection state recursively', () => {
    const tree = [
      { value: 'A', selected: false, children: [{ value: 'B', selected: false, children: [] }] }
    ];

    service.setSelectionState(tree[0], true);
    expect(tree[0].selected).toBeTrue();
    expect(tree[0].children[0].selected).toBeTrue();
  });
});
