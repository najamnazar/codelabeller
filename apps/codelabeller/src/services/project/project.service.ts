import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProject } from '@codelabeller/api-interfaces';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private configService: ConfigService, private http: HttpClient) { }

  async getAllProjectsAsAdmin(): Promise<IProject[]> {
    return await this.http.get<IProject[]>(`${await this.configService.getApiPrefix()}/project/admin`).toPromise();
  }

  async addProjectAsAdmin(project: IProject): Promise<IProject> {
    return this.http.post<IProject>(
      `${await this.configService.getApiPrefix()}/project`,
      project,
      this.httpOptions
    ).toPromise();
  }

  async updateProjectAsAdmin(project: IProject): Promise<IProject> {
    return this.http.patch<IProject>(`${await this.configService.getApiPrefix()}/project/${project.id}`,
      project,
      this.httpOptions
    ).toPromise();
  }

  async deleteProjectAsAdmin(project: IProject): Promise<IProject> {
    return this.http.delete<IProject>(`${await this.configService.getApiPrefix()}/project/${project.id}`).toPromise();
  }

  async addProjectFilesAsAdmin(project: IProject, zippedFiles: Blob) {
    const formData = new FormData();
    formData.append('file', zippedFiles);

    return this.http.post<any>(
      `${await this.configService.getApiPrefix()}/project/${project.id}/file`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }
}
