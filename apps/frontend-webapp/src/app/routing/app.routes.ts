import {RouterModule, type Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginLayoutComponent} from '../pages/login/loginLayout/loginLayout.component';
import {LoginComponent} from '../pages/login/login/login.component';
import {CalendarComponent} from '../pages/calendar/components/calendarPage/calendar.component';
import {authGuard} from '../../guards/auth.guard';
import {PlaylistManagerComponent} from '../pages/playlists/components/playlist-manager/playlist-manager.component';
import {MainLayoutComponent} from '../components/main-layout/main-layout.component';
import {HomeComponent} from '../pages/home-dashboard/home/home.component';
import {MusicLibraryComponent} from '../pages/musicLibrary/components/music-library/music-library.component';


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
      { path: 'home', component: HomeComponent},
      { path: 'calendar', component: CalendarComponent},
      { path: 'musicLibrary', component: MusicLibraryComponent, canActivate: [authGuard] },
      { path: 'playlistManager', component: PlaylistManagerComponent, canActivate: [authGuard]}
    ]
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}

