import { Component, type OnInit, inject } from '@angular/core';
import { DataListComponent } from '../../../core/components/data-list/data-list.component';
import { ButtonIconComponent, SvgIconComponent } from '@sh3pherd/ui-angular';
import { UserGroupService } from '../user-group.service';
import type { TContractId } from '@sh3pherd/shared-types';

@Component({
  selector: 'user-groups',
  imports: [
    DataListComponent,
    ButtonIconComponent,
    SvgIconComponent,
  ],
  standalone: true,
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss'
})
export class UserGroupsComponent implements OnInit {
  private readonly ugServ = inject(UserGroupService);
  readonly userGroupObject = this.ugServ.userGroups();

  edit(userGroup: any) {
    alert(`Not implemented yet, would edit user group with id ${userGroup.id}`);
  }

  delete(userGroup: any) {
    alert(`Not implemented yet, would edit user group with id ${userGroup.id}`);
  }

  // --- Lifecycle ---
  ngOnInit(): void {
    this.ugServ.getMyUserGroups();
  };

  getInitialFromContractId(contract_id: TContractId ): string | undefined {
    const userProfile = this.ugServ.userGroups()?.userProfiles[contract_id];
    return userProfile?.first_name[0];
  }


}
