import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: Repository<UserEntity>) {}

  async createUser() {
    return {
      status: 'error',
      message: 'This route is not defined! please use /signup instead',
    };
  }

  async getByProfileLink(profileLink: string) {
    try {
      const data = await this.userRepo.findOne({
        where: { profileLink },
        select: ['id', 'profileLink', 'email', 'username'],
      });
      if (!data) throw new NotFoundException('profile not found!');
      return { message: 'successful', data };
    } catch (e) {
      throw e;
    }
  }
}
