import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    HelpComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    TooltipModule
  ],
  exports: [HelpComponent]
})
export class HelpModule { }
