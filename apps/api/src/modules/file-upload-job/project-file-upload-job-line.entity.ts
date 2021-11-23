import { Entity, Column, ManyToOne } from "typeorm";
import { IProjectFileUploadJobLine } from '@codelabeller/api-interfaces';
import { BaseEntity } from '../../common/base-entity.class';
import { ProjectFileUploadJob } from "./project-file-upload-job.entity";

@Entity()
export class ProjectFileUploadJobLine extends BaseEntity implements IProjectFileUploadJobLine {
  @ManyToOne(type => ProjectFileUploadJob, job => job.jobLines, { nullable: true, eager: false })
  parentJob: ProjectFileUploadJob;

  @Column("boolean", { nullable: false, default: false })
  isDone: boolean;

  @Column("boolean", { nullable: false, default: false })
  isRejected: boolean;

  @Column("simple-json")
  messages: string[];
}
