import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { ResizableModule } from 'angular-resizable-element';

@NgModule({
  declarations: [
    NavigationComponent
  ],
  imports: [
    CommonModule,
    ResizableModule
  ],
  exports: [
    NavigationComponent
  ]
})
export class NavigationModule { }
