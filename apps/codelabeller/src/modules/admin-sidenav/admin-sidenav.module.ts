import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { ScrollPanelModule } from 'primeng/scrollpanel'
import { TooltipModule } from 'primeng/tooltip'
import { MenuModule } from 'primeng/menu';
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    AdminSidenavComponent
  ],
  imports: [
    CommonModule,
    ScrollPanelModule,
    TooltipModule,
    MenuModule,
    NgScrollbarModule
  ],
  exports: [
    AdminSidenavComponent
  ]
})
export class AdminSidenavModule { }
