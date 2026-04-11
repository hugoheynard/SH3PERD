import {RouterModule, type Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginLayoutComponent} from '../features/login/loginLayout/loginLayout.component';
import {LoginComponent} from '../features/login/login/login.component';
import {CalendarComponent} from '../features/calendar/components/calendarPage/calendar.component';
import {authGuard} from '../../guards/auth.guard';
import { PlaylistsPageComponent } from '../features/playlists/playlists-page/playlists-page.component';
import {MainLayoutComponent} from '../core/main-layout/main-layout.component';
import {HomeComponent} from '../features/home-dashboard/home/home.component';
import { MusicLibraryPageComponent } from '../features/musicLibrary/music-library-page/music-library-page.component';
import { ContractPageComponent } from '../features/contracts/components/contract-page/contract-page.component';
import { UserGroupsComponent } from '../features/userGroups/components/user-groups/user-groups.component';
import {
  UserProfilePageComponent
} from '../features/user/profile/components/user-profile-page/user-profile-page.component';
import { ProgramsPageComponent } from '../features/programs/programs-page/programs-page.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginLayoutComponent,
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  // Print-only route — no auth shell, no guards. Loaded exclusively by
  // headless Chromium during PDF export. The token carried in the query
  // param is validated on the backend read endpoint (single-use JWT).
  {
    path: 'print/orgchart/:companyId',
    loadComponent: () =>
      import('../features/company/orgchart-print/orgchart-print.component')
        .then(m => m.OrgchartPrintComponent),
  },
  { path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'home', component: HomeComponent, data: { pageName: 'dashboard' }},
      { path: 'program', component: ProgramsPageComponent, data: { pageName: 'program' }},
      { path: 'calendar', component: CalendarComponent,  data: { pageName: 'calendar' }},
      { path: 'musicLibrary', component: MusicLibraryPageComponent,  data: { pageName: 'music' } },
      { path: 'playlistManager', component: PlaylistsPageComponent, data: { pageName: 'playlists' }},
      { path: 'contracts', component: ContractPageComponent, data: { pageName: 'contracts' } },
      { path: 'userGroup', component: UserGroupsComponent, data: { pageName: 'userGroups' }},
      { path: 'user-profile', component: UserProfilePageComponent, data: { pageName: 'profile' }},
      {
        path: 'company',
        data: { pageName: 'company' },
        children: [
          {
            path: '',
            loadComponent: () => import('../features/company/company-page/company-page.component')
              .then(m => m.CompanyPageComponent),
          },
          {
            path: ':id',
            children: [
              {
                path: '',
                loadComponent: () => import('../features/company/company-detail-page/company-detail-page.component')
                  .then(m => m.CompanyDetailPageComponent),
              },
              {
                path: 'contracts',
                children: [
                  {
                    path: ':contractId',
                    loadComponent: () =>
                      import('../features/company/contract-detail-page/contract-detail-page.component')
                        .then(m => m.ContractDetailPageComponent),
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule {}

