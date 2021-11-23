import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProjectFileUploadJob } from '@codelabeller/api-interfaces';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectFileUploadJobService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient, private configService: ConfigService) { }

  async getAllFileUploadJobsAsAdmin() {
    return await this.http.get<IProjectFileUploadJob[]>(`${await this.configService.getApiPrefix()}/file-upload-job`).toPromise();
  }
}
