import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse, IResponseEditHistory } from '@codelabeller/api-interfaces';
import { openDB, deleteDB, IDBPDatabase } from 'idb';
import { ConfigService } from '../config/config.service';
import { FileService } from '../file/file.service';
import { PageService } from '../page/page.service';
import { SubmissionStatus } from './submission-status.enum';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  private readonly RESPONSES_DB_NAME = 'responses';
  private responsesDb !: IDBPDatabase<IResponse>;

  constructor(private fileService: FileService, private configService: ConfigService, private http: HttpClient, private pageService: PageService) {
    this.openResponsesLocalDb();
  }

  async openResponsesLocalDb() {
    this.responsesDb = await openDB(this.RESPONSES_DB_NAME, 1, {
      upgrade(db: IDBPDatabase<IResponse>) {
        db.createObjectStore(db.name);
      }
    });
  }

  async deleteResponsesLocalDb() {
    this.responsesDb?.close();
    return await deleteDB(this.RESPONSES_DB_NAME);
  }

  async getLocalResponse(userId: string, fileId: string): Promise<IResponse> {
    await this.openResponsesLocalDb();
    return await this.responsesDb.get(this.RESPONSES_DB_NAME, this.getKey(userId, fileId));
  }

  async storeLocalResponse(userId: string, fileId: string, response: IResponse) {
    await this.openResponsesLocalDb();
    await this.responsesDb.put(this.RESPONSES_DB_NAME, response, this.getKey(userId, fileId));
  }

  async clearLocalResponse(userId: string, fileId: string) {
    await this.openResponsesLocalDb();
    await this.responsesDb.delete(this.RESPONSES_DB_NAME, this.getKey(userId, fileId));
  }

  async getRemoteResponse(fileId: string): Promise<IResponse> {
    return await this.http.get<IResponse>(`${await this.configService.getApiPrefix()}/file/${fileId}/response`).toPromise();
  }

  async submitResponse(response: IResponse): Promise<SubmissionStatus> {
    if (!this.fileService.currentFile$.value) {
      return SubmissionStatus.FAILED;
    }

    const responseToSend = {
      ...response,
      file: this.fileService.currentFile$.value
    } as IResponse;

    // Remove source code as it is unnecessary to be sent back to the server and may cause the request entity size limit to be exceeded.
    responseToSend.file.source = '';

    if (this.fileService.hasSubmittedCurrentFile$.value) {
      // Update existing response
      await this.updateDesignPatternResponse(responseToSend);
      return SubmissionStatus.UPDATED;

    } else {
      // Submit new response
      await this.submitDesignPatternResponse(responseToSend);
      return SubmissionStatus.CREATED;
    }
  }

  async getAllResponses(): Promise<IResponse[]> {
    return await this.http.get<IResponse[]>(`${await this.configService.getApiPrefix()}/response`).toPromise();
  }

  async getAllResponsesAsAdmin(): Promise<IResponse[]> {
    return await this.http.get<IResponse[]>(`${await this.configService.getApiPrefix()}/response/admin`).toPromise();
  }

  async getEditHistoryAsAdmin(responseId: string): Promise<IResponseEditHistory[]> {
    return await this.http.get<IResponseEditHistory[]>(`${await this.configService.getApiPrefix()}/response/${responseId}/editHistory`).toPromise();
  }

  private async submitDesignPatternResponse(response: IResponse): Promise<IResponse> {
    return this.http.post<IResponse>(
      `${await this.configService.getApiPrefix()}/response`,
      response,
      this.httpOptions
    ).toPromise();
  }

  private async updateDesignPatternResponse(response: IResponse): Promise<IResponse> {
    return this.http.put<IResponse>(
      `${await this.configService.getApiPrefix()}/response/file/${response.file.id}`,
      response,
      this.httpOptions
    ).toPromise();
  }

  private getKey(userId: string, fileId: string) {
    return `${fileId}::${userId}`;
  }
}
