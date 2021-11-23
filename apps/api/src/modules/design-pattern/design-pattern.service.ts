import { Injectable } from '@nestjs/common';
import { DeleteResult, getConnectionManager } from 'typeorm';
import { DesignPattern } from './design-pattern.entity';

@Injectable()
export class DesignPatternService {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  private noneOption = new DesignPattern();

  constructor() {
    this.noneOption.id = null;
    this.noneOption.name = '-No Pattern-';
    this.noneOption.explanationRequired = false;
  }

  async getAll(): Promise<DesignPattern[]> {
    const patterns = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(DesignPattern, "designPattern")
      .where("designPattern.isActive IS TRUE")
      .orderBy("designPattern.name")
      .getMany();

    patterns.unshift(this.noneOption);

    return patterns;
  }

  async getAllIncludingInactive(): Promise<DesignPattern[]> {
    const patterns = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(DesignPattern, "designPattern")
      .loadRelationCountAndMap("designPattern.responseCount", "designPattern.responses")
      .orderBy("designPattern.name")
      .getMany();

    return patterns;
  }

  async save(designPattern: DesignPattern) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(DesignPattern)
      .save(designPattern);
  }

  async getDesignPatternWithResponsesOnly(designPatternId: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(DesignPattern, "designPattern")
      .loadRelationCountAndMap("designPattern.responseCount", "designPattern.responses")
      .where("designPattern.id = :dpId", { dpId: designPatternId })
      .getOne();
  }
  
  async getDesignPatternWithName(designPatternName: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(DesignPattern, "designPattern")
      .leftJoinAndSelect("designPattern.responses", "responses")
      .where("designPattern.name = :dpName", { dpName: designPatternName })
      .getOne();
  }

  async createDesignPattern(designPattern: DesignPattern): Promise<DesignPattern> {
    return await this.save(designPattern);
  }

  async deleteDesignPattern(designPatternId: string): Promise<DeleteResult> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(DesignPattern)
      .delete(designPatternId);
  }
}
