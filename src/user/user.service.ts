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
    const offset = (page - 1) * limit;
    const [data, total] = await this.userRepo.findAndCount({
      skip: offset,
      take: limit,
    });
    return {
      data,
      total,
      page,
      limit,
    };
  }

  // private createPaginationLinks(
  //   page: number,
  //   limit: number,
  //   total: number,
  //   baseUrl: string = '/books',
  // ) {
  //   const totalPages = Math.ceil(total / limit);
  //   const createLink = (targetPage: number) =>
  //     `${baseUrl}?page=${targetPage}&limit=${limit}`;

  //   return {
  //     first: createLink(1),
  //     prev: page > 1 ? createLink(page - 1) : null,
  //     next: page < totalPages ? createLink(page + 1) : null,
  //     last: createLink(totalPages),
  //   };
  // }
}
