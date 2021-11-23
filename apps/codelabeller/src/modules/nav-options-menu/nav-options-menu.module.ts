import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavOptionsMenuComponent } from './nav-options-menu.component';
import { MenuModule } from 'primeng/menu';

@NgModule({
  declarations: [
    NavOptionsMenuComponent
  ],
  imports: [
    CommonModule,
    MenuModule
  ],
  exports: [
    NavOptionsMenuComponent
  ]
})
export class NavOptionsMenuModule { }
