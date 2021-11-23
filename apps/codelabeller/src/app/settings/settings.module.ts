import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { NavigationModule } from '../../modules/navigation/navigation.module';
import { ToolbarModule } from '../../modules/toolbar/toolbar.module';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    SettingsComponent
  ],
  providers: [
    ConfirmationService
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    NavigationModule,
    ToolbarModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
