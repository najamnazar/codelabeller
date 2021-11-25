import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { LandingRoutingModule } from './landing-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
