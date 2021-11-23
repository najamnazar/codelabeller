import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForbiddenComponent } from './forbidden.component';
import { ForbiddenRoutingModule } from './forbidden-routing.module';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [
    ForbiddenComponent
  ],
  imports: [
    CommonModule,
    CardModule,
    ForbiddenRoutingModule
  ]
})
export class ForbiddenModule { }
