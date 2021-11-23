import { BadRequestException, Body, Controller, Get, NotFoundException, Put, UseGuards } from '@nestjs/common';
import { OptionService } from './option.service';
import { Option } from './option.entity';
import { AdminGuard } from '../../guards/admin-guard';

@Controller('option')
export class OptionController {
  readonly UNLISTED_USERS_ALLOWED = 'unlistedUsersAllowed';
  readonly UPLOADED_FILES_ENABLED_BY_DEFAULT  = 'uploadedFilesEnabledByDefault';
  readonly UPLOADED_FILES_ACCEPTING_RESPONSES_BY_DEFAULT = 'uploadedFilesAcceptingResponsesByDefault';
  readonly UPLOADED_FILES_NUM_REQUIRED_RESPONSES_BY_DEFAULT = 'uploadedFilesNumRequiredResponsesByDefault';

  constructor(private optionsService: OptionService) { }

  @Get("/unlistedUsersAllowed")
  @UseGuards(AdminGuard)
  async getAllowUnlistedUsersAsAdmin(): Promise<Option<boolean>> {
    const unlistedUsersAllowed = await this.optionsService.getOptionObject<boolean>(this.UNLISTED_USERS_ALLOWED);

    if (!unlistedUsersAllowed) {
      throw new NotFoundException("The allow unlisted users option could not be fetched.")
    }

    return unlistedUsersAllowed;
  }

  @Put("/unlistedUsersAllowed")
  @UseGuards(AdminGuard)
  async putAllowUnlistedUsersAsAdmin(@Body() option: Option<boolean>): Promise<Option<boolean>> {
    if (option?.value !== true && option?.value !== false) {
      throw new BadRequestException("The value provided for the allow unlisted users option must be either true or false.");
    }

    option.name = this.UNLISTED_USERS_ALLOWED;

    return await this.optionsService.saveOptionObject(option);
  }

  @Get("/uploadedFilesEnabledByDefault")
  @UseGuards(AdminGuard)
  async getDefaultAreUploadedFilesEnabledAsAdmin(): Promise<Option<boolean>> {
    const uploadedFilesEnabledByDefault = await this.optionsService.getOptionObject<boolean>(this.UPLOADED_FILES_ENABLED_BY_DEFAULT);

    if (!uploadedFilesEnabledByDefault) {
      throw new NotFoundException("The uploaded files enabled by default option could not be fetched.")
    }

    return uploadedFilesEnabledByDefault;
  }

  @Put("/uploadedFilesEnabledByDefault")
  @UseGuards(AdminGuard)
  async putDefaultAreUploadedFilesEnabledAsAdmin(@Body() option: Option<boolean>): Promise<Option<boolean>> {
    if (option?.value !== true && option?.value !== false) {
      throw new BadRequestException("The value provided for the uploaded files enabled by default option must be either true or false.");
    }

    option.name = this.UPLOADED_FILES_ENABLED_BY_DEFAULT;

    return await this.optionsService.saveOptionObject(option);
  }

  @Get("/uploadedFilesAcceptingResponsesByDefault")
  @UseGuards(AdminGuard)
  async getDefaultAreUploadedFilesAcceptingResponsesAsAdmin(): Promise<Option<boolean>> {
    const uploadedFilesAcceptingResponsesByDefault = await this.optionsService.getOptionObject<boolean>(this.UPLOADED_FILES_ACCEPTING_RESPONSES_BY_DEFAULT);

    if (!uploadedFilesAcceptingResponsesByDefault) {
      throw new NotFoundException("The uploaded files accepting responses by default option could not be fetched.")
    }

    return uploadedFilesAcceptingResponsesByDefault;
  }

  @Put("/uploadedFilesAcceptingResponsesByDefault")
  @UseGuards(AdminGuard)
  async putDefaultAreUploadedFilesAcceptingResponsesAsAdmin(@Body() option: Option<boolean>): Promise<Option<boolean>> {
    if (option?.value !== true && option?.value !== false) {
      throw new BadRequestException("The value provided for the uploaded files accepting responses by defaultt option must be either true or false.");
    }

    option.name = this.UPLOADED_FILES_ACCEPTING_RESPONSES_BY_DEFAULT;

    return await this.optionsService.saveOptionObject(option);
  }

  @Get("/uploadedFilesNumRequiredResponsesByDefault")
  @UseGuards(AdminGuard)
  async getDefaultUploadedFilesNumRequiredResponsesAsAdmin(): Promise<Option<number>> {
    const uploadedFilesNumRequiredResponsesByDefault = await this.optionsService.getOptionObject<number>(this.UPLOADED_FILES_NUM_REQUIRED_RESPONSES_BY_DEFAULT);

    if (!uploadedFilesNumRequiredResponsesByDefault) {
      throw new NotFoundException("The default number of responses for uploaded files option could not be fetched.")
    }

    return uploadedFilesNumRequiredResponsesByDefault;
  }

  @Put("/uploadedFilesNumRequiredResponsesByDefault")
  @UseGuards(AdminGuard)
  async putDefaultUploadedFilesNumRequiredResponsesAsAdmin(@Body() option: Option<number>): Promise<Option<number>> {
    if (!(Number.isInteger(option?.value) && Number(option?.value) >= 0)) {
      throw new BadRequestException("The value provided for the default number of responses for uploaded files option must be a non-negative whole number.");
    }

    option.name = this.UPLOADED_FILES_NUM_REQUIRED_RESPONSES_BY_DEFAULT;

    return await this.optionsService.saveOptionObject(option);
  }
}
