import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { paginationDto } from 'src/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create() {
    return this.userService.createUser();
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllUsers(@Query() dto: paginationDto) {
    return await this.userService.getAllUsers(page, limit);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@User() user: UserEntity) {
    return this.userService.getById(user.id);
  }
}
