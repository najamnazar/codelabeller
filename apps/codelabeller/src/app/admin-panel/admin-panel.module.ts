import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AdminPanelComponent } from './admin-panel.component';
import { AdminPanelRoutingModule } from './admin-panel-routing.module'
import { AdminSidenavModule } from '../../modules/admin-sidenav/admin-sidenav.module';
import { AdminUserManagementModule } from '../../modules/admin-user-management/admin-user-management.module';
import { AdminDesignPatternManagementModule } from '../../modules/admin-design-pattern-management/admin-design-pattern-management.module';
import { AdminProjectManagementModule } from '../../modules/admin-project-management/admin-project-management.module';
import { AdminAllResponsesManagementModule } from '../../modules/admin-all-responses-management/admin-all-responses-management.module';
import { AdminResultsModule } from '../../modules/admin-results/admin-results.module';
import { NavigationModule } from '../../modules/navigation/navigation.module';
import { ToolbarModule } from '../../modules/toolbar/toolbar.module';
import { AdminSettingsManagementModule } from '../../modules/admin-settings-management/admin-settings-management.module';
import { AdminUploadJobsManagementModule } from '../../modules/admin-upload-jobs-management/admin-upload-jobs-management.module';

@NgModule({
  declarations: [
    AdminPanelComponent
  ],
  imports: [
    CommonModule,
    NavigationModule,
    ButtonModule,
    ToolbarModule,
    AdminSidenavModule,
    AdminResultsModule,
    AdminUserManagementModule,
    AdminDesignPatternManagementModule,
    AdminProjectManagementModule,
    AdminAllResponsesManagementModule,
    AdminUploadJobsManagementModule,
    AdminSettingsManagementModule,
    AdminPanelRoutingModule
  ]
})
export class AdminPanelModule { }
