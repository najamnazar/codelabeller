import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MyResponsesComponent } from './my-responses.component';
import { NavigationModule } from '../../modules/navigation/navigation.module';
import { ToolbarModule } from '../../modules/toolbar/toolbar.module';
import { DataTableModule } from '../../modules/data-table/data-table.module';
import { MyResponsesRoutingModule } from './my-responses-routing.module';

@NgModule({
  declarations: [
    MyResponsesComponent
  ],
  imports: [
    CommonModule,
    NavigationModule,
    ToolbarModule,
    DataTableModule,
    MyResponsesRoutingModule
  ],
  providers: [
    DatePipe
  ]
})
export class MyResponsesModule { }
