import { Component, inject, type OnInit } from '@angular/core';
import {
  ButtonPrimaryComponent,
  InputComponent,
  MultiSelectDropdownComponent, SelectComponent,
} from '@sh3pherd/ui-angular';
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
    MultiSelectDropdownComponent,
    SelectComponent,
  ],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss'
})
export class CreateGroupComponent implements OnInit {
  private readonly ug = inject(UserGroupService);
  private readonly fb = inject(FormBuilder);

  private readonly data = inject<{ userGroup_id: TUserGroupId }>(PANEL_DATA);
  public readonly form: FormGroup = this.buildForm();

  public typeOptions: any[] = [];
  public referentOptions: any[] = [];
  public membersOptions: any[] = [];

  // --- Lifecycle ---
  ngOnInit(): void {
    this.ug.getSubUserGroupFormConfig(this.data.userGroup_id).subscribe(cfg => {
      if (cfg) {
        this.patchForm(cfg);
      }
    });
  };

  buildForm() {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: [],
      referents: [],
      members: [],
    });
  };

  patchForm(cfg: any) {
    this.form.patchValue({
      name: cfg.name,
    });

    console.log(cfg);

    this.typeOptions = cfg.typeOptions;
    this.referentOptions = cfg.referentsOptions;
    this.membersOptions = cfg.membersOptions;

    console.log(this.referentOptions);
  };

  submit() {

    if (!this.form.valid) {
      return;
    }

    console.log(this.form.value);
  }
}
