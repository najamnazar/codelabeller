import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Response } from './response.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ResponseService } from './response.service';
import { InvalidAttributeError } from '@codelabeller/api-interfaces';
import { FileService } from '../file/file.service';
import { ResponseEditHistory } from './response-edit-history.entity';
import { AdminGuard } from '../../guards/admin-guard';

@Controller('response')
export class ResponseController {
  private readonly invalidNewSubmissionErrorMessage = 'Cannot submit a new response for the specified file.';

  constructor(private readonly responseService: ResponseService, private readonly fileService: FileService, private readonly userService: UserService) { }

  @Get("/")
  async getSubmittedResponses(@Req() request: Request): Promise<Response[]> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    const submittedResponses: Response[] = await this.responseService.getResponsesSubmittedByUser(user);

    return submittedResponses.map(response => {
      if (response.designPattern) {
        delete response.designPattern["timeCreated"];
        delete response.designPattern.isActive;
      }

      delete response.file["project"]["timeCreated"];
      delete response.file["project"].isActive;

      delete response.file["timeCreated"];
      delete response.file.isActive;
      return response;
    });
  }

  @Post("/")
  async post(@Body() designPatternResponse: Response, @Req() request: Request): Promise<Response> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    if (!designPatternResponse.file) {
      throw new BadRequestException("No file was specified for the response.");
    }

    const check = await this.fileService.canUserSubmitFile(user, designPatternResponse.file.id);
    if (!check.status) {
      // Remove the user's currently assigned file as it no longer possible for them to submit a response for that file.
      await this.fileService.removeAssignedFile(user);
      throw new ConflictException(`Cannot submit a new response for the specified file. ${check.message}`);
    }

    if ((await this.fileService.getNextFile(user)).id != designPatternResponse.file.id) {
      throw new ConflictException(`${this.invalidNewSubmissionErrorMessage} You have not been assigned this file.`)
    }

    return this.responseService
      .submitResponse(user, designPatternResponse)
      .catch(error => {
        if (error instanceof InvalidAttributeError) {
          throw new BadRequestException(error.message);
        }

        throw new InternalServerErrorException(error.message);
      });
  }

  @Get("/admin")
  @UseGuards(AdminGuard)
  async getSubmittedResponsesAsAdmin(): Promise<Response[]> {
    const allResponses: Response[] = await this.responseService.getAllResponses();

    return allResponses.map(response => {
      if (response.designPattern) {
        delete response.designPattern["timeCreated"];
        delete response.designPattern.isActive;
      }

      delete response.file["project"]["timeCreated"];
      delete response.file["project"].isActive;

      delete response.file["timeCreated"];
      delete response.file.isActive;
      return response;
    });
  }

  @Put("/file/:fileId")
  async put(@Param('fileId') fileId: string, @Body() designPatternResponse: Response, @Req() request: Request): Promise<Response> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    if (!designPatternResponse.file) {
      throw new BadRequestException('No file was specified for the response.');
    }

    if (designPatternResponse.file.id !== fileId) {
      throw new BadRequestException('File ID specified in the request URL does not match the ID of the file attached to the response.')
    }

    if (!(await this.responseService.hasSubmittedResponseForFile(user, fileId))) {
      throw new ConflictException('There is no previous response to update for the file specified.');
    }

    return this.responseService
      .updateResponse(user, fileId, designPatternResponse)
      .catch(error => {
        if (error instanceof InvalidAttributeError) {
          throw new BadRequestException(error.message);
        }

        throw new InternalServerErrorException(error.message);
      });
  }

  @Get("/:responseId/editHistory")
  @UseGuards(AdminGuard)
  async getResponseEditHistoryAsAdmin(@Param('responseId') responseId: string): Promise<ResponseEditHistory[]> {
    const editHistories: ResponseEditHistory[] = await this.responseService.getResponseEditHistory(responseId);

    return editHistories.map(history => {
      if (history.designPattern) {
        delete history.designPattern["timeCreated"];
        delete history.designPattern.isActive;
      }

      return history;
    });
  }


  @Get("file/:fileId")
  async getSubmittedResponse(@Param('fileId') fileId: string, @Req() request: Request): Promise<Response> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new ForbiddenException("User was not found.");
    }

    const submittedResponse: Response = await this.responseService.getResponseSubmittedByUserForFile(user, fileId);

    if (!submittedResponse) {
      throw new NotFoundException();
    }

    if (submittedResponse.designPattern) {
      delete submittedResponse.designPattern["timeCreated"];
      delete submittedResponse.designPattern.isActive;
    }

    delete submittedResponse.file["project"]["timeCreated"];
    delete submittedResponse.file["project"].isActive;

    delete submittedResponse.file["timeCreated"];
    delete submittedResponse.file.isActive;

    return submittedResponse;
  }

  private async getUserFromRequest(request: Request): Promise<User> {
    const userEmail: string = request['userClaims'].email;
    return await this.userService.getUserFromEmail(userEmail);
  }
}
