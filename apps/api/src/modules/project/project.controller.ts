import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { AdminGuard } from '../../guards/admin-guard';
import { File } from '../file/file.entity';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Get("/admin")
  @UseGuards(AdminGuard)
  async getProjectsAsAdmin(): Promise<Project[]> {
    const projects = await this.projectService.getAllProjects();
    
    for (const project of projects) {
      let totalResponsesRequired = 0;
      let totalResponsesSubmitted = 0;
  
      for (const file of project.files) {
        // Disabled/inactive files are not included in the response ratio count.
        if (file.isActive) {
          totalResponsesRequired += file.numRequiredResponses;
          totalResponsesSubmitted += file.responses.length;
        }
      }

      project['totalResponsesRequired'] = totalResponsesRequired;
      project['totalResponsesSubmitted'] = totalResponsesSubmitted;
      project['responseRatio'] = totalResponsesRequired != 0 ? (totalResponsesSubmitted / totalResponsesRequired * 100).toFixed(2) : '-';
    }

    return projects;
  }

  @Post("/")
  @UseGuards(AdminGuard)
  async createProjectAsAdmin(@Body() project: Project): Promise<Project> {
    if (await this.projectService.getProjectWithName(project.name)) {
      throw new ConflictException('The project with that name already exists.');
    }

    return await this.projectService.saveProject(project);
  }

  @Patch("/:projectId")
  @UseGuards(AdminGuard)
  async updateProjectAsAdmin(@Param('projectId') projectId: string, @Body() project: Project): Promise<Project> {
    const existingProject = await this.projectService.getBasic(projectId);

    if (!existingProject) {
      throw new NotFoundException('The project with the specified ID was not found.');
    }

    return await this.projectService.saveProject(project);
  }

  @Delete("/:projectId")
  @UseGuards(AdminGuard)
  async deleteProjectAsAdmin(@Param('projectId') projectId: string): Promise<void> {
    const project = await this.projectService.getProjectWithFilesOnly(projectId);

    if (!project) {
      throw new NotFoundException('The project specified was not found.');
    }

    if (project.files.length > 0) {
      throw new ConflictException('The project cannot be deleted as it contains files.')
    }

    await this.projectService.deleteProject(projectId);
  }

  @Get("/:projectId/files")
  async getFiles(@Param('projectId') projectId: string): Promise<File[]> {

    const files = await this.projectService.getFiles(projectId);

    return files.map(file => {
      delete file.timeCreated;
      delete file.isActive;
      delete file.isAcceptingResponses;
      delete file.numRequiredResponses;

      return file;
    });
  }

  @Post("/:projectId/file")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AdminGuard)
  async uploadFile(@Param('projectId') projectId: string, @UploadedFile() archiveFile: Express.Multer.File) {
    return { jobId: await this.projectService.uploadProjectFiles(projectId, archiveFile.destination, archiveFile.filename) };
  }
}
