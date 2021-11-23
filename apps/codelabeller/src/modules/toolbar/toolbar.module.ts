import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar.component';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule as PrimeNgToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { HelpModule } from '../help/help.module';
import { NavOptionsMenuModule } from '../nav-options-menu/nav-options-menu.module';
import { UserProfileButtonModule } from '../user-profile-button/user-profile-button.module';

@NgModule({
  declarations: [
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    HelpModule,
    ButtonModule,
    NavOptionsMenuModule,
    PrimeNgToolbarModule,
    TooltipModule,
    UserProfileButtonModule
  ],
  exports: [
    ToolbarComponent
  ]
})
export class ToolbarModule { }
