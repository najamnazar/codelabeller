import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin-guard';
import { DesignPattern } from './design-pattern.entity';
import { DesignPatternService } from './design-pattern.service';

@Controller('design-pattern')
export class DesignPatternController {

  constructor(private readonly designPatternService: DesignPatternService) { }

  @Get("/")
  async getAllActive(): Promise<DesignPattern[]> {
    const designPatterns: DesignPattern[] = await this.designPatternService.getAll();

    return designPatterns.map(pattern => {
      delete pattern.timeCreated;
      delete pattern.isActive;
      return pattern;
    });
  }

  @Get("/all")
  @UseGuards(AdminGuard)
  async getAllAsAdmin(): Promise<DesignPattern[]> {
    const designPatterns: DesignPattern[] = await this.designPatternService.getAllIncludingInactive();

    return designPatterns;
  }

  @Post("/")
  @UseGuards(AdminGuard)
  async createDesignPatternAsAdmin(@Body() designPattern: DesignPattern): Promise<DesignPattern> {
    if (await this.designPatternService.getDesignPatternWithName(designPattern.name)) {
      throw new ConflictException('The design pattern with that name already exists.');
    }

    return await this.designPatternService.createDesignPattern(designPattern);
  }

  @Put("/:designPatternId")
  @UseGuards(AdminGuard)
  async updateDesignPatternAsAdmin(@Req() request: Request, @Param('designPatternId') designPatternId: string, @Body() designPattern: DesignPattern): Promise<DesignPattern> {
    const patterns = await this.designPatternService.getAllIncludingInactive();
    
    // Do not allow ID and time created attributes to be updated.
    delete designPattern.id;
    delete designPattern.timeCreated;

    let thePattern = patterns.find(pattern => {
      return pattern.id == designPatternId;
    })

    if (!thePattern) {
      throw new NotFoundException('The design pattern specified was not found.');
    }

    thePattern = {...thePattern, ...designPattern};

    return await this.designPatternService.save(thePattern);
  }

  @Delete("/:designPatternId")
  @UseGuards(AdminGuard)
  async deleteProjectAsAdmin(@Param('designPatternId') designPatternId: string): Promise<void> {
    const designPattern = await this.designPatternService.getDesignPatternWithResponsesOnly(designPatternId);

    if (!designPattern) {
      throw new NotFoundException('The design pattern specified was not found.');
    }

    if (designPattern.responseCount > 0) {
      throw new ConflictException('The design pattern cannot be deleted as it has already been used to label responses.')
    }

    await this.designPatternService.deleteDesignPattern(designPatternId);
  }
}
