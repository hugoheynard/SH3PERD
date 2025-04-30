import {Component} from '@angular/core';
import {LoginComponent} from '../login/login.component';


@Component({
  selector: 'loginLayout',
  imports: [
    LoginComponent
  ],
  templateUrl: './loginLayout.component.html',
  standalone: true,
  styleUrl: './loginLayout.component.scss'
})
export class LoginLayoutComponent {

}
