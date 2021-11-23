import { IEntity } from './entity.interface';
import { IUser } from './user.interface';
import { IFile } from './file.interface';
import { IDesignPattern } from './design-pattern.interface';
import { IResponseEditHistory } from './response-edit-history.interface';

export interface IResponse extends IEntity {
  submittedBy: IUser;
  file: IFile;
  lastUpdated: Date;
  designPattern: IDesignPattern;
  otherPatternIdentified: string;
  patternExplanation: string;
  confidenceRating: number;
  ratingExplanation: string;
  summary: string;
  notes: string;
  editHistory: IResponseEditHistory[];
}
