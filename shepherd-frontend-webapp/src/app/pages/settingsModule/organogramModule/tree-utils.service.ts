import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TreeUtilsService {
  expandAll(nodes: any[]): void {
    nodes.forEach(node => {
      node.expanded = true;
      if (node.children) {
        this.expandAll(node.children);
      }
    });
  };

  flattenNodes(nodes: any[]): any[] {
    const flattenedNodes = [];
    for (const node of nodes) {
      flattenedNodes.push(node);
      if (node.children) {
        flattenedNodes.push(...this.flattenNodes(node.children));
      }
    }
    return flattenedNodes;
  };

  setSelectionState(node: any, selected: boolean): void {
    node.selected = selected;
    if (node.children) {
      for (const child of node.children) {
        this.setSelectionState(child, selected);
      }
    }
  };

  toggleAllChildrenSelection(node: any): void {

    const newSelectionState = !node.selected;
    node.selected = newSelectionState;

    if (node.children) {
      for (const child of node.children) {
        this.setSelectionState(child, newSelectionState);
      }
    }
  };



}
