import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ResponseAreaComponent } from './response-area.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputFormModule } from '../input-form/input-form.module';

@NgModule({
  declarations: [
    ResponseAreaComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputFormModule
  ],
  exports: [
    ResponseAreaComponent
  ]
})
export class ResponseAreaModule { }
