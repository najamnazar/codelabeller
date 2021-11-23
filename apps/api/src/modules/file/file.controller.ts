import { Body, Controller, ForbiddenException, Get, InternalServerErrorException, NotFoundException, Param, Put, Req, UseGuards } from '@nestjs/common';
import { promises as fs } from 'fs';
import { sep } from 'path';
import { FileStatus } from '@codelabeller/api-interfaces';
import { FileService } from './file.service';
import { File } from './file.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ResponseService } from '../response/response.service';
import { Response } from '../response/response.entity';
import { AdminGuard } from '../../guards/admin-guard';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly responseService: ResponseService,
    private readonly userService: UserService
  ) { }

  @Get("/next")
  async getNextFile(@Req() request: Request): Promise<File> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    const file = await this.fileService.getNextFile(user);
    if (!file) {
      return null;
    }

    try {
      file.source = await this.readFileSource(file);

    } catch (error) {
      await this.handleMissingFile(file.id, user);
      throw new InternalServerErrorException("Could not fetch the requested file due to an internal error. Please refresh the page and try clicking on the 'Back to current file' button.");
    }

    return file;
  }

  @Get("/:fileId")
  async get(@Param('fileId') fileId: string, @Req() request: Request): Promise<File> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    // If a file is not active but is both currently assigned to the user and still accepting responses, serve the user the file.
    let skipFileActiveCheck = false;
    if (await this.fileService.isNextFile(user, fileId)) {
      skipFileActiveCheck = true;
    }

    const file = await this.fileService.get(fileId, skipFileActiveCheck);
    if (!file) {
      throw new NotFoundException("The requested file does not exist.");
    }

    try {
      file.source = await this.readFileSource(file);

    } catch (error) {
      await this.handleMissingFile(file.id, user);
      throw new InternalServerErrorException("Could not fetch the requested file due to an internal error. Please refresh the page and try clicking on the 'Back to current file' button.");
    }

    return file;
  }

  @Get("/:fileId/status")
  async status(@Param('fileId') fileId: string, @Req() request: Request): Promise<FileStatus> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    const fileStatus = await this.fileService.fileStatusForUser(user, fileId);

    if (!fileStatus) {
      throw new NotFoundException("The requested file does not exist.")
    }

    return fileStatus;
  }

  @Get("/:fileId/response")
  async getResponse(@Param('fileId') fileId: string, @Req() request: Request): Promise<Response> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    const response = await this.responseService.getResponseSubmittedByUserForFile(user, fileId);

    if (!response) {
      throw new NotFoundException("No response was found for the specified file.")
    }

    return response;
  }

  @Put("/:fileId")
  @UseGuards(AdminGuard)
  async updateFileAsAdmin(@Req() request: Request, @Param('fileId') fileId: string, @Body() file: File): Promise<File> {
    let fileBeingUpdated = await this.fileService.get(fileId, true);
    
    // Do not allow ID and time created attributes to be updated.
    delete file.id;
    delete file.timeCreated;
    delete file.path;
    delete file.project;
    delete file.name;

    if (!fileBeingUpdated) {
      throw new NotFoundException('The file specified was not found.');
    }

    fileBeingUpdated = {...fileBeingUpdated, ...file};

    return await this.fileService.save(fileBeingUpdated);
  }

  private async readFileSource(file: File): Promise<string> {
    const filePath = `${process.env.CORPUS_ABSOLUTE_PATH}${sep}${file.project.name}${sep}${file.path || ""}${sep}${file.name}`;
    return await fs.readFile(filePath, 'utf-8');
  }

  private async handleMissingFile(fileId: string, user: User) {
    // File was not found on disk, so deactivate and stop accepting responses for that file.
    await this.fileService.stopFileFromReceivingResponses(fileId);
    await this.fileService.deactivateFile(fileId);
    await this.fileService.removeAssignedFile(user);
  }

  private async getUserFromRequest(request: Request): Promise<User> {
    const userEmail: string = request['userClaims'].email;
    return await this.userService.getUserFromEmail(userEmail);
  }
}
