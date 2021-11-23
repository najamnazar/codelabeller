import { Entity, Column, ManyToOne, OneToMany, UpdateDateColumn, Unique } from "typeorm";
import { IDesignPattern, IResponse, IFile, IResponseEditHistory } from '@codelabeller/api-interfaces';
import { BaseEntity  } from '../../common/base-entity.class';
import { DesignPattern } from '../design-pattern/design-pattern.entity';
import { File } from '../file/file.entity';
import { User } from '../user/user.entity';
import { ResponseEditHistory } from './response-edit-history.entity';

@Entity()
@Unique(['submittedBy', 'file'])
export class Response extends BaseEntity implements IResponse {
  @ManyToOne(type => User, user => user.responses, { eager: true, nullable: false })
  submittedBy: User;

  @ManyToOne(type => File, file => file.responses, { eager: true, nullable: false })
  file: IFile;

  @UpdateDateColumn()
  lastUpdated: Date;

  @ManyToOne(type => DesignPattern, designPattern => designPattern.responses, { eager: true, nullable: true })
  designPattern: IDesignPattern;

  @Column("varchar", { nullable: true })
  otherPatternIdentified: string;

  @Column("varchar", { nullable: true })
  patternExplanation: string;

  @Column("int", { nullable: false })
  confidenceRating: number;

  @Column("varchar", { nullable: true })
  ratingExplanation: string;

  @Column("varchar", { nullable: false })
  summary: string;

  @Column("varchar", { nullable: true })
  notes: string;

  @OneToMany(type => ResponseEditHistory, history => history.originalResponse)
  editHistory: IResponseEditHistory[];
}
