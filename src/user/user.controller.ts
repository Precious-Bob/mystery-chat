import { Controller, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create() {
    return this.userService.createUser();
  }

  async getProfile(@Request() req) {
    const data = req.user;
    return data;
  }
}
