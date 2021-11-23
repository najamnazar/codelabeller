import { IOption } from "@codelabeller/api-interfaces";
import { Entity, Column, Unique } from "typeorm";
import { BaseEntity } from '../../common/base-entity.class';

@Entity()
@Unique(['timeCreated', 'name'])
export class Option<T> extends BaseEntity implements IOption<T> {
  @Column("varchar", { nullable: false })
  name: string;

  @Column("simple-json", { nullable: true })
  value: T;
}
