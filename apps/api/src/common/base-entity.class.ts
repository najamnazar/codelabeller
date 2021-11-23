import { PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { IEntity } from '@codelabeller/api-interfaces';

export class BaseEntity implements IEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  timeCreated: Date;
}
