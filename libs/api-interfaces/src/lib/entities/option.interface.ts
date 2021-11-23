import { IEntity } from "./entity.interface";

export interface IOption<T> extends IEntity {
  name: string;
  value: T;
}
