import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIconButton} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-node-menu',
    imports: [
        MatIcon,
        MatMenu,
        MatMenuItem,
        MatIconButton,
        MatMenuTrigger,
        NgIf
    ],
    templateUrl: './node-menu.component.html',
    styleUrl: './node-menu.component.scss'
})
export class NodeMenuComponent {
  @ViewChild(MatMenu, { static: true }) menu!: MatMenu;
  @Input() node: any;
  @Output() addChildNode = new EventEmitter<any>();
  @Output() nodeEdit = new EventEmitter<any>();
  @Output() addStaff = new EventEmitter<void>();
  @Output() deleteNodeType = new EventEmitter<any>();

  onAddChildNode():void {
    this.addChildNode.emit(this.node);
  };

  onNodeEdit():void  {
    this.nodeEdit.emit(this.node);
  };

  onAddStaff():void  {
    this.addStaff.emit();
  };



  onDeleteNodeType():void  {
    this.deleteNodeType.emit(this.node);
  };
}
