import { IEntity } from "./entity.interface";
import { IFile } from "./file.interface";

export interface IProject extends IEntity {
  name: string;
  isActive: boolean;
  files: IFile[];
}
