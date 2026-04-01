import {Component, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonPrimaryComponent, InputComponent } from '../../../legacy/ui';
//import { TUserCredentialsDTO } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule, ButtonPrimaryComponent, InputComponent,
  ],
  templateUrl: './login-form.component.html',
  standalone: true,
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  @Output() validityChanged = new EventEmitter<boolean>();
  @Output() login = new EventEmitter<{ email: string; password: string }>();

  onSubmit(credentials: any): void {
    if (!credentials.valid) {
      console.log('Invalid form');
    }
    console.log(credentials)
    this.login.emit(credentials.value);
  };
}
