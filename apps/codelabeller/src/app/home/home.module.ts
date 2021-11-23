import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { ToolbarModule } from '../../modules/toolbar/toolbar.module';
import { CodeViewerModule } from '../../modules/code-viewer/code-viewer.module';
import { NavigationModule } from '../../modules/navigation/navigation.module';
import { ProjectSidenavModule } from '../../modules/project-sidenav/project-sidenav.module';
import { ResponseAreaModule } from '../../modules/response-area/response-area.module';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    NavigationModule,
    ButtonModule,
    ToolbarModule,
    ProjectSidenavModule,
    CodeViewerModule,
    ResponseAreaModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
