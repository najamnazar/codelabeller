import { IResponse } from '../entities/response.interface';
import { InvalidAttributeError } from './invalid-attribute.error';

export function validateDesignPatternResponse(designPatternResponse: IResponse): void {
  if (!designPatternResponse.submittedBy) {
    throw new InvalidAttributeError(`The design pattern response does not have a specified submitter.`)
  }

  if (!designPatternResponse.file) {
    throw new InvalidAttributeError(`The design pattern response does not have a specified file.`)
  }

  if (designPatternResponse.designPattern === undefined && !designPatternResponse.otherPatternIdentified) {
    throw new InvalidAttributeError(`The design pattern identified was set to other, but no pattern name was manually specified.`)
  }

  if (designPatternResponse.designPattern && designPatternResponse.otherPatternIdentified && designPatternResponse.otherPatternIdentified.trim() !== "") {
    throw new InvalidAttributeError(`The design pattern response cannot have both a listed pattern and manually specified pattern submitted together.`)
  }

  if (!designPatternResponse.confidenceRating && designPatternResponse.confidenceRating != 0) {
    throw new InvalidAttributeError(`The design pattern response does not have a confidence level specified.`)
  }

  if (designPatternResponse.confidenceRating < 0 || designPatternResponse.confidenceRating > 5) {
    throw new InvalidAttributeError(`The confidence level for the selected design pattern is not in range of 0 to 5 inclusive.`)
  }
}