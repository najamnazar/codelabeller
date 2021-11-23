import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminAllResponsesManagementComponent } from './admin-all-responses-management.component';
import { DataTableModule } from '../data-table/data-table.module';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
  declarations: [
    AdminAllResponsesManagementComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DataTableModule,
    ToolbarModule,
  ],
  providers: [
    DatePipe
  ],
  exports: [
    AdminAllResponsesManagementComponent
  ]
})
export class AdminAllResponsesManagementModule { }
