import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileLinkGenerator {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly config: ConfigService,
  ) {}

  // Generate unique profile link
  async generate(baseUsername: string): Promise<string> {
    // Sanitize username
    const sanitizedBase = baseUsername
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);

    // Ensure link is unique (there's probably no way an ununique username is getting past the dto validation shar)
    let profileLink = sanitizedBase;
    let counter = 1;
    while (await this.isProfileLinkTaken(profileLink)) {
      profileLink = `${sanitizedBase}${counter}`;
      counter++;
    }
    const baseUrl = this.config.get('DEV_APP_URL');
    return `${baseUrl}/${profileLink}`;
  }

  // Check if profile link already exists
  private async isProfileLinkTaken(profileLink: string): Promise<boolean> {
    const existingUser = await this.userRepo.findOne({
      where: { profileLink },
    });
    return !!existingUser;
  }
}