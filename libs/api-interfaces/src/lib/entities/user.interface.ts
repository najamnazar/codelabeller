import { IEntity } from './entity.interface';
import { IResponse } from './response.interface';
import { IFile } from './file.interface';

export interface IUser extends IEntity {
  lastSeen: Date;
  isEnabled: boolean;
  isAdmin: boolean;
  email: string;
  givenName: string;
  familyName: string;
  currentFile: IFile;
  responses: IResponse[];
  responseCount: number;
}
