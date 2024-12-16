import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly config: ConfigService,
  ) {}

  async createUser() {
    return {
      status: 'error',
      message: 'This route is not defined! please use /signup instead',
    };
  }

  async getByProfile(id: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        select: ['profileSlugOrLink', 'email', 'username'],
      });

      if (user) {
        const baseURL = this.config.get('DEV_APP_URL');
        const profileLink = `${baseURL}${user.profileSlugOrLink}`;
        user.profileSlugOrLink = profileLink;
      } else {
        throw new NotFoundException('profile not found!');
      }
      return { message: 'successful', user };
    } catch (e) {
      throw e;
    }
  }
}
