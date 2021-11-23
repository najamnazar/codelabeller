import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileStatus, IFile, IProject } from '@codelabeller/api-interfaces';
import { openDB, deleteDB, IDBPDatabase } from 'idb';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { PageService } from '../page/page.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  private readonly FILES_DB_NAME = 'files';
  private readonly FILE_URL_PREFIX = '/home/file/'
  private filesDb !: IDBPDatabase<IFile>;

  currentProject$ = new BehaviorSubject<IProject | null>(null);
  currentFile$ = new BehaviorSubject<IFile | null>(null);

  canSubmitCurrentFile$ = new BehaviorSubject(false);
  isFileCurrentlyAssigned$ = new BehaviorSubject(false);
  hasSubmittedCurrentFile$ = new BehaviorSubject(false);
  hasRespondedToAllFiles$ = new BehaviorSubject(false);

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private http: HttpClient,
    private pageService: PageService
  ) {
    this.openFilesLocalDb();

    // Watch for page back/forward events in browser and automatically update the displayed file as necessary.
    this.pageService.navigatedUrl$.subscribe(url => {
      if (url && url.startsWith(this.FILE_URL_PREFIX)) {
        this.setActiveFile(url.replace(this.FILE_URL_PREFIX, ""));
      }
    })
  }

  async openFilesLocalDb() {
    this.filesDb = await openDB(this.FILES_DB_NAME, 1, {
      upgrade(db: IDBPDatabase<IFile>) {
        db.createObjectStore(db.name);
      }
    });
  }

  async deleteFilesLocalDb() {
    this.filesDb?.close();
    return await deleteDB(this.FILES_DB_NAME);
  }

  async getNextAssignedFile() {
    let file: IFile | null = null;

    try {
      file = await this.http.get<IFile>(`${await this.configService.getApiPrefix()}/file/next`).toPromise();
    } catch (error) {
      // Treat an error here as if the user does not have a next file (but do not set has responded to all files to true).
      this.currentFile$.next(null);
      return;
    }

    if (!file) {
      this.hasRespondedToAllFiles$.next(true);
      this.currentFile$.next(null);
      return;
    }

    this.storeFileInLocalDb(file);
    this.setActiveFile(file.id);
  }

  async setActiveFile(fileId: string) {
    if (!fileId) {
      return;
    }

    try {
      const fileStatus = await this.getFileStatus(fileId);

      this.isFileCurrentlyAssigned$.next(fileStatus.isAssigned);
      this.canSubmitCurrentFile$.next(fileStatus.canSubmit);
      this.hasSubmittedCurrentFile$.next(fileStatus.hasSubmitted);

    } catch (error) {
      this.currentProject$.next(null);
      this.currentFile$.next(null);

      this.isFileCurrentlyAssigned$.next(false);
      this.canSubmitCurrentFile$.next(false);
      this.hasSubmittedCurrentFile$.next(false);

      this.pageService.navigateToPage(`${this.FILE_URL_PREFIX}${fileId}`);
      this.pageService.setTitle();
      return;
    }

    let file = this.currentFile$.value;

    try {
      file = await this.getFile(fileId);
    } catch (error) {
      this.currentFile$.next(null);
      this.currentProject$.next(null);

      this.messageService.add({ severity: 'error', summary: 'File Request Error', detail: `${error.error?.message ?? error.message}` });
      return;
    }

    const currentProject = this.currentProject$.getValue();
    const fileProject = file.project;

    // Only update the current project if the new file obtained results in a project change.
    // Regardless, allow the project to be changed if it was initially null.
    if (!currentProject || currentProject.id !== fileProject.id) {
      this.currentProject$.next(fileProject);
    }

    this.currentFile$.next(file);

    // Update the URL path state before setting the title, as the title is for the new page to navigate to.
    this.pageService.navigateToPage(`${this.FILE_URL_PREFIX}${fileId}`);
    this.pageService.setTitle(file.name);
  }

  private async getFile(fileId: string): Promise<IFile> {
    // Attempt to fetch from local database first.
    const localFile = await this.getFileFromLocalDb(fileId);

    // Fetch file over network if cache miss.
    if (!localFile) {
      return await this.getFileFromRemoteDb(fileId);
    }

    return localFile;
  }

  async getFileStatus(fileId: string): Promise<FileStatus> {
    // Check whether the current user is assigned, has submitted, and can submit the specified file.
    return await this.http.get<FileStatus>(`${await this.configService.getApiPrefix()}/file/${fileId}/status`).toPromise();
  }

  private async getFileFromLocalDb(fileId: string): Promise<IFile | undefined> {
    // Get source code for file from local DB.
    await this.openFilesLocalDb();
    return await this.filesDb.get(this.FILES_DB_NAME, fileId);
  }

  private async getFileFromRemoteDb(fileId: string): Promise<IFile> {
    // Get source code for file from remote DB and cache it locally.
    await this.openFilesLocalDb();

    const file = await this.http.get<IFile>(`${await this.configService.getApiPrefix()}/file/${fileId}`).toPromise();
    this.storeFileInLocalDb(file);

    return file;
  }

  private async storeFileInLocalDb(file: IFile): Promise<void> {
    await this.openFilesLocalDb();
    await this.filesDb.put(this.FILES_DB_NAME, file, file.id);
  }


  async updateFileAsAdmin(file: IFile): Promise<IFile> {
    return this.http.put<IFile>(
      `${await this.configService.getApiPrefix()}/file/${file.id}`,
      file,
      this.httpOptions
    ).toPromise();
  }
}
