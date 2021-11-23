import { Entity, Column, OneToMany } from "typeorm";
import { IDesignPattern, IResponse } from '@codelabeller/api-interfaces';
import { BaseEntity } from '../../common/base-entity.class';
import { Response } from '../response/response.entity';

@Entity()
export class DesignPattern extends BaseEntity implements IDesignPattern {
  @Column("varchar", { nullable: false })
  name: string

  @Column("boolean", { nullable: false, default: true })
  isActive: boolean;

  @Column("boolean", { nullable: false, default: false })
  explanationRequired: boolean;

  @OneToMany(type => Response, response => response.designPattern, { nullable: true, eager: false })
  responses: IResponse[];

  responseCount: number;
}
