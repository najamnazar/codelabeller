import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/auth/auth.service';
import * as prettyBytes from 'pretty-bytes';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FileService } from '../../services/file/file.service';
import { ResponseService } from '../../services/response/response.service';


@Component({
  selector: 'codelabeller-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  isLoggedIn !: boolean;

  displayName !: string;
  email !: string;

  cacheUsage!: string;

  constructor(
    private authService: AuthService,
    private fileService: FileService,
    private responseService: ResponseService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.displayName = this.authService.getUserDisplayName();
    this.email = this.authService.getUserEmail();
    this.calculateCacheSize();
  }

  calculateCacheSize() {
    try {
      navigator.storage.estimate()
        .then(storageEstimate => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.cacheUsage = prettyBytes(storageEstimate.usageDetails.indexedDB)
        })
    } catch (error) {
      // Ignore error. If an error is thrown, the browser does not support estimate() of the Web Storage API.
    }
  }

  async onDeleteProjFileCache() {
    this.confirmationService.confirm({
      message: "This will result in greater network usage and longer loading times.",
      accept: () => {
        this.fileService.deleteFilesLocalDb();
        this.messageService.add({ severity: 'success', summary: 'File Cache Cleared', detail: `File cache has been successfully cleared. You might need to refresh the page for the changes to be reflected.` });
        this.calculateCacheSize();
      }
    });
  }

  async onDeleteUnsubmittedResponsesCache() {
    this.confirmationService.confirm({
      message: "This will result in all of your unsubmitted response data being lost.",
      accept: () => {
        this.responseService.deleteResponsesLocalDb();
        this.messageService.add({ severity: 'success', summary: 'Unsubmitted Response Cache Cleared', detail: `Unsubmitted responses cache has been successfully cleared. You might need to refresh the page for the changes to be reflected.` });
        this.calculateCacheSize();
      }
    });
  }

  onBack() {
    this.router.navigate(['/home']);
  }
}
