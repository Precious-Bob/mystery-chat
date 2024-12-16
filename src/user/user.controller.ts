import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create() {
    return this.userService.createUser();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.userService.getByProfile(req.user.id);
  }
}
