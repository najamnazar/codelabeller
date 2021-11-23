import { Entity, OneToMany, ManyToOne, Column } from "typeorm";
import { IProjectFileUploadJob } from '@codelabeller/api-interfaces';
import { BaseEntity } from '../../common/base-entity.class';
import { Project } from "../project/project.entity";
import { ProjectFileUploadJobLine } from "./project-file-upload-job-line.entity";

@Entity()
export class ProjectFileUploadJob extends BaseEntity implements IProjectFileUploadJob {
  // User friendly ID for display
  @Column('varchar', { nullable: false, unique: true })
  jobId: string;

  @ManyToOne(type => Project, project => project.fileUploadJobs, { nullable: true, eager: true })
  project: Project;

  archiveFilePath: string;

  @Column('varchar', { select: false })
  archiveFileName: string;

  @Column('boolean', { default: false, nullable: false })
  isCompleted: boolean;

  @Column('boolean', { default: false, nullable: false })
  isFailed: boolean;

  @Column('int', { default: 0, nullable: false })
  numDoneTasks: number;

  @Column('int', { default: 0, nullable: false })
  numTargetTasks: number;

  @OneToMany(type => ProjectFileUploadJobLine, jobLine => jobLine.parentJob, { nullable: true, eager: false })
  jobLines: ProjectFileUploadJobLine[];
}
