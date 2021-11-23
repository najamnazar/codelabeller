import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin-guard';
import { FileService } from '../file/file.service';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private fileService: FileService) { }

  @Get("/")
  @UseGuards(AdminGuard)
  async getUsersAsAdmin(): Promise<User[]> {
    const allUsers: User[] = await this.userService.getAllUsers();

    return allUsers;
  }

  @Post("/")
  @UseGuards(AdminGuard)
  async createUserAsAdmin(@Body() user: User): Promise<User> {
    if (await this.userService.getUserFromEmail(user.email)) {
      throw new ConflictException('The user with that email address already exists.');
    }

    return await this.userService.createUser(user);
  }

  @Get('/is-admin')
  async getIsAdmin(@Req() request: Request): Promise<boolean> {
    const userEmail: string = request['userClaims'].email;

    return await this.userService.isAdmin(userEmail);
  }

  @Put("/:userId")
  @UseGuards(AdminGuard)
  async updateUserAsAdmin(@Req() request: Request, @Param('userId') userId: string, @Body() updatedUser: User): Promise<User> {
    if (request['currentUser'].id == userId) {
      // Prevent users from updating their own isEnabled and isAdmin states to prevent accidental self-lockouts.
      delete updatedUser.isEnabled;
      delete updatedUser.isAdmin;
    }

    const user = await this.userService.getUser(userId);

    if (!user) {
      throw new NotFoundException('The user specified was not found.');
    }

    return await this.userService.updateUser(user, updatedUser);
  }

  @Delete("/:userId")
  @UseGuards(AdminGuard)
  async deleteUserAsAdmin(@Req() request: Request, @Param('userId') userId: string): Promise<void> {
    if (request['currentUser'].id == userId) {
      throw new ConflictException("You cannot delete your own account.")
    }

    const user = await this.userService.getUser(userId);

    if (!user) {
      throw new NotFoundException('The user specified was not found.');
    }

    if (user.responseCount > 0) {
      throw new ConflictException('The user cannot be deleted as they have already submitted responses.')
    }

    await this.userService.deleteUser(userId);
  }

  @Delete("/:userId/assignedFile")
  @UseGuards(AdminGuard)
  async removeUserFileAssignmentAsAdmin(@Param('userId') userId: string): Promise<void> {
    const user = await this.userService.getUser(userId);

    if (!user) {
      throw new NotFoundException('The user specified was not found.');
    }

    await this.fileService.removeAssignedFile(user);
  }
}
