import { Component, OnInit } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
  }
}
