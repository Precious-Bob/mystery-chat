import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createPaginationLinks } from 'src/utils/paginationLink.util';

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

  async getById(id: string) {
    try {
      const data = await this.userRepo.findOne({
        where: { id },
        select: ['profileSlugOrLink', 'email', 'username'],
      });

      if (data) {
        const baseURL = this.config.get('DEV_APP_URL');
        const profileLink = `${baseURL}${data.profileSlugOrLink}`;
        data.profileSlugOrLink = profileLink;
      }

      if (!data) throw new NotFoundException('profile not found!');
      return { message: 'successful', data };
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers(page = 1, limit = 10) {
    const [data, total] = await this.userRepo.findAndCount({
      skip: page > 0 ? (page - 1) * limit : 0,
      take: limit,
    });
    const links = createPaginationLinks(page, limit, total, 'users');
    return {
      total,
      page,
      limit,
      data,
      links,
    };
  }
}
