import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CalendarComponent} from '../pages/calendar/calendarPage/calendar.component';
import {LoginComponent} from '../pages/login/login/login.component';
import {authGuard} from '../auth.guard';




export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'app/home', component: CalendarComponent, /*canActivate: [authGuard]*/ },
  {
    path: 'app/settings',
    /*canActivate: [authGuard]*/
    loadChildren: () => import('../routing/settingsModule')
      .then(m => m.SettingsModule)},
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}

