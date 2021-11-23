import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from './data-table.component';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { NestedFieldPipe } from './nested-field.pipe';
import { DataTransformPipe } from './data-transform.pipe';

@NgModule({
  declarations: [
    DataTableComponent,
    NestedFieldPipe,
    DataTransformPipe
  ],
  providers:[
    NestedFieldPipe,
    DataTransformPipe
  ],
  imports: [
    CommonModule,
    ButtonModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
    InputTextModule,
  ],
  exports: [
    DataTableComponent
  ]
})
export class DataTableModule { }
