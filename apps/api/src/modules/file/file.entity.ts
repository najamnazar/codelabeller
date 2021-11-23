import { Entity, Column, ManyToOne, OneToMany, Unique, UpdateDateColumn } from "typeorm";
import { IResponse, IFile, IProject } from '@codelabeller/api-interfaces';
import { BaseEntity } from '../../common/base-entity.class';
import { Project } from '../project/project.entity';
import { User } from '../user/user.entity';
import { Response } from '../response/response.entity';

@Entity()
@Unique(['project', 'path', 'name'])
export class File extends BaseEntity implements IFile {
  @UpdateDateColumn()
  timeUpdated: Date;

  @Column("varchar", { nullable: true })
  path: string;

  @ManyToOne(type => Project, project => project.files, { nullable: false, eager: true, cascade: true })
  project: IProject;

  @Column("varchar", { nullable: false })
  name: string;

  @Column("int", { nullable: true, default: null })
  numRequiredResponses: number;

  @Column("boolean", { nullable: false, default: true })
  isAcceptingResponses: boolean;

  // Inactive files will not be shown to users, but can still accept responses if isAcceptingResponses is true.
  // Files need to be both active and accepting responses in order to be assigned to a user.
  @Column("boolean", { nullable: false, default: true })
  isActive: boolean;

  source: string;

  @OneToMany(type => User, user => user.currentFile, { nullable: true })
  assignedUsers: User[];

  @OneToMany(type => Response, response => response.file, { nullable: true, eager: false })
  responses: IResponse[];
}
