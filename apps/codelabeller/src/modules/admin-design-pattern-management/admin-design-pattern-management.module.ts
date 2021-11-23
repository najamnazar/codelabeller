import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDesignPatternManagementComponent } from './admin-design-pattern-management.component';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DataTableModule } from '../data-table/data-table.module';
import { DialogModule } from 'primeng/dialog';
import { InputFormModule } from '../input-form/input-form.module';
import { DividerModule } from 'primeng/divider';

@NgModule({
  declarations: [
    AdminDesignPatternManagementComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    DataTableModule,
    InputFormModule,
    ToolbarModule,
  ],
  exports: [
    AdminDesignPatternManagementComponent
  ]
})
export class AdminDesignPatternManagementModule { }
