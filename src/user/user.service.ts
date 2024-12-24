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

  //pagination
  async getAllUsers(page = 1, limit = 10) {
    const [data, total] = await this.userRepo.findAndCount({
      skip: page > 0 ? (page - 1) * limit : 0,
      take: limit,
    });
    const links = this.createPaginationLinks(page, limit, total);
    return {
      total,
      page,
      limit,
      data,
      links,
    };
  }

  private createPaginationLinks(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      first: `/users?page=1&limit=${limit}`,
      prev: page > 1 ? `/users?page=${page - 1}&limit=${limit}` : null,
      next: page < totalPages ? `/users?page=${page + 1}&limit=${limit}` : null,
      last: `/users?page=${totalPages}&limit=${limit}`,
    };
  }
}
