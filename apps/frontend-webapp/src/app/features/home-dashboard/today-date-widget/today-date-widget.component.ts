import { Component, Input, type OnInit } from '@angular/core';

@Component({
  selector: 'today-date-widget',
  imports: [],
  templateUrl: './today-date-widget.component.html',
  standalone: true,
  styleUrl: './today-date-widget.component.scss',
})
export class TodayDateWidgetComponent implements OnInit {
  @Input() locale: string = 'fr-FR'

  day!: string
  month!: string

  ngOnInit(): void {
    const today = new Date()
    this.day = today.getDate().toString().padStart(2, '0')
    this.month = (today.getMonth() + 1).toString().padStart(2, '0')
  }
}
