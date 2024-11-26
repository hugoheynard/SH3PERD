import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SettingsComponent} from '../pages/settingsModule/settings/settings.component';
import {WeeklyEventsComponent} from '../pages/settingsModule/weekly-events/weekly-events.component';
import {WeekTemplateComponent} from '../pages/settingsModule/week-template/week-template.component';
import {GeneralInformationsComponent} from '../pages/settingsModule/general-informations/general-informations.component';
import {CalendarEventsComponent} from '../pages/settingsModule/calendarEventsTemplates/calendar-events/calendar-events.component';
import {OrganogramComponent} from '../pages/settingsModule/organogramModule/organogram/organogram.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: 'general-informations', component: GeneralInformationsComponent },
      { path: 'week-template', component: WeekTemplateComponent },
      { path: 'weekly-events', component: WeeklyEventsComponent },
      { path: 'calendar-events', component: CalendarEventsComponent },
      { path: 'organogram', component: OrganogramComponent },
      { path: '', redirectTo: 'organogram', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
