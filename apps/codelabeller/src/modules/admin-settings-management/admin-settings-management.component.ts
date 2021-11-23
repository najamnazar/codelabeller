import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { OptionService } from '../../services/option/option.service';

@Component({
  selector: 'codelabeller-admin-settings-management',
  templateUrl: './admin-settings-management.component.html',
  styleUrls: ['./admin-settings-management.component.scss']
})
export class AdminSettingsManagementComponent implements OnInit {
  isEnabled: boolean = true;
  isAcceptingResponses: boolean = true;
  numResponsesRequired: number = 3;

  settingsForm: FormGroup = new FormGroup({
    isEnabled: new FormControl(this.isEnabled, [Validators.required]),
    isAcceptingResponses: new FormControl(this.isAcceptingResponses, [Validators.required]),
    numResponsesRequired: new FormControl(this.numResponsesRequired, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]),
  });

  isLoading = false;
  
  constructor(private optionService: OptionService, private messageService: MessageService) { }

  async ngOnInit() {
    try {
      this.isEnabled = (await this.optionService.getDefaultAreUploadedFilesEnabledAsAdmin()).value;
    } catch {}
    
    try {
      this.isAcceptingResponses = (await this.optionService.getDefaultAreUploadedFilesAcceptingResponsesAsAdmin()).value;
    } catch {}
    
    try {
      this.numResponsesRequired = (await this.optionService.getDefaultUploadedFilesNumRequiredResponsesAsAdmin()).value;
    } catch {}
    
    this.settingsForm.reset({isEnabled: this.isEnabled, isAcceptingResponses: this.isAcceptingResponses, numResponsesRequired: this.numResponsesRequired });
  }

  async onSubmit() {
    this.isLoading = true;

    try {
      await this.optionService.putDefaultAreUploadedFilesEnabledAsAdmin(this.settingsForm.controls['isEnabled'].value);
      await this.optionService.putDefaultAreUploadedFilesAcceptingResponsesAsAdmin(this.settingsForm.controls['isAcceptingResponses'].value);
      await this.optionService.putDefaultUploadedFilesNumRequiredResponsesAsAdmin(parseInt(this.settingsForm.controls['numResponsesRequired'].value));
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Settings Update Error', detail: `Unable to update a setting. ${error.error?.message ?? error.message}` });
    }
    finally {
      this.isLoading = false;
    }
  }
}
