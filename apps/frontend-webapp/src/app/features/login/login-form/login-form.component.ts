import {Component, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule, ButtonComponent, InputComponent,
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
