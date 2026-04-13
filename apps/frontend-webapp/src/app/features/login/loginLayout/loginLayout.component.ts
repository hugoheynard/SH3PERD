import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';


@Component({
  selector: 'loginLayout',
  imports: [
    RouterOutlet
  ],
  templateUrl: './loginLayout.component.html',
  standalone: true,
  styleUrl: './loginLayout.component.scss'
})
export class LoginLayoutComponent {

}
