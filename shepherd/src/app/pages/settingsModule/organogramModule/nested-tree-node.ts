import {signal} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TreeOption} from './tree-option';



export class NestedTreeNode {
  data = [
    {
      name: 'artistic',
      children: [
        {}
      ]
    },
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
    "Item 6",
    "Item 7",
    "Item 8",
    "Item 9",
    "Item 10"
  ]

  children = new BehaviorSubject<Array<NestedTreeNode>>([]);

  expandable = signal(true);
  loading = signal(false);
  options = signal<Set<TreeOption>>(new Set<TreeOption>())
  selected = signal(false);

  constructor(public level: number, public data: any, public parent?: NestedTreeNode) {
  }
}
