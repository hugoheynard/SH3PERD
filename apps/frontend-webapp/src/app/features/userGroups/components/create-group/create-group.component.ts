import { Component, inject, type OnInit } from '@angular/core';
import { ButtonPrimaryComponent, ButtonSecondaryComponent, InputComponent } from '@sh3pherd/ui-angular';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PANEL_DATA } from '../../../../core/main-layout/main-layout.component';
import type { TUserGroupId } from '@sh3pherd/shared-types';
import { UserGroupService } from '../../services/user-group.service';

export type TPanelInjectComponent<TCOMP> = {
  component: TCOMP,
  data?: { userGroup_id: TUserGroupId }
}

@Component({
  selector: 'create-group',
  imports: [
    InputComponent,
    ReactiveFormsModule,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss'
})
export class CreateGroupComponent implements OnInit {
  private readonly ug = inject(UserGroupService);
  private readonly fb = inject(FormBuilder);

  private readonly data = inject<{ userGroup_id: TUserGroupId }>(PANEL_DATA);
  public readonly form: FormGroup = this.buildForm();

  // --- Lifecycle ---
  ngOnInit(): void {
    const cfg = this.ug.getSubUserGroupFormConfig(this.data.userGroup_id);
    console.log(cfg)
  };

  buildForm() {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      groupLead: '',
      members: [],
    });
  }
}
