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
import { SigninDto, SignupDto, ForgotPasswordDto } from 'src/dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly emailservice: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match!');
      }
      dto.password = await argon.hash(dto.password);
      const user = this.userRepo.create(dto);
      await user.save();
      const token = await this.signToken(user.id, user.email);
      await this.emailservice.sendWelcomeMail(user);
      return { message: 'Successfully signed up', token };
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
      const token = await this.signToken(user.id, user.email);
      return { message: 'Successfully signed in', token };
    } catch (e) {
      throw e;
    }
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('credentials incorrect');

    // Generate reset token
    const resetToken = this.jwt.signAsync(
      { userId: user.id, email: user.email },
      {
        expiresIn: '1800',
        secret: this.config.get('JWT_RESET_SECRET'),
      },
    );

    // Save reset token to user entity
    user.resetToken = await resetToken;
    await this.userRepo.save(user);

    // Send email with reset link
    // const resetLink = `http://your-app.com/reset-password/${resetToken}`;
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Implement email sending logic here
    await this.emailservice.sendResetPasswordMail(user, resetLink);
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
