import {
  AfterViewChecked,
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  QueryList,
  signal,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {CdkNestedTreeNode, CdkTree, CdkTreeNodeDef, CdkTreeNodeOutlet, CdkTreeNodeToggle,} from '@angular/cdk/tree';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {TreeUtilsService} from '../tree-utils.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {NodeMenuComponent} from '../node-menu/node-menu.component';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {NodeEditModuleComponent} from '../node-edit-module/node-edit-module.component';
import {SettingsService} from '../../../../services/settings.service';
import {ColorShadeAuto} from '../color-shade-auto';

@Component({
    selector: 'app-org-tree',
    imports: [
        CdkTree, CdkNestedTreeNode, CdkTreeNodeDef, CdkTreeNodeOutlet, CdkTreeNodeToggle,
        MatIcon, MatIconButton, MatCheckbox, MatButton,
        FormsModule,
        NgIf, MatMenu, MatMenuItem, MatMenuTrigger, NodeMenuComponent, NgStyle, MatSidenav, MatSidenavContainer, MatSidenavContent, NodeEditModuleComponent, NgClass, NgForOf
    ],
    templateUrl: './org-tree.component.html',
    styleUrl: './org-tree.component.scss'
})

export class OrgTreeComponent implements AfterViewInit{
  public treeUtils = inject(TreeUtilsService);
  private settingsService = inject(SettingsService);
  private cdRef= inject(ChangeDetectorRef);

  @Input() editMode: boolean = false;

  @ViewChild(CdkTree) tree!: CdkTree<any>;
  @ViewChild('treeNav') treeNav!: MatSidenav ;

  data = signal([
    {
      value: {
        name: 'all',
        type: 'root',
        deletable: false,
        color: {
          custom: '#555555',
          autoColorizeChildren: false
        }
      },
      children: [
        {
          value: {
            name: 'artistic',
            type: 'service',
            deletable: true,
            color: {
              custom: '#2a9fb7',
              autoColorizeChildren: false
            }
          },
          children: [
            {
              value: {
                name: 'dj',
                type: 'category',
                deletable: true,
                color: {
                  custom: 'blue',
                  autoColorizeChildren: false
                }
              },
              children: []
            },
            {
              value: {
                name: 'musicians',
                type: 'category',
                deletable: true,
                color: {
                  custom: '#083B32',
                  autoColorizeChildren: true
                }
              },
              children: [
                {
                  value: {
                    name: 'Tom',
                    type: 'staff',
                    deletable: true,
                    color: {
                      custom: '#0f695a',
                      autoColorizeChildren: false
                    }
                  },
                  children: []
                },
                {
                  value: {
                    name: 'Dave',
                    type: 'staff',
                    deletable: true,
                    color: {
                      custom: '#1a9b88',
                      autoColorizeChildren: false
                    },
                  },
                  children: []
                }
              ]
            }
          ]
        }]
    }
  ]);

  nodeToAddChildTo: any = null;
  newChildValue: string = '';

  isSidenavOpened: boolean = false;
  currentAction: 'add' | 'edit' | null = null;
  editingNode: any = null;

  openAddForm(node: any) {
    this.currentAction = 'add';
    this.editingNode = node;
    this.treeNav.open();
  };

  openEditForm(node: any) {
    this.currentAction = 'edit';
    this.editingNode = node;
    this.treeNav.open();
  };

  onSaveNode(nodeData: any) {
    console.log('Données reçues du formulaire enfant:', nodeData);

    const newNode = { value: { name: nodeData.name, color: nodeData.color }, children: [] };

    if (!this.editingNode.children) {
      this.editingNode.children = [];
    }
    this.editingNode.children.push(newNode);
    this.saveTree();
    this.editingNode = null;
    this.currentAction = null;
    this.treeNav.close();
  }



  childrenAccessor = (node: any) => node.children ?? [];
  hasChild = (_: number, node: any) => node.children && node.children.length > 0;

  getParentNode(node: any) {
    for (const parent of this.treeUtils.flattenNodes(this.data())) {
      if (parent.children?.includes(node)) {
        return parent;
      }
    }
    return null;
  };

  shouldRender(node: any): boolean {
    // This node should render if it is a root node or if all of its ancestors are expanded.
    const parent = this.getParentNode(node);
    return !parent || (!!this.tree?.isExpanded(parent) && this.shouldRender(parent));
  }

  ngAfterViewInit(): void {
    this.treeUtils.expandAll(this.data());
    this.cdRef.detectChanges();
  };

  getNodeColor(node: any): string {
    const parentNode = this.getParentNode(node);

    if (parentNode && parentNode.value.color.autoColorizeChildren) {
      const baseColor = parentNode.value.color.custom;
      const children = parentNode.children || [];
      const index = children.indexOf(node);

      if (index === -1) {
        throw new Error('Node is not a child of its parent');
      }

      const colors = new ColorShadeAuto().generateAdaptiveShades(baseColor, children.length);

      return colors[index];
    }

    return node.value.color.custom;
  };

  deleteNode(node: any) {
    const parent = this.getParentNode(node);
    if (parent) {
      const index = parent.children.indexOf(node);
      if (index > -1) {
        parent.children.splice(index, 1);
      }
    }
    this.saveTree();
  };

  cancelAddChild(): void {
    this.nodeToAddChildTo = null;
    this.newChildValue = '';
  };

  saveTree(): void {
    //TODO tree history max 10 trees
    this.cancelAddChild()
    this.settingsService.updateOrganogram(this.data());
    this.data.set(structuredClone(this.data()));
  };
}
