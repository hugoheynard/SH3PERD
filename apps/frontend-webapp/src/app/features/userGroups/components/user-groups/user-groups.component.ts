import { Component, inject, type AfterViewInit } from '@angular/core';
import { DataListComponent } from '../../../../core/components/data-list/data-list.component';
import { ButtonIconComponent, SvgIconComponent } from '@sh3pherd/ui-angular';
import { UserGroupService } from '../../services/user-group.service';
import type { TContractId, TUserGroupDomainModel } from '@sh3pherd/shared-types';
import { LayoutService } from '../../../../core/services/layout.service';
import { CreateGroupComponent } from '../create-group/create-group.component';


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
export class UserGroupsComponent implements AfterViewInit {
  private readonly ugServ = inject(UserGroupService);
  private readonly layout = inject(LayoutService);
  readonly userGroupObject = this.ugServ.userGroups();

  edit(userGroup: any) {
    alert(`Not implemented yet, would edit user group with id ${userGroup.id}`);
  }

  delete(userGroup: any) {
    alert(`Not implemented yet, would edit user group with id ${userGroup.id}`);
  }

  // --- Lifecycle ---
  ngAfterViewInit(): void {
    this.ugServ.getMyUserGroups();
  };


  getInitialFromContractId(contract_id: TContractId ): string | undefined {
    const userProfile = this.ugServ.userGroups()?.userProfiles[contract_id];
    return userProfile?.first_name[0];
  };

  createChildGroup(userGroup: TUserGroupDomainModel) {
    this.layout.setRightPanel<CreateGroupComponent, { userGroup_id: string }>(CreateGroupComponent, { userGroup_id: userGroup.id})
  };
}
