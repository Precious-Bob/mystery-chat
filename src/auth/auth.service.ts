import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { SigninDto, SignupDto } from 'src/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async signup(dto: SignupDto) {
    try {
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match!');
      }
      dto.password = await argon.hash(dto.password);
      const user = this.userRepo.create(dto);
      await user.save();
      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('Credentials alredy exists!');
      }
      throw e;
    }
  }

  async signin({ email, password }: SigninDto) {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) throw new NotFoundException('Credentials incorrect');

      const validPassword = await argon.verify(user.password, password);
      if (!validPassword) throw new NotFoundException('Credentials incorrect');
      return this.signToken(user.id, user.email);
    } catch (e) {
      throw e;
    }
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '10m',
      secret: this.config.get('JWT_SECRET'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(
    token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.signToken(user.id, user.email);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token', e);
    }
  }
}
