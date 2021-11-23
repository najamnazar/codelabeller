import { Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { IResponse, IUser } from '@codelabeller/api-interfaces';
import { BaseEntity  } from '../../common/base-entity.class';
import { Response } from '../response/response.entity';
import { File } from '../file/file.entity';

@Entity()
export class User extends BaseEntity implements IUser {
  @Column("datetime", { nullable: true })
  lastSeen: Date;

  @Column("boolean", { nullable: false, default: true })
  isEnabled: boolean;

  @Column("boolean", { nullable: false, default: false })
  isAdmin: boolean;

  @Column("varchar", { nullable: false, unique: true })
  email: string;

  @Column("varchar", { nullable: false })
  givenName: string;

  @Column("varchar", { nullable: false })
  familyName: string;

  @ManyToOne(type => File, file => file.assignedUsers, { nullable: true, eager: true })
  currentFile: File;

  @OneToMany(type => Response, response => response.submittedBy, { nullable: true, cascade: true, eager: false })
  responses: IResponse[];

  responseCount: number;
}
