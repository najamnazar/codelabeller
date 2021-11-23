import { Injectable } from '@nestjs/common';
import { getConnectionManager } from 'typeorm';
import { Option } from '../option/option.entity';

@Injectable()
export class OptionService {
  private static readonly dbConnName = process.env.DB_CONN_NAME;

  async getOptionObject<T>(optionKeyName: string): Promise<Option<T>> {
    return await getConnectionManager()
      .get(OptionService.dbConnName)
      .createQueryBuilder(Option, "option")
      .where("option.name = :oName", { oName: optionKeyName })
      .orderBy("option.timeCreated", "DESC") // Get latest version of the option's value.
      .getOne() as Option<T>;
  }

  async saveOptionObject<T>(option: Option<T>): Promise<Option<T>> {
    return await getConnectionManager()
      .get(OptionService.dbConnName)
      .getRepository(Option)
      .save(option);
  }

  // Usage in static context only returns raw key values, not Options object.
  static async getOption<T>(keyName: string, defaultValue: any): Promise<T | any> {
    const result: Option<T | any> = await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Option)
      .findOne({
        where: { "name": keyName },
        order: { "timeCreated": "DESC" }
      });

    if (!result) {
      return defaultValue;
    }

    return result.value;
  }

  static async saveOption<T>(keyName: string, value: T): Promise<void> {
    await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Option)
      .insert({
        name: keyName,
        value: value
      });
  }
}
