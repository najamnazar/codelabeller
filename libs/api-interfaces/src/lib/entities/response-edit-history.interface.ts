import { IEntity } from './entity.interface';
import { IDesignPattern } from './design-pattern.interface';
import { IResponse } from './response.interface';

export interface IResponseEditHistory extends IEntity {
  originalResponse: IResponse;

  designPattern: IDesignPattern;
  otherPatternIdentified: string;
  patternExplanation: string;
  confidenceRating: number;
  ratingExplanation: string;
  summary: string;
  notes: string;

  newDesignPattern: IDesignPattern;
  newOtherPatternIdentified: string;
  newPatternExplanation: string;
  newConfidenceRating: number;
  newRatingExplanation: string;
  newSummary: string;
  newNotes: string;
}
