import { Component } from '@angular/core';
import {OrgTreeComponent} from '../org-tree/org-tree.component';
import {EditSaveIconComponent} from '../../edit-save-icon/edit-save-icon.component';
import {MatIconButton} from '@angular/material/button';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {NodeEditModuleComponent} from '../node-edit-module/node-edit-module.component';

@Component({
  selector: 'app-organogram',
  standalone: true,
  imports: [
    OrgTreeComponent,
    EditSaveIconComponent,
    MatIconButton,
    MatSidenavContainer,
    MatSidenavContent,
    MatSidenav,
    NodeEditModuleComponent
  ],
  templateUrl: './organogram.component.html',
  styleUrl: './organogram.component.scss'
})
export class OrganogramComponent {
  editMode: boolean = false;

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
}
