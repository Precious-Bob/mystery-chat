import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileLinkGenerator {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // Generate unique profile link
  async generate(baseUsername: string): Promise<string> {
    // Sanitize username
    const sanitizedBase = baseUsername
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);

    // Ensure link is unique (there's probably no way an ununique username is getting past the dto validation shar)
    let profileSlug = sanitizedBase;
    let counter = 1;
    while (await this.isProfileSlugTaken(profileSlug)) {
      profileSlug = `${sanitizedBase}${counter}`;
      counter++;
    }
    return profileSlug;
  }

  // Check if profile link already exists
  private async isProfileSlugTaken(
    profileSlugOrLink: string,
  ): Promise<boolean> {
    const existingUser = await this.userRepo.findOne({
      where: { profileSlugOrLink },
    });
    return !!existingUser;
  }
}
