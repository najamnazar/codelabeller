import { IEntity } from "./entity.interface";
import { IResponse } from "./response.interface";

export interface IDesignPattern extends IEntity {
  name: string;
  isActive: boolean;
  explanationRequired: boolean;
  responses: IResponse[];
  responseCount: number;
}
