import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputFormComponent } from './input-form.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    InputFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    ScrollPanelModule,
    DropdownModule,
    InputTextareaModule,
    SliderModule,
    TooltipModule
  ],
  exports: [
    InputFormComponent
  ]
})
export class InputFormModule { }
