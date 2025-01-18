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

  /**
   * Placeholder method for creating a user.
   * @returns {Object} - The response object indicating the route is not defined.
   */
  async createUser() {
    return {
      status: 'error',
      message: 'This route is not defined! please use /signup instead',
    };
  }

  /**
   * Retrieves a user by ID.
   * @param {string} id - The ID of the user.
   * @returns {Promise<Object>} - The response object containing the user details.
   * @throws {NotFoundException} - If the user is not found.
   */
  async getUser(id: string) {
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

  /**
   * Retrieves all users with pagination.
   * @param {number} [page=1] - The page number.
   * @param {number} [limit=10] - The number of users per page.
   * @returns {Promise<Object>} - The response object containing the users and pagination details.
   */
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
