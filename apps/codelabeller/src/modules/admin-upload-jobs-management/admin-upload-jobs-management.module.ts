import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminUploadJobsManagementComponent } from './admin-upload-jobs-management.component';
import { DialogModule } from 'primeng/dialog';
import { DataTableModule } from '../data-table/data-table.module';

@NgModule({
  declarations: [
    AdminUploadJobsManagementComponent
  ],
  imports: [
    CommonModule,
    DialogModule,
    DataTableModule,
  ],
  providers: [
    DatePipe
  ],
  exports: [
    AdminUploadJobsManagementComponent
  ]
})
export class AdminUploadJobsManagementModule { }
