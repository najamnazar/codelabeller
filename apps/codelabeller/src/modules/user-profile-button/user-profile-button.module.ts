import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileButtonComponent } from './user-profile-button.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Base64PngPipe } from './base64-png.pipe';

@NgModule({
  declarations: [
    UserProfileButtonComponent,
    Base64PngPipe
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  exports: [
    UserProfileButtonComponent
  ]
})
export class UserProfileButtonModule { }
