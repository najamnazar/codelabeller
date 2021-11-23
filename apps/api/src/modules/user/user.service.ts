import { Injectable } from '@nestjs/common';
import { DeleteResult, getConnectionManager } from 'typeorm';
import { UserAuthProvider } from '../../middleware/auth/user-auth-provider.interface';
import { OptionService } from '../option/option.service';
import { User } from '../user/user.entity';

@Injectable()
export class UserService implements UserAuthProvider {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  async getUserFromEmail(userEmail: string) {
    // Get the user object from the provided email address
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(User, 'user')
      .where('LOWER(user.email) = LOWER(:email)', { email: userEmail })
      .getOne();
  }

  async isAdmin(userEmail: string): Promise<boolean> {
    // Get the user object from the provided email address
    const count = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(User, 'user')
      .where('LOWER(user.email) = LOWER(:email)', { email: userEmail })
      .andWhere('user.isAdmin IS TRUE')
      .getCount();

    if (count == 0) {
      return false;
    }

    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(User, 'user')
      .loadRelationCountAndMap("user.responseCount", "user.responses")
      .leftJoinAndSelect('user.currentFile', 'currentFile')
      .leftJoinAndSelect('currentFile.project', 'project')
      .getMany();
  }

  async getUser(userId: string): Promise<User> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(User, 'user')
      .loadRelationCountAndMap("user.responseCount", "user.responses")
      .leftJoinAndSelect('user.currentFile', 'currentFile')
      .leftJoinAndSelect('currentFile.project', 'project')
      .whereInIds(userId)
      .getOne();
  }

  async createUser(user: User) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(User)
      .save(user);
  }

  async updateUser(originalUserObject: User, updatedUserObject: User) {
    delete updatedUserObject.id;
    for (const key of Object.keys(updatedUserObject)) {
      originalUserObject[key] = updatedUserObject[key];
    }

    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(User)
      .save(originalUserObject);
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(User)
      .delete(userId);
  }

  async updateLastSeen(userEmail: string, time = new Date()) {
    await getConnectionManager()
      .get(process.env.DB_CONN_NAME)
      .createQueryBuilder()
      .update(User)
      .set({ lastSeen: time })
      .where("LOWER(email) = LOWER(:email)", { email: userEmail })
      .execute();
  }

  async areUnlistedUsersAllowed(): Promise<boolean> {
    return await OptionService.getOption<boolean>('unlistedUsersAllowed', false);
  }
}
