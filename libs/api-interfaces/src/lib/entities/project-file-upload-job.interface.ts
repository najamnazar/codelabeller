import { IEntity } from "./entity.interface";
import { IProjectFileUploadJobLine } from "./project-file-upload-job-line.interface";
import { IProject } from "./project.interface";

export interface IProjectFileUploadJob extends IEntity {
  jobId: string;
  project: IProject;
  archiveFilePath: string;
  archiveFileName: string;
  jobLines: IProjectFileUploadJobLine[];
}