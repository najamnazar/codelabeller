import { Entity, Column, OneToMany } from "typeorm";
import { IProject } from '@codelabeller/api-interfaces';
import { BaseEntity } from '../../common/base-entity.class';
import { File } from '../file/file.entity';
import { ProjectFileUploadJob } from "../file-upload-job/project-file-upload-job.entity";

@Entity()
export class Project extends BaseEntity implements IProject {
  @Column("varchar", { nullable: false, unique: true })
  name: string;

  @Column("boolean", { nullable: false, default: true })
  isActive: boolean;

  @OneToMany(type => ProjectFileUploadJob, projectFileUploadJob => projectFileUploadJob.project, { nullable: true, eager: false })
  fileUploadJobs: ProjectFileUploadJob[];

  @OneToMany(type => File, file => file.project, { nullable: true, eager: false })
  files: File[];
}
