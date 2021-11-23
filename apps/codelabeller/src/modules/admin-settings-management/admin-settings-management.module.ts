import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingsManagementComponent } from './admin-settings-management.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AdminSettingsManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputTextModule
  ],
  exports: [
    AdminSettingsManagementComponent
  ],
})
export class AdminSettingsManagementModule { }
