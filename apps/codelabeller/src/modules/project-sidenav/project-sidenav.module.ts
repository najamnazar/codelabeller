import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectSidenavComponent } from './project-sidenav.component';
import { ScrollPanelModule } from 'primeng/scrollpanel'
import { TooltipModule } from 'primeng/tooltip'
import { TreeModule } from 'primeng/tree'
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    ProjectSidenavComponent
  ],
  imports: [
    CommonModule,
    ScrollPanelModule,
    TooltipModule,
    TreeModule,
    NgScrollbarModule
  ],
  exports: [
    ProjectSidenavComponent
  ]
})
export class ProjectSidenavModule { }
