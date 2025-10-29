import { Component } from '@angular/core';
import { DataListComponent } from '../../../core/components/data-list/data-list.component';
import { ButtonIconComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'user-groups',
  imports: [
    DataListComponent,
    ButtonIconComponent,
  ],
  standalone: true,
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss'
})
export class UserGroupsComponent {
  edit(userGroup: any) {
    alert(`Not implemented yet, would edit user group with id ${userGroup.id}`);
  }

  delete(userGroup: any) {
    alert(`Not implemented yet, would edit user group with id ${userGroup.id}`);
  }

  dataTest = [{
    name: 'hugoTest',
    description: 'Hugo Test Group',
    users: ['hugo', 'test']
  }]

}
