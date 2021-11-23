import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProjectManagementComponent } from './admin-project-management.component';
import { ButtonModule } from 'primeng/button';
import { DataTableModule } from '../data-table/data-table.module';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputFormModule } from '../input-form/input-form.module';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AdminProjectManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ToolbarModule,
    FileUploadModule,
    DialogModule,
    DividerModule,
    DataTableModule,
    InputFormModule,
    TooltipModule
  ],
  exports: [
    AdminProjectManagementComponent
  ]
})
export class AdminProjectManagementModule { }
