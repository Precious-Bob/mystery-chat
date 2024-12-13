import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

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

    let profileLink = sanitizedBase;
    let counter = 1;

    // Ensure link is unique
    while (await this.isProfileLinkTaken(profileLink)) {
      profileLink = `${sanitizedBase}${counter}`;
      counter++;
    }

    return profileLink;
  }

  // Check if profile link already exists
  private async isProfileLinkTaken(profileLink: string): Promise<boolean> {
    const existingUser = await this.userRepo.findOne({
      where: { profileLink },
    });
    return !!existingUser;
  }
}
