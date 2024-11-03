import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField, MatLabel, MatInput, MatButton,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {

  @Output() login = new EventEmitter<{ email: string; password: string }>();

  onSubmit(credentials: any) {
    if (!credentials.valid) {
      console.log('Invalid form');
    }
    console.log(credentials)
    this.login.emit(credentials.value);
  }

}
