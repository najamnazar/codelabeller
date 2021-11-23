import { validateDesignPatternResponse } from '@codelabeller/api-interfaces';
import { Injectable } from '@nestjs/common';
import { getConnectionManager } from 'typeorm';
import { User } from '../user/user.entity';
import { ResponseEditHistory } from './response-edit-history.entity';
import { Response } from './response.entity';

@Injectable()
export class ResponseService {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  async getResponsesSubmittedByUser(user: User): Promise<Response[]> {
    return this.getDesignPatternResponseQuery()
      .where("response.submittedBy = :user", { user: user.id })
      .getMany();
  }

  async getAllResponses(): Promise<Response[]> {
    return this.getAllResponsesQuery()
      .getMany();
  }

  async getResponseEditHistory(responseId: string): Promise<ResponseEditHistory[]> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(ResponseEditHistory, "responseEditHistory")
      .leftJoinAndSelect("responseEditHistory.designPattern", "designPattern")
      .leftJoinAndSelect("responseEditHistory.newDesignPattern", "newDesignPattern")
      .leftJoin("responseEditHistory.originalResponse", "originalResponse")
      .where("originalResponse.id = :rId", { rId: responseId })
      .orderBy("responseEditHistory.timeCreated", "DESC")
      .getMany();
  }

  async getResponseSubmittedByUserForFile(user: User, fileId: string): Promise<Response> {
    return this.getDesignPatternResponseQuery()
      .where("response.submittedBy = :user", { user: user.id })
      .andWhere("file.id = :fId", { fId: fileId })
      .getOne();
  }

  async submitResponse(submittedBy: User, designPatternResponse: Response): Promise<Response> {
    designPatternResponse.submittedBy = submittedBy;
    validateDesignPatternResponse(designPatternResponse);

    const result = await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Response)
      .save(designPatternResponse);

    // Create an initial edit history for this response,
    // so that all versions of the response including initial submission can be read just by looking at the new--- properties of its edit history objects.
    const editHistory = {
      originalResponse: result,
      newDesignPattern: result.designPattern,
      newOtherPatternIdentified: result.otherPatternIdentified,
      newPatternExplanation: result.patternExplanation,
      newConfidenceRating: result.confidenceRating,
      newRatingExplanation: result.ratingExplanation,
      newSummary: result.summary,
      newNotes: result.notes
    } as ResponseEditHistory;

    await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ResponseEditHistory)
      .save(editHistory);

    return result;
  }

  async updateResponse(user: User, fileId: string, updatedResponse: Response): Promise<Response> {
    updatedResponse.submittedBy = user;

    validateDesignPatternResponse(updatedResponse);

    // Get the user's current, existing response for a particular file.
    const currentResponse = await this.getResponseSubmittedByUserForFile(user, fileId);

    // Manually attach as user object might not be joined as part of the database query, and we have the user object already anyways.
    currentResponse.submittedBy = user;

    // TypeORM will ignore attributes with undefined values, so convert them to null.
    if (updatedResponse.designPattern === undefined) {
      updatedResponse.designPattern = null;
    }

    if (updatedResponse.otherPatternIdentified === undefined) {
      updatedResponse.otherPatternIdentified = null;
    }

    // Create and save the new edit history object before updating the values, as old values will be lost on update.
    const editHistory = {
      originalResponse: currentResponse,
      designPattern: currentResponse.designPattern,
      otherPatternIdentified: currentResponse.otherPatternIdentified,
      patternExplanation: currentResponse.patternExplanation,
      confidenceRating: currentResponse.confidenceRating,
      ratingExplanation: currentResponse.ratingExplanation,
      summary: currentResponse.summary,
      notes: currentResponse.notes,
      newDesignPattern: updatedResponse.designPattern,
      newOtherPatternIdentified: updatedResponse.otherPatternIdentified,
      newPatternExplanation: updatedResponse.patternExplanation,
      newConfidenceRating: updatedResponse.confidenceRating,
      newRatingExplanation: updatedResponse.ratingExplanation,
      newSummary: updatedResponse.summary,
      newNotes: updatedResponse.notes
    } as ResponseEditHistory;

    await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ResponseEditHistory)
      .save(editHistory);

    // Update the values stored in the current response with updated values, and save to database.
    for (const key of Object.keys(updatedResponse)) {
      currentResponse[key] = updatedResponse[key];
    }

    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Response)
      .save(currentResponse);
  }

  async getTotalResponseCountForFile(fileId: string): Promise<number> {
    return getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Response)
      .count({
        where: {
          file: { id: fileId }
        }
      });
  }

  async getUserResponseCountForFile(user: User, fileId: string): Promise<number> {
    return getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Response)
      .count({
        where: {
          submittedBy: user,
          file: { id: fileId }
        }
      });
  }

  async hasSubmittedResponseForFile(user: User, fileId: string): Promise<boolean> {
    const count = await this.getUserResponseCountForFile(user, fileId)

    if (count > 0) {
      return true;
    }

    return false;
  }

  private getDesignPatternResponseQuery() {
    return getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(Response, "response")
      .leftJoinAndSelect("response.file", "file")
      .leftJoinAndSelect("file.project", "project")
      .leftJoin("response.designPattern", "designPattern")
      .addSelect('designPattern.id')
      .addSelect('designPattern.name')
      .addSelect('designPattern.explanationRequired')
      .orderBy("response.timeCreated", "DESC")
  }

  private getAllResponsesQuery() {
    return getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(Response, "response")
      .leftJoinAndSelect("response.file", "file")
      .leftJoinAndSelect("file.project", "project")
      .leftJoinAndSelect("response.designPattern", "designPattern")
      .leftJoinAndSelect("response.submittedBy", "user")
      .orderBy("response.timeCreated", "DESC")
  }
}
