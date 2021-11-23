import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUser } from '@codelabeller/api-interfaces';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private configService: ConfigService, private http: HttpClient) { }

  async getAllUsersAsAdmin(): Promise<IUser[]> {
    return await this.http.get<IUser[]>(`${await this.configService.getApiPrefix()}/user`).toPromise();
  }

  async addUserAsAdmin(user: IUser): Promise<IUser> {
    return this.http.post<IUser>(
      `${await this.configService.getApiPrefix()}/user`,
      user,
      this.httpOptions
    ).toPromise();
  }

  async updateUserAsAdmin(user: IUser): Promise<IUser> {
    return this.http.put<IUser>(
      `${await this.configService.getApiPrefix()}/user/${user.id}`,
      user,
      this.httpOptions
    ).toPromise();
  }

  async deleteUserAsAdmin(user: IUser): Promise<IUser> {
    return this.http.delete<IUser>(`${await this.configService.getApiPrefix()}/user/${user.id}`).toPromise();
  }

  async removeUserFileAssignmentAsAdmin(user: IUser): Promise<IUser> {
    return this.http.delete<IUser>(`${await this.configService.getApiPrefix()}/user/${user.id}/assignedFile`).toPromise();
  }
}
