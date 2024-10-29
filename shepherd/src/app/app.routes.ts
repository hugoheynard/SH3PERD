import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CalendarComponent} from './pages/calendar/calendarPage/calendar.component';



export const routes: Routes = [
  { path: 'home', component: CalendarComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

