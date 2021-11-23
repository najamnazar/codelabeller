import { FileStatus, FileResponseSubmissionCheck } from '@codelabeller/api-interfaces';
import { Injectable } from '@nestjs/common';
import { getConnectionManager } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { User } from '../user/user.entity';
import { File } from './file.entity';

@Injectable()
export class FileService {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  constructor(private readonly responseService: ResponseService) { }

  async getNextFile(user: User): Promise<File> {
    const nextFile: File = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(File, "file")
      .innerJoinAndSelect("file.project", "project")
      .innerJoin("file.assignedUsers", "user")
      .where("user.id = :uId", { uId: user.id })
      .getOne();

    // If user does not already have a next file or if it becomes unavailable for responses, assign them with a random, new one.
    if (!nextFile || !nextFile.isAcceptingResponses || !(await this.canUserSubmitFile(user, nextFile.id)).status) {
      return await this.setNewNext(user);
    }

    return nextFile;
  }

  async get(fileId: string, skipFileActiveCheck = false): Promise<File> {
    let query = getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(File, "file")
      .innerJoinAndSelect("file.project", "project")
      .leftJoinAndSelect("file.responses", "responses")
      .where("file.id = :fId", { fId: fileId });

    if (!skipFileActiveCheck) {
      query = query.andWhere("file.isActive IS TRUE");
    }

    return await query.getOne();
  }

  async save(file: File) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(File)
      .save(file);
  }

  async setNewNext(user: User): Promise<File> {
    if (!user) {
      return null;
    }

    // The next assigned file will be a file which the user has not yet responded to,
    // is active, accepting responses, has not achieved the required number of responses.
    // The files with the smallest difference between the current count of responses and the required number of responses are prioritised.
    const nextFile = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(File, "file")
      .leftJoinAndSelect("file.project", "project") // Project data should always be included with a file.
      .leftJoin("file.responses", "responses")
      .where("file.isActive") // Inactive files are hidden from users.
      .andWhere("file.isAcceptingResponses") // Files should not be assigned if they are no longer accepting responses.
      .andWhere("project.isActive") // Files should not be assigned if the project they are under is not currently active/enabled.
      .andWhere(queryBuilder => {
        // Exclude files which the user has already responded to.
        const subQuery = queryBuilder.subQuery()
          .select("file2.id")
          .from(File, "file2")
          .leftJoin("file2.responses", "responses2")
          .leftJoin("responses2.submittedBy", "user2")
          .where("user2.id = :uId", { uId: user.id })
          .getQuery();

        return "file.id NOT IN " + subQuery;
      })
      .having("COUNT(responses.id) < file.numRequiredResponses") // Files are only candidates for assignment when they still require responses.
      .groupBy("file.id")
      .orderBy("file.numRequiredResponses - COUNT(responses.id)", "ASC") // Files nearing completion are prioritised.
      .getOne();

    if (nextFile){
      user.currentFile = nextFile;
    } else {
      user.currentFile = null;
    }
    
    await getConnectionManager()
      .get(process.env.DB_CONN_NAME)
      .getRepository(User)
      .save(user);

    return nextFile;
  }

  async fileStatusForUser(currentUser: User, fileId: string): Promise<FileStatus> {
    const isNextFile = await this.isNextFile(currentUser, fileId);
    const hasSubmitted = await this.responseService.hasSubmittedResponseForFile(currentUser, fileId);

    return {
      isAssigned: isNextFile,
      canSubmit: !hasSubmitted && isNextFile && (await this.canUserSubmitFile(currentUser, fileId)).status === true,
      hasSubmitted: hasSubmitted,
    } as FileStatus;
  }

  async isNextFile(user: User, fileId: string): Promise<boolean> {
    const nextFile = await this.getNextFile(user);

    if (nextFile && nextFile.id === fileId) {
      return true;
    }

    return false;
  }

  /**
   * This method is used to check if a new response can be submitted for a specified file.
   * It should not be used to check if the user has been assigned the specified file,
   * nor be used to check if they can submit an update to a previously submitted response for the specified file.
   * 
   * @param user 
   * @param fileId 
   * @returns 
   */
  async canUserSubmitFile(user: User, fileId: string): Promise<FileResponseSubmissionCheck> {
    // Check if user has already submitted their response for the file.
    if (await this.responseService.getUserResponseCountForFile(user, fileId) > 0) {
      return {
        status: false,
        message: "Your response was already submitted for this file."
      };
    }

    // Check if responses are still being accepted for the file.
    // If the project is not active, the file will not be accepting responses either.
    if (!(await this.isFileAcceptingResponses(fileId))) {
      return {
        status: false,
        message: "No responses are currently being accepted for this file."
      };
    }

    // Check if the file already has enough responses.
    if (await this.doesFileHaveEnoughResponses(fileId)) {
      return {
        status: false,
        message: "There are already enough responses for this file."
      };
    }

    return {
      status: true,
      message: "OK"
    };
  }

  async removeAssignedFile(user: User): Promise<User> {
    // Remove the currently assigned file.
    user.currentFile = null;

    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(User)
      .save(user);
  }

  async isFileAcceptingResponses(fileId: string): Promise<boolean> {
    const file = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(File, "file")
      .leftJoinAndSelect("file.project", "project")
      .where("file.id = :fId", { fId: fileId })
      .andWhere("file.isAcceptingResponses")
      .andWhere("project.isActive")
      .getOne();

    if (file) {
      return true;
    }

    return false;
  }

  async doesFileHaveEnoughResponses(fileId: string): Promise<boolean> {
    const file = await this.get(fileId);
    if (!file) {
      return false;
    }

    const responseCount = await this.responseService.getTotalResponseCountForFile(fileId);

    if (responseCount < file.numRequiredResponses) {
      return false;
    }

    return true;
  }

  async deactivateFile(fileId: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder()
      .update(File)
      .set({ isActive: false })
      .where("id = :id", { id: fileId })
      .execute();
  }

  async stopFileFromReceivingResponses(fileId: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder()
      .update(File)
      .set({ isAcceptingResponses: false })
      .where("id = :id", { id: fileId })
      .execute();
  }
}
