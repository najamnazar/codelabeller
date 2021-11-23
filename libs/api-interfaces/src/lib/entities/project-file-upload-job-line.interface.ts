import { IEntity } from "./entity.interface";

export interface IProjectFileUploadJobLine extends IEntity {
  isDone: boolean;
  isRejected: boolean;
  messages: string[];
}