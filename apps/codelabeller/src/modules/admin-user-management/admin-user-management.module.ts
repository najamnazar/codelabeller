import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminUserManagementComponent } from './admin-user-management.component';
import { DataTableModule } from '../data-table/data-table.module';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputFormModule } from '../input-form/input-form.module';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    AdminUserManagementComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    CheckboxModule,
    DataTableModule,
    InputFormModule,
    FormsModule,
    ToolbarModule,
    TooltipModule,
  ],
  providers: [
    DatePipe
  ],
  exports: [
    AdminUserManagementComponent
  ]
})
export class AdminUserManagementModule { }
