import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { LandingRoutingModule } from './landing-routing.module';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
