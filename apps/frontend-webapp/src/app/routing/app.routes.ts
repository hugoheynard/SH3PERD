import {RouterModule, type Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginLayoutComponent} from '../features/login/loginLayout/loginLayout.component';
import {LoginComponent} from '../features/login/login/login.component';
import {CalendarComponent} from '../features/calendar/components/calendarPage/calendar.component';
import {authGuard} from '../../guards/auth.guard';
import {PlaylistManagerComponent} from '../features/playlists/components/playlist-manager/playlist-manager.component';
import {MainLayoutComponent} from '../core/main-layout/main-layout.component';
import {HomeComponent} from '../features/home-dashboard/home/home.component';
import {MusicLibraryComponent} from '../features/musicLibrary/components/music-library/music-library.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginLayoutComponent,
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  { path: 'app',
    component: MainLayoutComponent,
    //canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent, data: { pageName: 'dashboard' }},
      { path: 'calendar', component: CalendarComponent, data: { pageName: 'calendar' }},
      { path: 'musicLibrary', component: MusicLibraryComponent, canActivate: [authGuard], data: { pageName: 'music' } },
      { path: 'playlistManager', component: PlaylistManagerComponent, canActivate: [authGuard], data: { pageName: 'playlists' }}
    ]
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}

