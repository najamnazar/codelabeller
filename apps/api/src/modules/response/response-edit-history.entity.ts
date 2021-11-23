import { Entity, Column, ManyToOne } from "typeorm";
import { IDesignPattern, IResponse, IResponseEditHistory } from '@codelabeller/api-interfaces';
import { BaseEntity } from '../../common/base-entity.class';
import { DesignPattern } from '../design-pattern/design-pattern.entity';
import { Response } from '../response/response.entity';

@Entity()
export class ResponseEditHistory extends BaseEntity implements IResponseEditHistory {
  @ManyToOne(type => Response, dpResponse => dpResponse.editHistory, { eager: true, nullable: false })
  originalResponse: IResponse;

  @ManyToOne(type => DesignPattern, designPattern => designPattern.responses, { eager: true, nullable: true })
  designPattern: IDesignPattern;

  @Column("varchar", { nullable: true })
  otherPatternIdentified: string;

  @Column("varchar", { nullable: true })
  patternExplanation: string;

  @Column("int", { nullable: true })
  confidenceRating: number;

  @Column("varchar", { nullable: true })
  ratingExplanation: string;

  @Column("varchar", { nullable: true })
  summary: string;

  @Column("varchar", { nullable: true })
  notes: string;

  @ManyToOne(type => DesignPattern, designPattern => designPattern.responses, { eager: true, nullable: true })
  newDesignPattern: IDesignPattern;

  @Column("varchar", { nullable: true })
  newOtherPatternIdentified: string;

  @Column("varchar", { nullable: true })
  newPatternExplanation: string;

  @Column("int", { nullable: false })
  newConfidenceRating: number;

  @Column("varchar", { nullable: true })
  newRatingExplanation: string;

  @Column("varchar", { nullable: false })
  newSummary: string;

  @Column("varchar", { nullable: true })
  newNotes: string;
}
