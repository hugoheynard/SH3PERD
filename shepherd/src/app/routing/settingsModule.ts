import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from '../pages/settingsModule/settings/settings.component';
import { WeeklyEventsComponent } from '../pages/settingsModule/weekly-events/weekly-events.component';
import { SettingsRoutingModule } from './settingsRoutes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SettingsComponent,
    WeeklyEventsComponent
  ]
})
export class SettingsModule {}
