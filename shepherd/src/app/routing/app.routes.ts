import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CalendarComponent} from '../pages/calendar/calendarPage/calendar.component';
import {LoginComponent} from '../pages/login/login/login.component';
import {authGuard} from '../auth.guard';
import {MusicLibraryComponent} from '../pages/musicLibrary/music-library/music-library.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'app/home', component: CalendarComponent, /*canActivate: [authGuard]*/ },
  { path: 'app/calendar', component: CalendarComponent },
  { path: 'app/musicLibrary', component: MusicLibraryComponent },
  {
    path: 'app/settings',
    canActivate: [authGuard],
    loadChildren: () => import('../routing/settingsModule')
      .then(m => m.SettingsModule)},
  { path: '', redirectTo: 'app/musicLibrary', pathMatch: 'full' }, // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}

