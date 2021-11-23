import { IEntity } from './entity.interface';
import { IProject } from './project.interface';
import { IResponse } from './response.interface';
import { IUser } from './user.interface';

export interface IFile extends IEntity {
  timeUpdated: Date;
  path: string;
  project: IProject;
  name: string;
  numRequiredResponses: number;
  isAcceptingResponses: boolean;
  isActive: boolean;
  source: string;
  assignedUsers: IUser[];
  responses: IResponse[];
}
